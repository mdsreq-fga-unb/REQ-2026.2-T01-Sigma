"""Regras do Termo de autorização de uso de imagem (UC04).

Fluxos tratados: preenchimento (FP01), edição (FA01), histórico de edições (FA04),
campos obrigatórios (FE01) e nada salvo pela metade (FE04).

O termo é **por matrícula**: salvar o termo de uma matrícula nunca mexe nos termos de outras
matrículas do mesmo aluno. Quem assina é guardado no próprio termo, sem `Responsavel` nem `Pessoa`.
"""
import logging
import re
from typing import Any

from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.exceptions import (
    FalhaAoSalvarError,
    MatriculaNaoEncontradaError,
    ServidorIndisponivelError,
)
from app.models.aluno import Aluno
from app.models.matricula import Matricula
from app.models.ops import Tipo
from app.models.termo_imagem import TermoImagem
from app.models.user import Usuario
from app.repository import repository_termos
from app.schemas.termo_comum import AlunoTermoResponse, Caminho, valor_em
from app.schemas.termo_imagem import (
    ROTULOS,
    AutorizacaoImagemResponse,
    ResponsavelImagemResponse,
    TermoImagemResponse,
    TermoImagemUpdate,
    TextoTermoResponse,
    termo_completo,
)
from app.services import service_historico, service_pdf

logger = logging.getLogger(__name__)

NOME_TERMO = "Termo de autorização de uso de imagem"
TITULO_PDF = "Termo de Autorização de Uso de Imagem"
TEMPLATE_PDF = "fichas/termo_imagem.html"
PREFIXO_ARQUIVO_PDF = "termo-imagem"
# Texto integral do termo: ÚNICO arquivo, usado pela rota de texto e pelo PDF.
ARQUIVO_TEXTO = service_pdf.PASTA_TEMPLATES / "termos" / "uso_imagem.txt"

LIMITE_RESIDENTE_EM = 300  # tamanho da coluna TermoImagem.residente_em


# Montagem dos dados

def montar_endereco_aluno(aluno: Aluno) -> str:
    """Endereço do aluno em uma linha. Sugestão de "residente em" quando o termo ainda não existe.

    Mesmo formato usado pela migration do Bloco 4 para preencher `residente_em`:
    "Rua das Flores, nº 10, Centro, Águas Lindas de Goiás/GO, CEP 72910-000".
    """
    cidade = aluno.cidade or ""
    if aluno.uf_residencia:
        cidade = f"{cidade}/{aluno.uf_residencia}"
    partes = [
        aluno.logradouro,
        f"nº {aluno.numero}" if aluno.numero else None,
        aluno.bairro,
        cidade,
        f"CEP {aluno.cep}" if aluno.cep else None,
    ]
    return ", ".join(parte for parte in partes if parte)[:LIMITE_RESIDENTE_EM]


def _dados_do_termo(termo: TermoImagem | None, residente_em_sugerido: str = "") -> dict[str, Any]:
    """Estado do termo no mesmo formato do corpo da requisição (dicionário aninhado)."""
    if termo is None:
        return {
            "responsavel": {
                "nome": None,
                "nacionalidade": None,
                "estado_civil": None,
                "rg": None,
                "cpf": None,
                "residente_em": residente_em_sugerido,
            },
            "autorizacao": {"autoriza": None, "local": None, "data": None},
        }
    return {
        "responsavel": {
            "nome": termo.resp_nome,
            "nacionalidade": termo.resp_nacionalidade,
            "estado_civil": termo.resp_estado_civil,
            "rg": termo.resp_rg,
            "cpf": termo.resp_cpf,
            "residente_em": termo.residente_em,
        },
        "autorizacao": {"autoriza": termo.autorizacao, "local": termo.local, "data": termo.data},
    }


def _foto(termo: TermoImagem | None) -> dict[Caminho, Any]:
    """Fotografia do termo para comparar antes e depois de salvar (histórico de edições)."""
    dados = _dados_do_termo(termo)
    return {caminho: valor_em(dados, caminho) for caminho in ROTULOS}


def _valores_para_gravar(dados: TermoImagemUpdate) -> dict[str, Any]:
    responsavel, autorizacao = dados.responsavel, dados.autorizacao
    return {
        "resp_nome": responsavel.nome,
        "resp_nacionalidade": responsavel.nacionalidade,
        "resp_estado_civil": responsavel.estado_civil,
        "resp_rg": responsavel.rg,
        "resp_cpf": responsavel.cpf,
        "residente_em": responsavel.residente_em,
        "autorizacao": autorizacao.autoriza,
        "local": autorizacao.local,
        "data": autorizacao.data,
    }


def _montar_resposta(matricula: Matricula, termo: TermoImagem | None) -> TermoImagemResponse:
    """Resposta do GET e do PUT. Sem termo salvo: seções vazias, "residente em" sugerido e
    `completa` falso."""
    dados = _dados_do_termo(termo, residente_em_sugerido=montar_endereco_aluno(matricula.aluno))
    return TermoImagemResponse(
        aluno=AlunoTermoResponse.de_matricula(matricula),
        responsavel=ResponsavelImagemResponse(**dados["responsavel"]),
        autorizacao=AutorizacaoImagemResponse(**dados["autorizacao"]),
        completa=termo is not None and termo_completo(dados),
        created_at=termo.created_at if termo is not None else None,
        updated_at=termo.updated_at if termo is not None else None,
    )


def _buscar_matricula(db: Session, id_matricula: int) -> Matricula:
    try:
        matricula = repository_termos.buscar_matricula_com_termo_imagem(db, id_matricula)
    except SQLAlchemyError as exc:
        logger.error("Falha ao consultar o termo de imagem: %s", type(exc).__name__)
        raise ServidorIndisponivelError() from exc
    if matricula is None:
        raise MatriculaNaoEncontradaError()
    return matricula


# Casos de uso

def obter_termo(db: Session, id_matricula: int) -> TermoImagemResponse:
    """Termo da matrícula. 404 se a matrícula não existir."""
    matricula = _buscar_matricula(db, id_matricula)
    return _montar_resposta(matricula, matricula.termo_imagem)


def salvar_termo(
    db: Session,
    id_matricula: int,
    dados: TermoImagemUpdate,
    usuario: Usuario,
) -> TermoImagemResponse:
    """Cria ou atualiza o termo e registra o histórico, **tudo em uma única transação** (FE04).

    Idempotente: reenviar o mesmo termo não duplica nada e, se nada mudou, não gera registro de
    edição. O histórico guarda só os nomes dos campos alterados, nunca os valores (LGPD).
    """
    matricula = _buscar_matricula(db, id_matricula)
    try:
        termo_anterior = matricula.termo_imagem
        antes = _foto(termo_anterior)

        termo = repository_termos.criar_ou_atualizar_termo_imagem(db, matricula, _valores_para_gravar(dados))
        db.flush()

        if termo_anterior is None:
            # Primeira vez: registro de preenchimento.
            descricao = service_historico.descrever(NOME_TERMO, "preenchido", matricula.ano)
            service_historico.registrar(db, usuario, matricula.id_aluno, Tipo.PREENCHIMENTO_TERMO_IMAGEM, descricao)
        else:
            # Demais: registro de edição com os NOMES dos campos alterados. Nada mudou, nada registrado.
            alterados = service_historico.campos_alterados(antes, _foto(termo), ROTULOS)
            if alterados:
                descricao = service_historico.descrever(NOME_TERMO, "editado", matricula.ano, alterados)
                service_historico.registrar(db, usuario, matricula.id_aluno, Tipo.EDICAO_TERMO_IMAGEM, descricao)

        db.flush()
        db.refresh(termo, attribute_names=["created_at", "updated_at"])  # gerados pelo banco
        resposta = _montar_resposta(matricula, termo)  # montada antes do commit: sem recarregar nada depois
        db.commit()
    except SQLAlchemyError as exc:
        db.rollback()
        logger.error("Falha ao salvar o termo de imagem (matrícula %s): %s", id_matricula, type(exc).__name__)
        raise FalhaAoSalvarError() from exc
    except Exception:
        db.rollback()
        raise
    return resposta


def exportar_pdf(db: Session, id_matricula: int, usuario: Usuario) -> tuple[bytes, str]:
    """Gera o PDF do termo e registra a exportação. Devolve `(conteúdo, nome do arquivo)`.

    O PDF sai com o que está salvo (ou em branco, com o "residente em" sugerido, se o termo ainda
    não existe): é o mesmo conteúdo do GET.
    """
    matricula = _buscar_matricula(db, id_matricula)
    id_aluno, ano = matricula.id_aluno, matricula.ano
    termo = _montar_resposta(matricula, matricula.termo_imagem)

    conteudo = service_pdf.gerar_pdf(TEMPLATE_PDF, montar_contexto_pdf(termo))  # FalhaGeracaoPdfError -> 500

    try:
        descricao = service_historico.descrever(NOME_TERMO, "exportado em PDF", ano)
        service_historico.registrar(db, usuario, id_aluno, Tipo.EXPORTACAO_PDF, descricao)
        db.commit()
    except SQLAlchemyError as exc:
        db.rollback()
        logger.error("Falha ao registrar a exportação do termo de imagem: %s", type(exc).__name__)
        raise FalhaAoSalvarError("Não foi possível registrar a exportação. Tente novamente.") from exc

    nome_arquivo = service_pdf.nome_arquivo_pdf(PREFIXO_ARQUIVO_PDF, termo.aluno.nome, ano)
    return conteudo, nome_arquivo


# Texto do termo e contexto do PDF

def paragrafos_do_termo() -> list[str]:
    """Parágrafos do texto integral, lidos do arquivo único em `app/templates/termos`."""
    texto = ARQUIVO_TEXTO.read_text(encoding="utf-8")
    return [" ".join(paragrafo.split()) for paragrafo in re.split(r"\n\s*\n", texto) if paragrafo.strip()]


def obter_texto_termo() -> TextoTermoResponse:
    """Texto integral do termo (link "Ver texto completo do termo"). Igual ao do PDF."""
    return TextoTermoResponse(titulo=TITULO_PDF, texto="\n\n".join(paragrafos_do_termo()))


def montar_contexto_pdf(termo: TermoImagemResponse) -> dict[str, Any]:
    """Termo transformado em dicionário simples para o template. Nunca objetos ORM.

    CPF e datas seguem crus: os filtros do template (`cpf`, `data`) aplicam a máscara.
    """
    return {
        "titulo": TITULO_PDF,
        "ano_letivo": termo.aluno.ano_letivo,
        "aluno": {
            "nome": termo.aluno.nome,
            "data_nascimento": termo.aluno.data_nascimento,
            "etapa": termo.aluno.etapa,
        },
        "responsavel": termo.responsavel.model_dump(),
        "autoriza": termo.autorizacao.autoriza,  # True, False ou None (não respondido)
        "local": termo.autorizacao.local,
        "data": termo.autorizacao.data,
        "paragrafos_termo": paragrafos_do_termo(),
    }
