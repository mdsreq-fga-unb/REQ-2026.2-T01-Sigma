import os
from typing import Optional
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.core.security import get_password_hash
from app.models.user import Usuario


def seed_admin(
    nome: str = "Administrador do Sistema",
    email: str = "admin@estacaovida.org.br",
    *,
    senha: str,
    db: Optional[Session] = None,
):
    """Cria um usuário administrador inicial caso não exista."""
    should_close = False
    if db is None:
        db = SessionLocal()
        should_close = True

    try:
        user = db.query(Usuario).filter(Usuario.email == email).first()
        if user:
            print(f"Usuário {email} já existe no banco de dados.")
            return user

        admin = Usuario(
            nome=nome,
            email=email,
            senha_hash=get_password_hash(senha),
            is_Admin=True,
            ativo=True,
            tentativas_falhas=0,
            bloqueado_ate=None,
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)
        print(f"Administrador inicial criado com sucesso: {email}")
        return admin
    except Exception as e:
        db.rollback()
        print(f"Erro ao criar administrador inicial: {e}")
        raise
    finally:
        if should_close:
            db.close()


if __name__ == "__main__":
    nome = os.getenv("ADMIN_NAME", "Administrador do Sistema")
    email = os.getenv("ADMIN_EMAIL")
    senha = os.getenv("ADMIN_PASSWORD")
    if not email:
        raise SystemExit("Configure ADMIN_EMAIL antes de criar o administrador.")
    if not senha:
        raise SystemExit("Configure ADMIN_PASSWORD antes de criar o administrador.")
    seed_admin(nome=nome, email=email, senha=senha)
