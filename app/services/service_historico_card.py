"""Consulta do histórico de edições do card do aluno (UC04 / FA04 / RF17 / issue #109).

A gravação do histórico fica em `service_historico.py`; este módulo só lê.

- Uma linha por campo alterado: cada item de `Operacao.alteracoes` vira uma linha, com a data
  e o autor da operação.
- Operação sem `alteracoes` (registros antigos e os de primeiro preenchimento) vira uma linha só,
  com o resumo da `descricao`, que tem apenas nomes de campos, nunca valores.
- Campo sensível sai sempre com `valor_anterior` e `valor_novo` nulos (LGPD), mesmo que algum
  valor tenha sido gravado por engano.
- Consulta liberada para qualquer status do card, inclusive INATIVO (FE03 / RN10).
"""
import logging
import math
from datetime import timedelta
from typing import Any

from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.exceptions import AlunoNaoEncontradoError, ServidorIndisponivelError
from app.core.tempo import agora_utc
from app.models.ops import Operacao, Tipo
from app.models.user import Usuario
from app.repository import repository_historico
from app.schemas.historico import (
    AutorHistoricoResponse,
    FichaHistorico,
    HistoricoResponse,
    ItemHistoricoResponse,
    PeriodoHistorico,
)

logger = logging.getLogger(__name__)

# Tipos de operação de cada ficha (filtro `ficha`) e o nome usado quando a operação não tem itens.
# "documentos" ainda não grava histórico: o filtro é aceito e volta vazio.
FICHAS: dict[FichaHistorico, tuple[str, tuple[Tipo, ...]]] = {
    FichaHistorico.CARD: ("Card do aluno", (Tipo.MATRICULA, Tipo.INATIVACAO)),
    FichaHistorico.REQUERIMENTO: (
        "Requerimento de matrícula", (Tipo.PREENCHIMENTO_REQUERIMENTO, Tipo.EDICAO_REQUERIMENTO)),
    FichaHistorico.SOCIOECONOMICA: (
        "Ficha socioeconômica", (Tipo.PREENCHIMENTO_SOCIOECONOMICA, Tipo.EDICAO_SOCIOECONOMICA)),
    FichaHistorico.TERMO_IMAGEM: (
        "Termo de autorização de uso de imagem", (Tipo.PREENCHIMENTO_TERMO_IMAGEM, Tipo.EDICAO_TERMO_IMAGEM)),
    FichaHistorico.TERMO_SAIDA: (
        "Termo de autorização de saída do aluno", (Tipo.PREENCHIMENTO_TERMO_SAIDA, Tipo.EDICAO_TERMO_SAIDA)),
    FichaHistorico.TERMO_COMPROMISSO: (
        "Termo de compromisso escolar", (Tipo.PREENCHIMENTO_TERMO_COMPROMISSO, Tipo.EDICAO_TERMO_COMPROMISSO)),
    FichaHistorico.DOCUMENTOS: ("Documentos", ()),
}
NOME_DA_FICHA_POR_TIPO = {tipo: nome for nome, tipos in FICHAS.values() for tipo in tipos}
DIAS_DO_PERIODO = {
    PeriodoHistorico.SETE_DIAS: 7,
    PeriodoHistorico.TRINTA_DIAS: 30,
    PeriodoHistorico.NOVENTA_DIAS: 90,
    PeriodoHistorico.TODOS: None,
}


def _linhas(operacao: Operacao, autor: Usuario) -> list[ItemHistoricoResponse]:
    """Expande a operação em uma linha por campo alterado."""
    itens: list[dict[str, Any]] = [i for i in (operacao.alteracoes or []) if isinstance(i, dict)]
    if not itens:
        # Sem itens: uma linha com o resumo (só nomes de campos, nunca valores).
        nome_ficha = NOME_DA_FICHA_POR_TIPO.get(operacao.tipo, "Card do aluno")
        itens = [{"ficha": nome_ficha, "campo": operacao.descricao, "sensivel": False}]
    linhas = []
    for item in itens:
        sensivel = bool(item.get("sensivel"))
        linhas.append(
            ItemHistoricoResponse(
                data_hora=operacao.data_op,
                usuario_id=autor.id,
                usuario_nome=autor.nome,
                ficha=str(item.get("ficha") or NOME_DA_FICHA_POR_TIPO.get(operacao.tipo, "")),
                campo=str(item.get("campo") or ""),
                # LGPD: campo sensível nunca devolve valor, mesmo que tenha sido gravado.
                valor_anterior=None if sensivel else item.get("valor_anterior"),
                valor_novo=None if sensivel else item.get("valor_novo"),
                sensivel=sensivel,
            )
        )
    return linhas


def consultar_historico(
    db: Session,
    id_aluno: int,
    *,
    ficha: FichaHistorico | None = None,
    usuario_id: int | None = None,
    periodo: PeriodoHistorico = PeriodoHistorico.TRINTA_DIAS,
    page: int = 1,
    page_size: int = 10,
) -> HistoricoResponse:
    """Histórico do card (404 se o aluno não existir), filtrado e paginado por linha."""
    dias = DIAS_DO_PERIODO[periodo]
    try:
        if not repository_historico.aluno_existe(db, id_aluno):
            raise AlunoNaoEncontradoError()
        operacoes = repository_historico.buscar_operacoes(
            db,
            id_aluno,
            tipos=FICHAS[ficha][1] if ficha is not None else None,
            id_usuario=usuario_id,
            desde=agora_utc() - timedelta(days=dias) if dias is not None else None,
        )
        autores = repository_historico.listar_autores(db, id_aluno)
    except SQLAlchemyError as exc:
        logger.error("Falha ao consultar o histórico do aluno: %s", type(exc).__name__)
        raise ServidorIndisponivelError() from exc

    linhas = [linha for operacao, autor in operacoes for linha in _linhas(operacao, autor)]
    inicio = (page - 1) * page_size
    return HistoricoResponse(
        items=linhas[inicio : inicio + page_size],
        total=len(linhas),
        page=page,
        page_size=page_size,
        total_pages=math.ceil(len(linhas) / page_size),
        usuarios=[AutorHistoricoResponse(id=id_usuario, nome=nome) for id_usuario, nome in autores],
    )
