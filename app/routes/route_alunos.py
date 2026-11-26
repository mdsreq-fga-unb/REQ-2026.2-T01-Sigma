"""Rotas do card do aluno e visão geral (UC04 / issue #108)."""
from typing import Annotated

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import Usuario
from app.schemas.aluno import AlunoCardCreate, AlunoVisaoGeralResponse
from app.schemas.historico import FichaHistorico, HistoricoResponse, PeriodoHistorico
from app.services import service_aluno, service_historico_card

router = APIRouter(prefix="/alunos", tags=["Alunos"])

SessaoBanco = Annotated[Session, Depends(get_db)]
UsuarioAtual = Annotated[Usuario, Depends(get_current_user)]

_RESPOSTAS_AUTENTICACAO = {
    401: {"description": "Token ausente, inválido ou expirado."},
    403: {"description": "Conta inativa."},
}


@router.post(
    "",
    response_model=AlunoVisaoGeralResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Cadastrar novo card de aluno (FP01 / RF08)",
    responses={
        201: {"description": "Card do aluno, responsável e matrícula criados."},
        **_RESPOSTAS_AUTENTICACAO,
        404: {"description": "Etapa não encontrada."},
        409: {"description": "CPF ou NIS já cadastrado para outro aluno."},
        422: {"description": "Campos obrigatórios faltantes ou dados inválidos."},
        503: {"description": "Falha de conexão com o banco de dados. Nada foi salvo."},
    },
)
def cadastrar_card_aluno(
    dados: AlunoCardCreate,
    db: SessaoBanco,
    usuario: UsuarioAtual,
):
    return service_aluno.criar_card_aluno(db, dados, usuario)


@router.get(
    "/{id_aluno}",
    response_model=AlunoVisaoGeralResponse,
    status_code=status.HTTP_200_OK,
    summary="Obter visão geral do card do aluno (UC04)",
    responses={
        200: {"description": "Visão geral consolidada do card do aluno."},
        **_RESPOSTAS_AUTENTICACAO,
        404: {"description": "Aluno não encontrado."},
        503: {"description": "Falha de conexão com o banco de dados."},
    },
)
def obter_visao_geral(id_aluno: int, db: SessaoBanco, _usuario: UsuarioAtual):
    return service_aluno.obter_visao_geral_aluno(db, id_aluno)


@router.get(
    "/{id_aluno}/historico",
    response_model=HistoricoResponse,
    status_code=status.HTTP_200_OK,
    summary="Consultar o histórico de edições do card do aluno (FA04 / RF17)",
    description="Somente leitura: uma linha por campo alterado, da mais recente para a mais antiga. "
    "Não traz exportações de PDF. Campos sensíveis vêm sem valores (LGPD). Funciona também para card inativo.",
    responses={
        200: {"description": "Histórico (lista vazia se nada combinar com os filtros)."},
        **_RESPOSTAS_AUTENTICACAO,
        404: {"description": "Aluno não encontrado."},
        422: {"description": "Filtro ou paginação inválidos."},
        503: {"description": "Falha de conexão com o banco de dados."},
    },
)
def consultar_historico(
    id_aluno: int,
    db: SessaoBanco,
    _usuario: UsuarioAtual,
    ficha: Annotated[FichaHistorico | None, Query(description="Origem da alteração. Omitido: todas.")] = None,
    usuario_id: Annotated[int | None, Query(ge=1, description="Autor das alterações.")] = None,
    periodo: Annotated[PeriodoHistorico, Query(description="Últimos 7, 30 ou 90 dias, ou todos.")] = PeriodoHistorico.TRINTA_DIAS,
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 10,
):
    return service_historico_card.consultar_historico(
        db, id_aluno, ficha=ficha, usuario_id=usuario_id, periodo=periodo, page=page, page_size=page_size
    )
