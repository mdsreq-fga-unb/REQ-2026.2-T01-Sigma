"""Schemas da consulta do histórico de edições do card do aluno (UC04 / FA04 / issue #109)."""
import enum
from datetime import datetime

from pydantic import BaseModel, field_serializer

from app.core.tempo import para_sao_paulo


class FichaHistorico(str, enum.Enum):
    """Valores aceitos no filtro `ficha`."""

    CARD = "card"
    REQUERIMENTO = "requerimento"
    SOCIOECONOMICA = "socioeconomica"
    TERMO_IMAGEM = "termo_imagem"
    TERMO_SAIDA = "termo_saida"
    TERMO_COMPROMISSO = "termo_compromisso"
    DOCUMENTOS = "documentos"


class PeriodoHistorico(str, enum.Enum):
    """Valores aceitos no filtro `periodo` (a partir de agora, em UTC)."""

    SETE_DIAS = "7d"
    TRINTA_DIAS = "30d"
    NOVENTA_DIAS = "90d"
    TODOS = "todos"


class ItemHistoricoResponse(BaseModel):
    """Uma linha da aba Histórico: um campo alterado em um salvamento."""

    data_hora: datetime
    usuario_id: int
    usuario_nome: str
    ficha: str
    campo: str
    valor_anterior: str | None = None  # sempre nulo em campo sensível (LGPD)
    valor_novo: str | None = None
    sensivel: bool = False

    @field_serializer("data_hora")
    def serializa_data_sao_paulo(self, valor: datetime):
        return para_sao_paulo(valor)  # o mesmo formato da "Última edição" da visão geral


class AutorHistoricoResponse(BaseModel):
    id: int
    nome: str


class HistoricoResponse(BaseModel):
    items: list[ItemHistoricoResponse]
    total: int  # linhas (campos alterados), não salvamentos
    page: int
    page_size: int
    total_pages: int
    usuarios: list[AutorHistoricoResponse]  # autores do histórico do aluno, sem aplicar filtros
