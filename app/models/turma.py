from sqlalchemy import String
import enum
from sqlalchemy import Enum
from sqlalchemy import ForeignKey
from typing import TYPE_CHECKING
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from .mixins import TimestampMixin

if TYPE_CHECKING:
    from .etapa import Etapa
    from .aluno import Aluno

class StatusTurma(enum.Enum):
    ATIVO = 'ativo'
    INATIVO = 'inativo'

class Turno(enum.Enum):
    MANHA = "manha"
    TARDE = "tarde"
    NOITE = "noite"
    INTEGRAL = "integral"

class Turma(TimestampMixin, Base):

    __tablename__ = "Turma"

    nome:Mapped[str] = mapped_column(String(100))
    id:Mapped[int] = mapped_column(primary_key=True)
    turno:Mapped[Turno] = mapped_column(Enum(Turno, name="turno"))
    status:Mapped[StatusTurma] = mapped_column(Enum(StatusTurma, name="status_turma"),
        default=StatusTurma.ATIVO,)
    id_etapa:Mapped[int] = mapped_column(ForeignKey("Etapa.id"))
    sala:Mapped[int] = mapped_column()

    etapa: Mapped["Etapa"] = relationship(back_populates="turmas")
    alunos: Mapped[list["Aluno"]] = relationship(back_populates="turma")
    