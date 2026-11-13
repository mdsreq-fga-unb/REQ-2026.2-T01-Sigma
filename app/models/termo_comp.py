from sqlalchemy import String
from sqlalchemy import ForeignKey
from typing import TYPE_CHECKING
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from .mixins import TimestampMixin

if TYPE_CHECKING:
    from .aluno import Aluno

class TermoCompromisso(TimestampMixin, Base):

    __tablename__ = "TermoCompromisso"

    id:Mapped[int] = mapped_column(primary_key=True)
    modalidade:Mapped[str] = mapped_column(String(100))
    regime:Mapped[str] = mapped_column(String(100))
    assinatura:Mapped[bool] = mapped_column()
    id_aluno:Mapped[int] = mapped_column(ForeignKey("Aluno.id"))

    aluno:Mapped["Aluno"] = relationship(back_populates="termocomp")

    