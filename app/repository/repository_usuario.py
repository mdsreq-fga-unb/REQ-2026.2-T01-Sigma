from sqlalchemy import select
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


