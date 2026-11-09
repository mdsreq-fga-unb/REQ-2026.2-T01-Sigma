from sqlalchemy.orm import Session
from app.models.user import Usuario
from app.repository import repository_usuario
from app.schemas.schema_usuario import UsuarioCreate
from app.core.exceptions import EmailJaCadastradoError
from app.core.security import get_password_hash

def criar_usuario(db:Session,dados:UsuarioCreate) -> Usuario:

    senha_hash = get_password_hash(dados.senha)

    email = dados.email.lower()
    if repository_usuario.busca_por_email(db,email):
        raise EmailJaCadastradoError()

    usuario = Usuario(
        nome=dados.nome,
        email=email,
        is_Admin=False,
        senha_hash=senha_hash,
        
    )
    
    repository_usuario.criar_usuario_padrao(db,usuario=usuario)
    return usuario