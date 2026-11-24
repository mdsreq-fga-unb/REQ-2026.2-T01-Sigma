"""Testes do service genérico de PDF (app/services/service_pdf.py)."""
import logging
import re
import subprocess
import sys
from datetime import date, datetime
from pathlib import Path

import pytest

from app.core.exceptions import FalhaGeracaoPdfError
from app.services import service_pdf
from tests.fixtures_termos import pular_sem_pdf

RAIZ_DO_PROJETO = Path(__file__).resolve().parents[1]
NOME_COM_HTML = '<script>alert("oi")</script><b>Ana</b> & "Cia"'


def _contexto_imagem(nome_responsavel: str = "Maria") -> dict:
    return {
        "titulo": "Termo de Autorização de Uso de Imagem",
        "ano_letivo": 2026,
        "aluno": {"nome": "Ana", "data_nascimento": date(2022, 5, 10), "etapa": "Maternal I"},
        "responsavel": {
            "nome": nome_responsavel,
            "nacionalidade": None,
            "estado_civil": None,
            "rg": None,
            "cpf": "52998224725",
            "residente_em": "Rua A",
        },
        "autoriza": True,
        "local": "Águas Lindas de Goiás",
        "data": date(2026, 3, 9),
        "paragrafos_termo": ["Primeiro parágrafo.", "Segundo parágrafo."],
    }


def _contexto_saida(nome_responsavel: str = "Maria") -> dict:
    return {
        "titulo": "Termo de Autorização de Saída do Aluno",
        "ano_letivo": 2026,
        "aluno": {"nome": "Ana", "data_nascimento": date(2022, 5, 10), "etapa": "Maternal I", "periodo": "Integral"},
        "responsavel_nome": nome_responsavel,
        "formas_saida": [{"rotulo": "Outros", "marcada": True, "com_descricao": True, "descricao": "Vizinha"}],
        "pessoas": [{"numero": n, "nome": "", "parentesco": ""} for n in range(1, 5)],
        "observacao": "Aviso.",
        "local": "Águas Lindas de Goiás",
        "data": None,
    }


TEMPLATES = [
    ("fichas/termo_imagem.html", _contexto_imagem),
    ("fichas/termo_saida.html", _contexto_saida),
]


# ----------------------------------------------------------------------------------------
# Filtros de formatação
# ----------------------------------------------------------------------------------------


def test_filtro_cpf():
    assert service_pdf.filtro_cpf("52998224725") == "529.982.247-25"
    assert service_pdf.filtro_cpf("529.982.247-25") == "529.982.247-25"
    assert service_pdf.filtro_cpf("123") == "123"  # tamanho errado sai como veio
    assert service_pdf.filtro_cpf(None) == ""


def test_filtro_nis():
    assert service_pdf.filtro_nis("12345678901") == "123.45678.90-1"
    assert service_pdf.filtro_nis("123") == "123"
    assert service_pdf.filtro_nis(None) == ""


def test_filtro_telefone():
    assert service_pdf.filtro_telefone("6133334444") == "(61) 3333-4444"
    assert service_pdf.filtro_telefone("61999998888") == "(61) 99999-8888"
    assert service_pdf.filtro_telefone("999") == "999"
    assert service_pdf.filtro_telefone(None) == ""


def test_filtro_data():
    assert service_pdf.filtro_data(date(2026, 3, 9)) == "09/03/2026"
    assert service_pdf.filtro_data("2026-03-09") == "09/03/2026"
    assert service_pdf.filtro_data(datetime(2026, 3, 9, 14, 30)) == "09/03/2026"
    assert service_pdf.filtro_data(None) == ""
    assert service_pdf.filtro_data("texto qualquer") == "texto qualquer"


def test_filtro_data_hora():
    assert service_pdf.filtro_data_hora(datetime(2026, 3, 9, 14, 5)) == "09/03/2026 às 14:05"


def test_filtro_caixa_marcada_ou_desmarcada():
    assert service_pdf.filtro_caixa(True) == "☒"
    assert service_pdf.filtro_caixa(False) == "☐"
    assert service_pdf.filtro_caixa(None) == "☐"


def test_nome_do_arquivo_sem_acentos_sem_espacos_e_em_minusculas():
    assert service_pdf.nome_arquivo_pdf("termo-imagem", "José D'Ávila  Júnior", 2026) == "termo-imagem-jose-d-avila-junior-2026.pdf"
    assert service_pdf.nome_arquivo_pdf("termo-saida", "ANA BEATRIZ", 2025) == "termo-saida-ana-beatriz-2025.pdf"
    assert service_pdf.nome_arquivo_pdf("termo-saida", "!!!", 2025) == "termo-saida-aluno-2025.pdf"


# ----------------------------------------------------------------------------------------
# Jinja2: ambiente único, autoescape e nada externo
# ----------------------------------------------------------------------------------------


def test_o_ambiente_jinja_tem_autoescape_para_html():
    assert service_pdf.ambiente.autoescape("fichas/qualquer.html") is True


@pytest.mark.parametrize("template,contexto", TEMPLATES)
def test_html_digitado_no_formulario_aparece_como_texto(template, contexto):
    html = service_pdf.renderizar_html(template, contexto(NOME_COM_HTML))

    assert "<script>" not in html and "<b>Ana</b>" not in html
    assert "&lt;script&gt;" in html
    assert "&lt;b&gt;Ana&lt;/b&gt;" in html
    assert "&amp;" in html and "&#34;Cia&#34;" in html


@pytest.mark.parametrize("template,contexto", TEMPLATES)
def test_html_nao_referencia_nenhum_recurso_externo(template, contexto):
    html = service_pdf.renderizar_html(template, contexto())

    assert not re.search(r"(https?:)?//", html.replace("<!DOCTYPE", ""))  # sem http://, https:// nem //cdn
    css = (service_pdf.PASTA_TEMPLATES / "fichas" / "fichas.css").read_text(encoding="utf-8")
    assert not re.search(r"https?://|@import", css)


@pytest.mark.parametrize("template,contexto", TEMPLATES)
def test_tudo_que_o_html_usa_existe_em_app_templates(template, contexto):
    html = service_pdf.renderizar_html(template, contexto())

    referencias = re.findall(r'(?:href|src)="([^"]+)"', html)
    assert "fichas/fichas.css" in referencias and "static/logo.png" in referencias
    for referencia in referencias:
        assert (service_pdf.PASTA_TEMPLATES / referencia).is_file(), referencia
    for fonte in ("DejaVuSans.ttf", "DejaVuSans-Bold.ttf"):
        assert (service_pdf.PASTA_TEMPLATES / "static" / "fonts" / fonte).is_file()


def test_variavel_esquecida_no_contexto_quebra_em_vez_de_sumir_do_pdf():
    from jinja2 import UndefinedError

    contexto = _contexto_imagem()
    del contexto["autoriza"]

    with pytest.raises(UndefinedError):
        service_pdf.renderizar_html("fichas/termo_imagem.html", contexto)


# ----------------------------------------------------------------------------------------
# WeasyPrint
# ----------------------------------------------------------------------------------------


@pular_sem_pdf
@pytest.mark.parametrize("template,contexto", TEMPLATES)
def test_gerar_pdf_devolve_os_bytes_do_pdf(template, contexto):
    pdf = service_pdf.gerar_pdf(template, contexto())

    assert isinstance(pdf, bytes)
    assert pdf.startswith(b"%PDF") and pdf.rstrip().endswith(b"%%EOF")


@pular_sem_pdf
def test_pdf_nao_carrega_recurso_externo(monkeypatch, caplog):
    html = (
        '<html><head><link rel="stylesheet" href="https://example.invalid/x.css"></head>'
        '<body><p>Olá</p><img src="http://127.0.0.1:9/logo.png"></body></html>'
    )
    monkeypatch.setattr(service_pdf, "renderizar_html", lambda nome, contexto: html)

    with caplog.at_level(logging.WARNING, logger="weasyprint"):
        pdf = service_pdf.gerar_pdf("qualquer.html", {})

    assert pdf.startswith(b"%PDF")  # o documento sai, só que sem os recursos externos
    assert caplog.text.count("disallowed protocol") >= 2  # o buscador recusou o CSS e a imagem


def test_falha_na_geracao_vira_erro_de_pdf(monkeypatch):
    def explode(nome, contexto):
        raise RuntimeError("falha qualquer")

    monkeypatch.setattr(service_pdf, "renderizar_html", explode)

    with pytest.raises(FalhaGeracaoPdfError):
        service_pdf.gerar_pdf("fichas/termo_imagem.html", _contexto_imagem())


def test_sem_weasyprint_so_a_geracao_do_pdf_falha(monkeypatch):
    monkeypatch.setitem(sys.modules, "weasyprint", None)  # simula o pacote ou o Pango ausente

    with pytest.raises(FalhaGeracaoPdfError):
        service_pdf.gerar_pdf("fichas/termo_imagem.html", _contexto_imagem())


def test_importar_o_service_nao_carrega_o_weasyprint():
    """A API precisa subir em máquinas sem o Pango (ex.: Windows sem MSYS2)."""
    codigo = "import sys; import app.main; print('weasyprint' in sys.modules)"
    resultado = subprocess.run(
        [sys.executable, "-c", codigo], cwd=RAIZ_DO_PROJETO, capture_output=True, text=True, timeout=60
    )

    assert resultado.returncode == 0, resultado.stderr
    assert resultado.stdout.strip() == "False"
