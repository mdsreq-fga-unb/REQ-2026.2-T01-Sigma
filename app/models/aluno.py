# app/models/aluno.py
import enum
from sqlalchemy import Enum, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base

class StatusAluno(enum.Enum):
    ATIVO = "ativo"
    INATIVO = "inativo"


class Aluno(Base):
    __tablename__ = "alunos"

    matricula: Mapped[int] = mapped_column(primary_key=True)
    nome: Mapped[str] = mapped_column(String(100))
    idade: Mapped[int] = mapped_column()
    nis: Mapped[str | None] = mapped_column(String(11), unique=True)
    cpf: Mapped[str] = mapped_column(String(11), unique=True)
    sexo: Mapped[str] = mapped_column(String(20))
    raca: Mapped[str] = mapped_column(String(30))
    nacionalidade: Mapped[str] = mapped_column(String(50))
    uf: Mapped[str] = mapped_column(String(2))
    endereco: Mapped[str] = mapped_column(String(200))
    telefone: Mapped[str] = mapped_column(String(20))
    email: Mapped[str] = mapped_column(String(150))
    status: Mapped[StatusAluno] = mapped_column(
        Enum(StatusAluno, name="status_aluno"),
        default=StatusAluno.ATIVO,
    )
    responsavel_id: Mapped[int] = mapped_column(ForeignKey("Responsavel.id"))
    turma_id: Mapped[int] = mapped_column(ForeignKey("Turma.id"))

