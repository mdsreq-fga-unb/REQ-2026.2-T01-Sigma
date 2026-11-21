"""Geração de PDF das fichas e termos da matrícula com Jinja2 + WeasyPrint (UC04).

Serviço genérico, reaproveitado por todas as fichas: cada uma informa só o nome do template
(em `app/templates`) e o contexto, um dicionário simples e já pronto para impressão. Nunca se
passam objetos ORM ao template.

- Existe **um único** ambiente Jinja2 (`ambiente`), com autoescape ativado para HTML. Os dados
  vêm de formulário: sem autoescape, um texto com HTML alteraria o documento.
- Nada é gravado em disco: o PDF volta em bytes.
- Nada externo é carregado: CSS, logo e fontes vêm de `app/templates` (`static/`). O
  WeasyPrint só pode abrir arquivos `file:` e `data:`; qualquer outro endereço é recusado.
- O WeasyPrint é importado só na hora de gerar o PDF. Sem as bibliotecas do sistema (Pango),
  a API sobe normalmente e só as rotas de PDF respondem 500.
"""
import logging
import re
import unicodedata
from datetime import date, datetime
from pathlib import Path
from typing import Any

from jinja2 import Environment, FileSystemLoader, StrictUndefined, select_autoescape

from app.core.exceptions import FalhaGeracaoPdfError
from app.core.tempo import agora_utc, para_sao_paulo

logger = logging.getLogger(__name__)

PASTA_TEMPLATES = Path(__file__).resolve().parent.parent / "templates"
# A barra final é necessária: sem ela, os endereços relativos (CSS, logo, fontes) são resolvidos
# a partir da pasta acima de `templates`.
BASE_URL = PASTA_TEMPLATES.as_uri() + "/"

NOME_CRECHE = "Centro de Educação Infantil Sociedade Estação Vida"


# ----------------------------------------------------------------------------------------
# Filtros de formatação para os templates
# ----------------------------------------------------------------------------------------


def _digitos(valor: Any) -> str:
    return re.sub(r"[^0-9]", "", str(valor)) if valor is not None else ""


def _como_veio(valor: Any) -> str:
    return "" if valor is None else str(valor)


def filtro_cpf(valor: Any) -> str:
    """000.000.000-00. Valor que não tem 11 dígitos sai como veio."""
    d = _digitos(valor)
    if len(d) != 11:
        return _como_veio(valor)
    return f"{d[:3]}.{d[3:6]}.{d[6:9]}-{d[9:]}"


def filtro_nis(valor: Any) -> str:
    """000.00000.00-0. Valor que não tem 11 dígitos sai como veio."""
    d = _digitos(valor)
    if len(d) != 11:
        return _como_veio(valor)
    return f"{d[:3]}.{d[3:8]}.{d[8:10]}-{d[10]}"


def filtro_telefone(valor: Any) -> str:
    """(00) 0000-0000 ou (00) 00000-0000. Valor com outro tamanho sai como veio."""
    d = _digitos(valor)
    if len(d) == 10:
        return f"({d[:2]}) {d[2:6]}-{d[6:]}"
    if len(d) == 11:
        return f"({d[:2]}) {d[2:7]}-{d[7:]}"
    return _como_veio(valor)


def filtro_data(valor: Any) -> str:
    """dd/mm/aaaa. Aceita `date` ou texto ISO (AAAA-MM-DD). Vazio sai em branco."""
    if isinstance(valor, str):
        try:
            valor = date.fromisoformat(valor)
        except ValueError:
            return valor
    if isinstance(valor, datetime):
        valor = valor.date()
    if isinstance(valor, date):
        return valor.strftime("%d/%m/%Y")
    return _como_veio(valor)


def filtro_data_hora(valor: Any) -> str:
    """dd/mm/aaaa às HH:MM."""
    if isinstance(valor, datetime):
        return valor.strftime("%d/%m/%Y às %H:%M")
    return filtro_data(valor)


def filtro_caixa(valor: Any) -> str:
    """Caixa marcada (☒) ou desmarcada (☐). Os símbolos existem na fonte DejaVu Sans."""
    return "\u2612" if valor else "\u2610"


def _criar_ambiente() -> Environment:
    ambiente = Environment(
        loader=FileSystemLoader(str(PASTA_TEMPLATES)),
        autoescape=select_autoescape(enabled_extensions=("html", "htm", "xml"), default_for_string=True),
        undefined=StrictUndefined,  # variável esquecida no contexto quebra o teste, não some do PDF
        trim_blocks=True,
        lstrip_blocks=True,
    )
    ambiente.filters.update(
        {
            "cpf": filtro_cpf,
            "nis": filtro_nis,
            "telefone": filtro_telefone,
            "data": filtro_data,
            "data_hora": filtro_data_hora,
            "caixa": filtro_caixa,
        }
    )
    ambiente.globals["nome_creche"] = NOME_CRECHE
    return ambiente


ambiente = _criar_ambiente()


# ----------------------------------------------------------------------------------------
# Geração
# ----------------------------------------------------------------------------------------


def renderizar_html(nome_template: str, contexto: dict[str, Any]) -> str:
    """Renderiza o template com o contexto. Toda ficha recebe também `gerado_em` (data e hora)."""
    dados = {"gerado_em": para_sao_paulo(agora_utc()), **contexto}
    return ambiente.get_template(nome_template).render(**dados)


def gerar_pdf(nome_template: str, contexto: dict[str, Any]) -> bytes:
    """Renderiza o template e converte para PDF. Devolve os bytes, sem gravar arquivo em disco.

    Lança `FalhaGeracaoPdfError` (HTTP 500) se o WeasyPrint não carregar ou a geração falhar.
    Só o tipo do erro vai para o log, porque o contexto tem dados pessoais (LGPD).
    """
    try:
        from weasyprint import HTML, URLFetcher
    except (ImportError, OSError) as exc:  # OSError: biblioteca do sistema (Pango) ausente
        logger.error("WeasyPrint indisponível: %s", type(exc).__name__)
        raise FalhaGeracaoPdfError() from exc

    try:
        html = renderizar_html(nome_template, contexto)
        # Um buscador por PDF: o objeto guarda estado e não deve ser compartilhado entre threads.
        buscador = URLFetcher(allowed_protocols={"file", "data"})
        return HTML(string=html, base_url=BASE_URL, url_fetcher=buscador).write_pdf()
    except Exception as exc:
        logger.error("Falha ao gerar o PDF do template %s: %s", nome_template, type(exc).__name__)
        raise FalhaGeracaoPdfError() from exc


def nome_arquivo_pdf(prefixo: str, nome_aluno: str, ano_letivo: int) -> str:
    """`<prefixo>-<nome-do-aluno>-<ano>.pdf`: sem acentos, sem espaços e em minúsculas."""
    sem_acentos = unicodedata.normalize("NFKD", nome_aluno).encode("ascii", "ignore").decode("ascii")
    nome = re.sub(r"[^a-z0-9]+", "-", sem_acentos.lower()).strip("-") or "aluno"
    return f"{prefixo}-{nome}-{ano_letivo}.pdf"
