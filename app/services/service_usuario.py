from sqlalchemy.orm import Session
from app.models.user import Usuario
from app.repository import repository_usuario
from app.schemas.schema_usuario import UsuarioCreate
from app.core.exceptions import EmailJaCadastradoError

def criar_usuario(db:Session,dados:UsuarioCreate) -> Usuario:

    email = dados.email.lower()
    if repository_usuario.busca_por_email(db,email):
        raise EmailJaCadastradoError()

    usuario = Usuario(
        nome=dados.nome,
        email=email,
        is_Admin=False
    )
    
    repository_usuario.criar_usuario_padrao(db,usuario=usuario)
    return usuario