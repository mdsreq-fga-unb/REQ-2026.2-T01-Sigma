from sqlalchemy import String
from datetime import datetime
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base
from .mixins import TimestampMixin

class Usuario(TimestampMixin, Base):
    __tablename__ = "Usuario"

    id:Mapped[int] = mapped_column(primary_key=True)
    nome:Mapped[str] = mapped_column(String(100))
    email:Mapped[str] = mapped_column(String(100), unique=True)
    senha_hash:Mapped[str] = mapped_column(String(255))
    is_Admin:Mapped[bool] = mapped_column(default=False)
    ativo:Mapped[bool] = mapped_column(default=True)
    tentativas_falhas:Mapped[int] = mapped_column(default=0)
    bloqueado_ate:Mapped[datetime | None] = mapped_column()
