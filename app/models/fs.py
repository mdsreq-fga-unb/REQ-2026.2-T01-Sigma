from sqlalchemy import String
from sqlalchemy import ForeignKey
from typing import TYPE_CHECKING
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from .mixins import TimestampMixin

if TYPE_CHECKING:
    from .aluno import Aluno

class FichaSocioeconomica(TimestampMixin, Base):

    __tablename__ = "FichaSocioeconomica"

    id:Mapped[int] = mapped_column(primary_key=True)
    moradia:Mapped[str] = mapped_column(String(500))
    valor:Mapped[str] = mapped_column(String(100))
    transporte:Mapped[str] = mapped_column(String(100))
    o_prop:Mapped[bool] = mapped_column()
    id_aluno:Mapped[int] = mapped_column(ForeignKey("Aluno.id"))

    alunos:Mapped[list["Aluno"]] = relationship(back_populates="fs")

    