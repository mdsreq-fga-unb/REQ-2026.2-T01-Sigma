from sqlalchemy import String
from datetime import date
from typing import TYPE_CHECKING
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from .mixins import TimestampMixin

if TYPE_CHECKING:
    from .pessoas_a import PessoaAutorizada

class Pessoa(TimestampMixin, Base):

    __tablename__ = "Pessoa"

    nome:Mapped[str] = mapped_column(String(150))
    id:Mapped[int] = mapped_column(primary_key=True)
    cpf:Mapped[str] = mapped_column(String(11), unique=True)
    trabalho:Mapped[str | None] = mapped_column(String(100));
    data_nasc:Mapped[date] = mapped_column()

    pessoa_autorizada:Mapped[list["PessoaAutorizada"]] = relationship(back_populates="pessoa")
