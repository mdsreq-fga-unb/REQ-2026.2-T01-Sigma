from sqlalchemy import String
from sqlalchemy import ForeignKey
from typing import TYPE_CHECKING
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from .mixins import TimestampMixin

if TYPE_CHECKING:
    from .matricula import Matricula

class TermoCompromisso(TimestampMixin, Base):

    __tablename__ = "TermoCompromisso"

    id:Mapped[int] = mapped_column(primary_key=True)
    modalidade:Mapped[str] = mapped_column(String(100))
    regime:Mapped[str] = mapped_column(String(100))
    assinatura:Mapped[bool] = mapped_column()
    id_matricula:Mapped[int] = mapped_column(ForeignKey("Matricula.id"), unique=True)

    matricula:Mapped["Matricula"] = relationship(back_populates="termo_compromisso")
