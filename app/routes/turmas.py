from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.etapa import Etapa
from app.models.ops import Operacao, Tipo
from app.models.turma import StatusTurma, Turma, Turno
from app.models.user import Usuario
from app.schemas.etapa import EtapaResumo
from app.schemas.turma import TurmaCreate, TurmaResponse

router = APIRouter(prefix="/turmas", tags=["Turmas"])


def _formatar_turma_response(t: Turma) -> TurmaResponse:
    turno_val = t.turno.value if hasattr(t.turno, "value") else t.turno
    status_val = t.status.value if hasattr(t.status, "value") else str(t.status)
    etapa_resumo = (
        EtapaResumo(id=t.etapa.id, nome=t.etapa.nome)
        if t.etapa
        else EtapaResumo(id=t.id_etapa, nome="")
    )
    qtd_alunos = len(t.alunos) if t.alunos else 0

    return TurmaResponse(
        id=t.id,
        nome=t.nome,
        turno=turno_val,
        status=status_val,
        id_etapa=t.id_etapa,
        etapa=etapa_resumo,
        quantidadeAlunos=qtd_alunos,
        created_at=t.created_at,
        updated_at=t.updated_at,
    )


@router.post(
    "",
    response_model=TurmaResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Cadastrar nova turma (FP02)",
)
def cadastrar_turma(
    turma_in: TurmaCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
) -> TurmaResponse:
    """
    Cadastra uma turma vinculada a uma etapa existente com status 'ativo' (RF24 / FP02).
    Grava em Operacao com CADASTRO_TURMA na mesma transação.
    """
    try:
        # FE04: Verificar se há alguma etapa cadastrada no sistema
        total_etapas = db.query(Etapa).count()
        if total_etapas == 0:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Não há etapas cadastradas. Cadastre uma etapa antes de continuar.",
            )

        # FE01: Verificar se a etapa informada existe
        etapa = db.query(Etapa).filter(Etapa.id == turma_in.id_etapa).first()
        if not etapa:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="A etapa informada não existe.",
            )

        # Converter turno para Turno Enum se fornecido
        turno_enum = None
        if turma_in.turno:
            turno_enum = Turno(str(turma_in.turno).lower())

        turma = Turma(
            nome=turma_in.nome,
            id_etapa=etapa.id,
            turno=turno_enum,
            status=StatusTurma.ATIVO,
        )
        db.add(turma)
        db.flush()

        operacao = Operacao(
            id_user=current_user.id,
            id_aluno=None,
            tipo=Tipo.CADASTRO_TURMA,
            descricao=f"Turma criada: ID {turma.id}, Nome: {turma.nome}",
        )
        db.add(operacao)
        db.commit()
        db.refresh(turma)

        return _formatar_turma_response(turma)
    except HTTPException:
        db.rollback()
        raise
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Não foi possível conectar ao servidor. Tente novamente mais tarde.",
        )


@router.get(
    "",
    response_model=List[TurmaResponse],
    status_code=status.HTTP_200_OK,
    summary="Listar e buscar turmas (FP04 / UC08)",
)
def listar_turmas(
    busca: Optional[str] = Query(None, description="Filtro por nome completo ou parcial"),
    status_param: Optional[str] = Query(None, alias="status", description="Filtro por status (ativo/inativo)"),
    id_etapa: Optional[int] = Query(None, alias="id_etapa", description="Filtro por ID da etapa"),
    etapa_id: Optional[int] = Query(None, alias="etapaId", description="Alias para id_etapa"),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
) -> List[TurmaResponse]:
    """
    Lista e busca turmas com filtros de status e etapa.
    Requer autenticação JWT (RNF02).
    """
    try:
        query = db.query(Turma)

        # Filtro por busca de texto no nome
        if busca and busca.strip():
            query = query.filter(Turma.nome.contains(busca.strip()))

        # Filtro por etapa (aceita id_etapa ou etapaId)
        etapa_filtro = id_etapa if id_etapa is not None else etapa_id
        if etapa_filtro is not None:
            query = query.filter(Turma.id_etapa == etapa_filtro)

        # Filtro por status
        if status_param and status_param.strip():
            status_norm = status_param.strip().upper()
            if status_norm in {"ATIVO", "INATIVO"}:
                query = query.filter(Turma.status == StatusTurma(status_norm))

        turmas = query.order_by(Turma.id.asc()).all()
        return [_formatar_turma_response(t) for t in turmas]
    except SQLAlchemyError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Não foi possível conectar ao servidor. Tente novamente mais tarde.",
        )


def _executar_inativacao_turma(
    codigo: int,
    db: Session,
    current_user: Usuario,
) -> TurmaResponse:
    try:
        turma = db.query(Turma).filter(Turma.id == codigo).first()
        if not turma:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Turma não encontrada.",
            )

        status_atual = turma.status.value if hasattr(turma.status, "value") else str(turma.status)
        if status_atual.upper() == "INATIVO":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Turma já está inativa.",
            )

        turma.status = StatusTurma.INATIVO

        operacao = Operacao(
            id_user=current_user.id,
            id_aluno=None,
            tipo=Tipo.INATIVACAO_TURMA,
            descricao=f"Turma inativada: ID {turma.id}",
        )
        db.add(operacao)
        db.commit()
        db.refresh(turma)

        return _formatar_turma_response(turma)
    except HTTPException:
        db.rollback()
        raise
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Não foi possível conectar ao servidor. Tente novamente mais tarde.",
        )


@router.patch(
    "/{codigo}/status",
    response_model=TurmaResponse,
    status_code=status.HTTP_200_OK,
    summary="Inativar turma via status (FP04)",
)
def inativar_turma_status(
    codigo: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
) -> TurmaResponse:
    """
    Inativa a turma indicada (RN12: mantém todos os vínculos de alunos).
    """
    return _executar_inativacao_turma(codigo, db, current_user)


@router.patch(
    "/{codigo}/inativar",
    response_model=TurmaResponse,
    status_code=status.HTTP_200_OK,
    summary="Inativar turma via inativar (Compatibilidade Frontend / FP04)",
)
def inativar_turma_endpoint(
    codigo: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
) -> TurmaResponse:
    """
    Inativa a turma indicada (RN12: mantém todos os vínculos de alunos).
    """
    return _executar_inativacao_turma(codigo, db, current_user)
