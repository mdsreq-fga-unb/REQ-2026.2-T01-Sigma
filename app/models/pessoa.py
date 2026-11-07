from sqlalchemy import String
from datetime import date
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base
from .mixins import TimestampMixin

class Pessoa(TimestampMixin, Base):

    __tablename__ = "Pessoa"

    nome:Mapped[str] = mapped_column(String(150))
    id:Mapped[int] = mapped_column(primary_key=True)
    cpf:Mapped[str] = mapped_column(String(11), unique=True)
    trabalho:Mapped[str | None] = mapped_column(String(100));
    data_nasc:Mapped[date] = mapped_column()
