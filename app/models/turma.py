from sqlalchemy import String
from sqlalchemy import Boolean, Integer, Float, Numeric, LargeBinary
import enum
from sqlalchemy import Enum
from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base

class StatusTurma(enum.Enum):
    ATIVO = 'ativo'
    INATIVO = 'inativo'


class Turma(Base):

    __tablename__ = "Turma"

    nome:Mapped[str] = mapped_column(String(100))
    codigo:Mapped[int] = mapped_column(primary_key=True)
    turno:Mapped[str] = mapped_column(String(100))
    status:Mapped[StatusTurma] = mapped_column(Enum(StatusTurma, name="status_turma"),
        default=StatusTurma.ATIVO,)
    id_etapa:Mapped[int] = mapped_column(ForeignKey("Etapa.codigo"))
    sala:Mapped[int] = mapped_column()

    