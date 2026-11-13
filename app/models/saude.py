from sqlalchemy import String
from sqlalchemy import ForeignKey
from typing import TYPE_CHECKING
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from .mixins import TimestampMixin

if TYPE_CHECKING:
    from .rm import RequerimentoMatricula

class Saude(TimestampMixin, Base):

    __tablename__ = "Saude"

    tipo:Mapped[str] = mapped_column(String(100), nullable=True)
    descricao:Mapped[str] = mapped_column(String(1000), nullable=True)
    acomp:Mapped[str] = mapped_column(String(200), nullable=True)
    descricao_acomp:Mapped[str] = mapped_column(String(1000), nullable=True)
    id_rm:Mapped[int] = mapped_column(ForeignKey("RequerimentoMatricula.id"))
    id:Mapped[int] = mapped_column(primary_key=True)

    rm:Mapped["RequerimentoMatricula"] = relationship(back_populates="saude")