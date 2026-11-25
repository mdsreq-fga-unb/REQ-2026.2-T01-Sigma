from sqlalchemy import String
from datetime import date
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from .mixins import TimestampMixin

class Pessoa(TimestampMixin, Base):

    __tablename__ = "Pessoa"

    nome:Mapped[str] = mapped_column(String(150))
    id:Mapped[int] = mapped_column(primary_key=True)
    cpf:Mapped[str | None] = mapped_column(String(11), unique=True)  # opcional; vários vazios são permitidos
    trabalho:Mapped[str | None] = mapped_column(String(100));
    data_nasc:Mapped[date | None] = mapped_column()

