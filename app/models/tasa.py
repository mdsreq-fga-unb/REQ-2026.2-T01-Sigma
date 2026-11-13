from sqlalchemy import String
from sqlalchemy import ForeignKey
from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from .mixins import TimestampMixin

if TYPE_CHECKING:
    from .aluno import Aluno

class TermoSaida(TimestampMixin, Base):

    __tablename__ = "TermoSaida"

    id:Mapped[int] = mapped_column(primary_key=True)
    tipo_saida:Mapped[str] = mapped_column(String(100))
    data_saida:Mapped[datetime] = mapped_column()
    id_aluno:Mapped[int] = mapped_column(ForeignKey("Aluno.id"))

    aluno:Mapped["Aluno"] = relationship(back_populates="aluno")