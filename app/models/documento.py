from sqlalchemy import String
from sqlalchemy import ForeignKey
from typing import TYPE_CHECKING
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from .mixins import TimestampMixin

if TYPE_CHECKING:
    from .rm import RequerimentoMatricula

class Documento(TimestampMixin, Base):

    __tablename__ = "Documento"

    id:Mapped[int] = mapped_column(primary_key=True)
    nome:Mapped[str] = mapped_column(String(100))
    id_rm:Mapped[int] = mapped_column(ForeignKey("RequerimentoMatricula.id"))

    rm:Mapped["RequerimentoMatricula"] = relationship(back_populates="documento")