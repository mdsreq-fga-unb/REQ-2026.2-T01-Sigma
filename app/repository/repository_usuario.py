from sqlalchemy import func, select
from sqlalchemy.orm import Session
from app.core.exceptions import EmailJaCadastradoError
from sqlalchemy.exc import IntegrityError 

from app.models.user import Usuario

def busca_por_email(db:Session, email_usuario:str):

    temp=select(Usuario).where(

        Usuario.email== email_usuario.lower()
    )
    return db.scalar(temp)

def criar_usuario_padrao(db:Session, usuario:Usuario):
    db.add(usuario)
    try:
        db.flush()
    except IntegrityError as e:
        db.rollback()
        raise EmailJaCadastradoError() from e


def listar_usuarios(db: Session, offset: int, limite: int):
    total = db.scalar(select(func.count()).select_from(Usuario))
    itens = db.scalars(
        select(Usuario).order_by(Usuario.id).offset(offset).limit(limite)
    ).all()
    return itens, total
