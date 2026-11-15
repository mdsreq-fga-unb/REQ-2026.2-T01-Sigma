from sqlalchemy import String
from sqlalchemy import ForeignKey
from typing import TYPE_CHECKING
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from .mixins import TimestampMixin

if TYPE_CHECKING:
    from .aluno import Aluno

class Responsavel(TimestampMixin, Base):

    __tablename__ = "Responsavel"

    id_pessoa:Mapped[int] = mapped_column(ForeignKey("Pessoa.id"))
    id:Mapped[int] = mapped_column(primary_key=True)
    telefone: Mapped[str] = mapped_column(String(20))
    email: Mapped[str] = mapped_column(String(150))
    alunos: Mapped[list["Aluno"]] = relationship(back_populates="responsavel")


