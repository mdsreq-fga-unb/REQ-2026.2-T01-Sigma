from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import Annotated
from sqlalchemy.exc import SQLAlchemyError
from app.core.database import get_db
from app.core.exceptions import EmailJaCadastradoError
from app.schemas.schema_usuario import UsuarioCreate, UsuarioResponse, UsuarioListResponse
from app.services.service_usuario import criar_usuario
from app.repository import repository_usuario
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
    except SQLAlchemyError as e:
        print(repr(e))
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Falha de conexão com o banco de dados",
        )
    return usuario



@router.get(
    "",
    response_model=UsuarioListResponse,
    status_code=status.HTTP_200_OK,
    summary="Lista os usuários cadastrados (somente administrador)",
    responses={
        200: {"description": "Lista paginada de usuários"},
        401: {"description": "Token ausente ou inválido"},
        403: {"description": "Usuário não é administrador"},
    },
)
def listar_usuarios(
    _admin: Annotated[Usuario, Depends(get_admin_atual)],
    db: Annotated[Session, Depends(get_db)],
    pagina: Annotated[int, Query(ge=1)] = 1,
    tamanho: Annotated[int, Query(ge=1, le=100)] = 10,
):
    itens, total = repository_usuario.listar_usuarios(
        db, offset=(pagina - 1) * tamanho, limite=tamanho
    )
    return {"itens": itens, "total": total, "pagina": pagina, "tamanho": tamanho}
