from sqlalchemy import String
from sqlalchemy import ForeignKey
from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from .mixins import TimestampMixin

if TYPE_CHECKING:
    from .matricula import Matricula
    from .pessoas_a import PessoaAutorizada

class TermoSaida(TimestampMixin, Base):

    __tablename__ = "TermoSaida"

    id:Mapped[int] = mapped_column(primary_key=True)
    tipo_saida:Mapped[str] = mapped_column(String(100))
    data_saida:Mapped[datetime] = mapped_column()
    id_matricula:Mapped[int] = mapped_column(ForeignKey("Matricula.id"), unique=True)

    matricula:Mapped["Matricula"] = relationship(back_populates="termo_saida")
    pessoa_autorizada:Mapped[list["PessoaAutorizada"]] = relationship(back_populates="tasa")
