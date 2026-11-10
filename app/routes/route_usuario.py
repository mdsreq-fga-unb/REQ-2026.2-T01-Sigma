from fastapi import APIRouter, Depends, HTTPException,status
from sqlalchemy.orm import Session
from typing import Annotated
from sqlalchemy.exc import SQLAlchemyError
from app.core.database import get_db
from app.core.exceptions import EmailJaCadastradoError
from app.schemas.schema_usuario import UsuarioCreate,UsuarioResponse
from app.services.service_usuario import criar_usuario
from app.core.deps import get_admin_atual
from app.models.user import Usuario

router = APIRouter(
    prefix="/usuarios",
    tags=["usuario"]
)


@router.post(
        "",
    response_model=UsuarioResponse,
    status_code=status.HTTP_201_CREATED,
    summary= "Realiza o cadastro de um usuario comum",
    responses={
            201: {"description": "Cadastro realizado com sucesso"},
            409: {"description":"Email já cadastrado no sistema"},
            422: {"description": "Dados inválidos e/ou faltam dados obrigatórios"},
            503: {"description": "Falha de conexão com o banco de dados."}
        }
    )
def cadastrar_usuario(
    db: Annotated[Session, Depends(get_db)],
    dados: UsuarioCreate,
    admin: Annotated[Usuario, Depends(get_admin_atual)],
):
    try:
        usuario = criar_usuario(db=db, dados=dados, admin=admin)
    except EmailJaCadastradoError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=e.mensagem)
    except SQLAlchemyError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Falha de conexão com o banco de dados",
        )
    return usuario
