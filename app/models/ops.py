from datetime import datetime
import enum
from sqlalchemy import DateTime, Enum, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base
from .mixins import TimestampMixin

class Tipo(enum.Enum):
    CONSULTA = "Consulta"
    INATIVACAO = "Inativacao"
    MATRICULA = "Matricula"
    LOGIN = "LOGIN"
    LOGOUT = "LOGOUT"

class Operacao(TimestampMixin, Base):
    __tablename__ = "Operacao"

    id: Mapped[int] = mapped_column(primary_key=True)
    id_user: Mapped[int] = mapped_column(ForeignKey("Usuario.id"))
    id_aluno: Mapped[int | None] = mapped_column(ForeignKey("Aluno.id"), nullable=True)
    tipo: Mapped[Tipo] = mapped_column(Enum(Tipo, name="tipo"))
    data_op: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )
    descricao: Mapped[str] = mapped_column(String(1000))
