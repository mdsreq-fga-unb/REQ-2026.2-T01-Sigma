"""Regras do Termo de compromisso escolar (UC04 / issue #107).

Fluxos: preenchimento (FP01), edição (FA01), histórico (FA04), obrigatórios (FE01), matrícula
inativa só para consulta (FE03 / RN10) e nada salvo pela metade (FE04). O termo é **por
matrícula** e guarda quem assina, sem `Responsavel` nem `Pessoa`.
"""
import logging
import re
from typing import Any

from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.exceptions import (
    FalhaAoSalvarError,
    MatriculaInativaError,
    MatriculaNaoEncontradaError,
    ServidorIndisponivelError,
)
from app.models.aluno import StatusAluno
from app.models.matricula import Matricula
from app.models.ops import Tipo
from app.models.termo_comp import ModalidadeEnsino, RegimeAtendimento, TermoCompromisso
from app.models.user import Usuario
from app.repository import repository_termos
from app.schemas.termo_comum import AlunoTermoResponse, Caminho
from app.schemas.termo_compromisso import (
    ROTULOS,
    ROTULOS_MODALIDADE,
    ROTULOS_REGIME,
    TermoCompromissoResponse,
    TermoCompromissoUpdate,
    termo_completo,
)
from app.services import service_historico, service_pdf

logger = logging.getLogger(__name__)

NOME_TERMO = "Termo de compromisso escolar"
TITULO_PDF = "Termo de Compromisso Escolar"
TEMPLATE_PDF = "fichas/termo_compromisso.html"
PREFIXO_ARQUIVO_PDF = "termo-compromisso"
# Normas do termo, tiradas do modelo em papel da creche. ÚNICO arquivo com o texto.
ARQUIVO_TEXTO = service_pdf.PASTA_TEMPLATES / "termos" / "compromisso_escolar.txt"
LEMBRETE_PDF = (
    "LEMBRE-SE: O INTERESSE EM ACOMPANHAR A VIDA ESCOLAR DOS SEUS FILHOS CONTRIBUI PARA QUE "
    "ELES APRENDAM MAIS, POIS UMA EDUCAÇÃO DE QUALIDADE COMEÇA EM CASA."
)
# Regime na frase "..., em <regime> na Educação Infantil" do termo.
FRASE_REGIME = {
    RegimeAtendimento.TEMPO_INTEGRAL: "tempo integral",
    RegimeAtendimento.PARCIAL_MATUTINO: "tempo parcial (matutino)",
    RegimeAtendimento.PARCIAL_VESPERTINO: "tempo parcial (vespertino)",
}
# Histórico: opções com o texto da tela, em vez do nome do enum.
FORMATADORES_HISTORICO = {
    ("modalidade",): service_historico.rotulo_de(ModalidadeEnsino, ROTULOS_MODALIDADE),
    ("regime",): service_historico.rotulo_de(RegimeAtendimento, ROTULOS_REGIME),
}
CAMPOS = ("nome_responsavel", "cpf_responsavel", "modalidade", "regime", "assinatura", "data_assinatura")


# Montagem dos dados

def _dados_do_termo(termo: TermoCompromisso | None) -> dict[str, Any]:
    """Estado do termo no formato do corpo da requisição. Sem termo: tudo vazio e não assinado."""
    return {campo: getattr(termo, campo, None) for campo in CAMPOS} | ({"assinatura": False} if termo is None else {})


def _foto(termo: TermoCompromisso | None) -> dict[Caminho, Any]:
    """Fotografia do termo para comparar antes e depois de salvar (histórico de edições)."""
    dados = _dados_do_termo(termo)
    return {caminho: dados[caminho[0]] for caminho in ROTULOS}


def _montar_resposta(matricula: Matricula, termo: TermoCompromisso | None) -> TermoCompromissoResponse:
    """Resposta do GET e do PUT. Sem termo salvo: campos vazios, dados do aluno e `completa` falso."""
    dados = _dados_do_termo(termo)
    return TermoCompromissoResponse(
        aluno=AlunoTermoResponse.de_matricula(matricula),
        **dados,
        completa=termo is not None and termo_completo(dados),
        created_at=getattr(termo, "created_at", None),
        updated_at=getattr(termo, "updated_at", None),
    )


def _buscar_matricula(db: Session, id_matricula: int) -> Matricula:
    try:
        matricula = repository_termos.buscar_matricula_com_termo_compromisso(db, id_matricula)
    except SQLAlchemyError as exc:
        logger.error("Falha ao consultar o termo de compromisso: %s", type(exc).__name__)
        raise ServidorIndisponivelError() from exc
    if matricula is None:
        raise MatriculaNaoEncontradaError()
    return matricula


# Casos de uso

def obter_termo(db: Session, id_matricula: int) -> TermoCompromissoResponse:
    """Termo da matrícula. 404 se a matrícula não existir. Consulta liberada mesmo se inativa."""
    matricula = _buscar_matricula(db, id_matricula)
    return _montar_resposta(matricula, matricula.termo_compromisso)


def salvar_termo(db: Session, id_matricula: int, dados: TermoCompromissoUpdate, usuario: Usuario) -> TermoCompromissoResponse:
    """Cria ou atualiza o termo e registra o histórico, **tudo em uma única transação** (FE04).

    Idempotente: se nada mudou, não gera registro de edição. A edição guarda em `alteracoes` o
    valor anterior e o novo de cada campo; o CPF é sensível e sai sem valores (LGPD).
    """
    matricula = _buscar_matricula(db, id_matricula)
    if matricula.aluno.status == StatusAluno.INATIVO:  # RN10 / FE03: só consulta (409), nada a desfazer
        raise MatriculaInativaError()
    try:
        termo_anterior = matricula.termo_compromisso
        antes = _foto(termo_anterior)
        termo = repository_termos.criar_ou_atualizar_termo_compromisso(db, matricula, dados.model_dump())
        db.flush()

        # Primeira vez: preenchimento. Demais: edição com os campos alterados, só se algo mudou.
        if termo_anterior is None:
            tipo, acao, alterados = Tipo.PREENCHIMENTO_TERMO_COMPROMISSO, "preenchido", []
        else:
            tipo, acao = Tipo.EDICAO_TERMO_COMPROMISSO, "editado"
            alterados = service_historico.itens_alterados(antes, _foto(termo), ROTULOS, NOME_TERMO, FORMATADORES_HISTORICO)
        if termo_anterior is None or alterados:
            descricao = service_historico.descrever(NOME_TERMO, acao, matricula.ano, service_historico.nomes(alterados))
            service_historico.registrar(db, usuario, matricula.id_aluno, tipo, descricao, alterados)

        db.flush()
        db.refresh(termo, attribute_names=["created_at", "updated_at"])  # gerados pelo banco
        resposta = _montar_resposta(matricula, termo)  # montada antes do commit: sem recarregar nada depois
        db.commit()
    except SQLAlchemyError as exc:
        db.rollback()
        logger.error("Falha ao salvar o termo de compromisso (matrícula %s): %s", id_matricula, type(exc).__name__)
        raise FalhaAoSalvarError() from exc
    except Exception:
        db.rollback()
        raise
    return resposta


def exportar_pdf(db: Session, id_matricula: int, usuario: Usuario) -> tuple[bytes, str]:
    """Gera o PDF (o mesmo conteúdo do GET, em branco se não houver termo) e registra a exportação.
    Devolve `(conteúdo, nome do arquivo)`. Exportar é consulta: liberado também para matrícula inativa."""
    matricula = _buscar_matricula(db, id_matricula)
    id_aluno, ano = matricula.id_aluno, matricula.ano
    termo = _montar_resposta(matricula, matricula.termo_compromisso)

    conteudo = service_pdf.gerar_pdf(TEMPLATE_PDF, montar_contexto_pdf(termo))  # FalhaGeracaoPdfError -> 500

    try:
        descricao = service_historico.descrever(NOME_TERMO, "exportado em PDF", ano)
        service_historico.registrar(db, usuario, id_aluno, Tipo.EXPORTACAO_PDF, descricao)
        db.commit()
    except SQLAlchemyError as exc:
        db.rollback()
        logger.error("Falha ao registrar a exportação do termo de compromisso: %s", type(exc).__name__)
        raise FalhaAoSalvarError("Não foi possível registrar a exportação. Tente novamente.") from exc

    return conteudo, service_pdf.nome_arquivo_pdf(PREFIXO_ARQUIVO_PDF, termo.aluno.nome, ano)


# Texto do termo e contexto do PDF

def paragrafos_do_termo() -> list[str]:
    """Parágrafos das normas, lidos do arquivo único em `app/templates/termos`."""
    texto = ARQUIVO_TEXTO.read_text(encoding="utf-8")
    return [" ".join(paragrafo.split()) for paragrafo in re.split(r"\n\s*\n", texto) if paragrafo.strip()]


def montar_contexto_pdf(termo: TermoCompromissoResponse) -> dict[str, Any]:
    """Termo em dicionário simples para o template (nunca objetos ORM). CPF e datas seguem crus:
    os filtros do template aplicam a máscara. Todas as opções entram, com a escolhida marcada."""
    return {
        "titulo": TITULO_PDF,
        "ano_letivo": termo.aluno.ano_letivo,
        "aluno": termo.aluno.model_dump(include={"nome", "data_nascimento", "etapa"}),
        "responsavel": {"nome": termo.nome_responsavel, "cpf": termo.cpf_responsavel},
        "modalidades": [{"rotulo": r, "marcada": termo.modalidade == o} for o, r in ROTULOS_MODALIDADE.items()],
        "regimes": [{"rotulo": r, "marcada": termo.regime == o} for o, r in ROTULOS_REGIME.items()],
        # Para a frase "Modalidade de ..., em ..." do termo. Vazio: linha para preencher à mão.
        "modalidade": ROTULOS_MODALIDADE.get(termo.modalidade),
        "regime": FRASE_REGIME.get(termo.regime),
        "paragrafos_termo": paragrafos_do_termo(),
        "data_assinatura": termo.data_assinatura,
        "lembrete": LEMBRETE_PDF,
    }
