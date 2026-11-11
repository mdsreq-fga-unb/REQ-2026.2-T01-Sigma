from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import Annotated
from sqlalchemy.exc import SQLAlchemyError
from app.core.database import get_db
from app.core.exceptions import EmailJaCadastradoError
from app.schemas.schema_usuario import UsuarioCreate, UsuarioResponse, UsuarioListResponse
from app.services.service_usuario import _get_utc_now, criar_usuario
from app.repository import repository_usuario
from app.core.deps import get_admin_atual
from app.models.ops import Operacao, Tipo
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


def _alterar_status_usuario(
    id_usuario: int,
    admin: Usuario,
    db: Session,
    ativo: bool,
) -> UsuarioResponse:
    usuario = db.query(Usuario).filter(Usuario.id == id_usuario).first()
    if usuario is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuário não encontrado.")
    if usuario.id == admin.id and not ativo:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Não é possível inativar a própria conta.")
    if usuario.ativo == ativo:
        situacao = "ativa" if ativo else "inativa"
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=f"A conta já está {situacao}.")

    usuario.ativo = ativo
    operacao = Operacao(
        id_user=admin.id,
        id_aluno=None,
        tipo=Tipo.REATIVACAO_USUARIO if ativo else Tipo.INATIVACAO_USUARIO,
        data_op=_get_utc_now(),
        descricao=f"Usuário {'reativado' if ativo else 'inativado'}: ID {usuario.id}, Nome: {usuario.nome}",
    )
    db.add(operacao)
    try:
        db.commit()
        db.refresh(usuario)
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Falha de conexão com o banco de dados",
        )
    return usuario


@router.patch(
    "/{id_usuario}/inativar",
    response_model=UsuarioResponse,
    status_code=status.HTTP_200_OK,
    summary="Inativar conta de usuário (UC02)",
)
def inativar_usuario(
    id_usuario: int,
    admin: Annotated[Usuario, Depends(get_admin_atual)],
    db: Annotated[Session, Depends(get_db)],
):
    return _alterar_status_usuario(id_usuario, admin, db, ativo=False)


@router.patch(
    "/{id_usuario}/reativar",
    response_model=UsuarioResponse,
    status_code=status.HTTP_200_OK,
    summary="Reativar conta de usuário (UC02)",
)
def reativar_usuario(
    id_usuario: int,
    admin: Annotated[Usuario, Depends(get_admin_atual)],
    db: Annotated[Session, Depends(get_db)],
):
    return _alterar_status_usuario(id_usuario, admin, db, ativo=True)
