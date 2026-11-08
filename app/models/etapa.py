from sqlalchemy import String
from typing import TYPE_CHECKING
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from .mixins import TimestampMixin

if TYPE_CHECKING:
    from .turma import Turma

class Etapa(TimestampMixin, Base):

    __tablename__ = "Etapa"

    nome:Mapped[str] = mapped_column(String(100))
    id:Mapped[int] = mapped_column(primary_key=True)

    turmas: Mapped[list["Turma"]] = relationship(back_populates="etapa")