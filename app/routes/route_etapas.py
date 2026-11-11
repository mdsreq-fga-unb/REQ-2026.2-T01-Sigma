from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.etapa import Etapa
from app.models.ops import Operacao, Tipo
from app.models.user import Usuario
from app.schemas.etapa import EtapaCreate, EtapaResponse
from app.services.service_usuario import _get_utc_now



router = APIRouter(prefix="/etapas", tags=["Etapas"])


@router.post(
    "",
    response_model=EtapaResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Cadastrar nova etapa",
)
def cadastrar_etapa(
    
    etapa_in: EtapaCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
) -> EtapaResponse:

    now=_get_utc_now()
    try:
    
        etapa = Etapa(nome=etapa_in.nome)
        db.add(etapa)
        db.flush()

        operacao = Operacao(
            id_user=current_user.id,
            id_aluno=None,
            tipo=Tipo.CADASTRO_ETAPA,
            descricao=f"Etapa criada: ID {etapa.id}, Nome: {etapa.nome}",

        )
        db.add(operacao)
        db.commit()
        db.refresh(etapa)

        return EtapaResponse(
            id=etapa.id,
            nome=etapa.nome,
            quantidadeTurmas=0,
            created_at=etapa.created_at,
            updated_at=etapa.updated_at,
        )
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
    response_model=List[EtapaResponse],
    status_code=status.HTTP_200_OK,
    summary="Listar etapas (FP02 passo 2 / UC08)",
)
def listar_etapas(
    busca: Optional[str] = Query(None, description="Filtro por nome completo ou parcial"),
    status_param: Optional[str] = Query(None, alias="status", description="Filtro de status"),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
) -> List[EtapaResponse]:
    """
    Lista etapas para seleção no cadastro de turmas ou consulta.
    Requer autenticação JWT (RNF02).
    """
    try:
        query = db.query(Etapa)
        if busca and busca.strip():
            query = query.filter(Etapa.nome.contains(busca.strip()))

        etapas = query.order_by(Etapa.id.asc()).all()
        return [
            EtapaResponse(
                id=e.id,
                nome=e.nome,
                quantidadeTurmas=len(e.turmas) if e.turmas else 0,
                created_at=e.created_at,
                updated_at=e.updated_at,
            )
            for e in etapas
        ]
    except SQLAlchemyError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Não foi possível conectar ao servidor. Tente novamente mais tarde.",
        )
