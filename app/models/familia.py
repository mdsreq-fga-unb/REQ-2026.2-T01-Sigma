from sqlalchemy import String
from sqlalchemy import ForeignKey
from typing import TYPE_CHECKING
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from .mixins import TimestampMixin

if TYPE_CHECKING:
    from .aluno import Aluno
    from .fs import FichaSocioeconomica

class Familia(TimestampMixin, Base):

    __tablename__ = "Familia"

    tipo:Mapped[str] = mapped_column(String(100))
    idade:Mapped[int] = mapped_column()
    ec:Mapped[str] = mapped_column(String(100))
    escolaridade:Mapped[str] = mapped_column(String(100))
    renda_mensal:Mapped[str] = mapped_column(String(200))
    id_fs:Mapped[int] = mapped_column(ForeignKey("FichaSocioeconomica.id"))
    id_aluno:Mapped[int] = mapped_column(ForeignKey("Aluno.id"))
    id:Mapped[int] = mapped_column(primary_key=True)

    aluno:Mapped["Aluno"] = relationship(back_populates="familia")
    fs:Mapped["FichaSocioeconomica"] = relationship(back_populates="familia")