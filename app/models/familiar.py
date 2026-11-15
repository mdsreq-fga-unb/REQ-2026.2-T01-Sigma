from sqlalchemy import String
from sqlalchemy import ForeignKey
from typing import TYPE_CHECKING
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from .mixins import TimestampMixin

if TYPE_CHECKING:
    from .ficha_socioeco import FichaSocioeconomica

class Familiar(TimestampMixin, Base):

    __tablename__ = "Familiar"

    tipo:Mapped[str] = mapped_column(String(100))
    idade:Mapped[int] = mapped_column()
    ec:Mapped[str] = mapped_column(String(100))
    escolaridade:Mapped[str] = mapped_column(String(100))
    renda_mensal:Mapped[str] = mapped_column(String(200))
    id_fs:Mapped[int] = mapped_column(ForeignKey("FichaSocioeconomica.id"))
    id:Mapped[int] = mapped_column(primary_key=True)

    fs:Mapped["FichaSocioeconomica"] = relationship(back_populates="familiares")
