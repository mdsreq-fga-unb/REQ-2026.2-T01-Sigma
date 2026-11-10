from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from app.models.user import Usuario
from app.models.ops import Operacao, Tipo
from app.repository import repository_usuario
from app.schemas.schema_usuario import UsuarioCreate
from app.core.exceptions import EmailJaCadastradoError
from app.core.security import get_password_hash

def criar_usuario(db:Session,dados:UsuarioCreate, admin:Usuario) -> Usuario:

    senha_hash = get_password_hash(dados.senha)

    email = dados.email.lower().strip()
    if repository_usuario.busca_por_email(db,email):
        raise EmailJaCadastradoError()

    usuario = Usuario(
        nome=dados.nome,
        email=email,
        is_Admin=False,
        senha_hash=senha_hash,
        
    )
    try:
        repository_usuario.criar_usuario_padrao(db,usuario=usuario)
        db.add(Operacao(
            id_user=admin.id,
            id_aluno = None,
            descricao=f'Cadastro de usuario id={usuario.id}, Nome={usuario.nome}',
            tipo= Tipo.CADASTRO_USUARIO
        ))
        db.commit()
    except SQLAlchemyError:
        db.rollback()
        raise 
    db.refresh(usuario)
    return usuario