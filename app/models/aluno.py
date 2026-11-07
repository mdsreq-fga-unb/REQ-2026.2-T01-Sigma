# app/models/aluno.py
import enum
from sqlalchemy import CheckConstraint, Enum, ForeignKey, String
from datetime import date
from typing import TYPE_CHECKING
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from .const import UFS
from .mixins import TimestampMixin

if TYPE_CHECKING:
    from .turma import Turma
    from .resp import Responsavel

class StatusAluno(enum.Enum):
    ATIVO = "ativo"
    INATIVO = "inativo"

class Raca(enum.Enum):
    BRANCO = "Branca"
    PRETO = "Preta"
    PARDO = "Parda"
    AMARELO = "Amarela"
    INDIGENA = "Indígena"
    NAO_DECLARADO = "Não Declarada"

class Sexo(enum.Enum):
    FEMININO = "Feminino"
    MASCULINO = "Masculino"
    NAO_DECLARADO = "Não Declarado"

class Aluno(TimestampMixin, Base):
    __tablename__ = "Aluno"

    id: Mapped[int] = mapped_column(primary_key=True)
    nome: Mapped[str] = mapped_column(String(100))
    data_nasc: Mapped[date] = mapped_column()
    nis: Mapped[str | None] = mapped_column(String(11), unique=True)
    cpf: Mapped[str] = mapped_column(String(11), unique=True)
    sexo: Mapped[Sexo] = mapped_column(Enum(Sexo, name="sexo"))
    raca: Mapped[Raca] = mapped_column(Enum(Raca, name="raca"), default=Raca.NAO_DECLARADO)
    nacionalidade: Mapped[str] = mapped_column(String(50))
    uf: Mapped[str] = mapped_column(String(2))
    __table_args__ = (
        CheckConstraint(
            "uf IN (" + ", ".join(f"'{u}'" for u in UFS) + ")",
            name="ck_alunos_uf",
        ),
    )
    endereco: Mapped[str] = mapped_column(String(200))
    cidade: Mapped[str] = mapped_column(String(100))
    cep: Mapped[str] = mapped_column(String(9))
    status: Mapped[StatusAluno] = mapped_column(
        Enum(StatusAluno, name="status_aluno"),
        default=StatusAluno.ATIVO,
    )
    responsavel_id: Mapped[int] = mapped_column(ForeignKey("Responsavel.id"))
    turma_id: Mapped[int] = mapped_column(ForeignKey("Turma.id"))

    responsavel: Mapped["Responsavel"] = relationship(back_populates="alunos")
    turma: Mapped["Turma"] = relationship(back_populates="alunos")

