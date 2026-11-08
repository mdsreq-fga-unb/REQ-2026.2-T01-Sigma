import enum
from typing import TYPE_CHECKING
from sqlalchemy import Enum, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from .mixins import TimestampMixin

if TYPE_CHECKING:
    from .etapa import Etapa
    from .aluno import Aluno

class StatusTurma(str, enum.Enum):
    ATIVO = "ATIVO"
    INATIVO = "INATIVO"

class Turno(str, enum.Enum):
    MANHA = "manha"
    TARDE = "tarde"
    NOITE = "noite"
    INTEGRAL = "integral"

class Turma(TimestampMixin, Base):
    __tablename__ = "Turma"

    id: Mapped[int] = mapped_column(primary_key=True)
    nome: Mapped[str] = mapped_column(String(100), nullable=False)
    turno: Mapped[Turno | None] = mapped_column(
        Enum(Turno, name="turno", native_enum=False, length=20),
        nullable=True,
    )
    status: Mapped[StatusTurma] = mapped_column(
        Enum(StatusTurma, name="status_turma", native_enum=False, length=20),
        default=StatusTurma.ATIVO,
        nullable=False,
    )
    id_etapa: Mapped[int] = mapped_column(ForeignKey("Etapa.id"), nullable=False)

    etapa: Mapped["Etapa"] = relationship(back_populates="turmas")
    alunos: Mapped[list["Aluno"]] = relationship(back_populates="turma")
