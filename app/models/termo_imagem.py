from sqlalchemy import ForeignKey
from typing import TYPE_CHECKING
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from .mixins import TimestampMixin

if TYPE_CHECKING:
    from .aluno import Aluno

class TermoImagem(TimestampMixin, Base):

    __tablename__ = "TermoImagem"

    id:Mapped[int] = mapped_column(primary_key=True)
    autorizacao:Mapped[bool] = mapped_column()
    id_aluno:Mapped[int] = mapped_column(ForeignKey("Aluno.id"))

    aluno:Mapped["Aluno"] = relationship(back_populates="aluno")

    