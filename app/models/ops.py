from sqlalchemy import String
from sqlalchemy import Boolean, Integer, Float, Numeric, LargeBinary
from sqlalchemy import ForeignKey
from datetime import datetime, date, time
from sqlalchemy import DateTime, func
import enum
from sqlalchemy import Enum
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base
from .mixins import TimestampMixin

class Tipo(enum.Enum):
    CONSULTA = "Consulta"
    INATIVACAO = "Inativacao"
    MATRICULA = "Matricula"

class Operacao(TimestampMixin, Base):
    __tablename__ = "Operacao"

    id:Mapped[int] = mapped_column(primary_key=True)
    id_user:Mapped[int] = mapped_column(ForeignKey("Usuario.id"))
    id_aluno:Mapped[int] = mapped_column(ForeignKey("Aluno.id"))
    tipo:Mapped[Tipo] = mapped_column(Enum(Tipo, name="tipo"))
    data_op:Mapped[datetime] = mapped_column(DateTime(timezone=True),
    server_default=func.now(),)
    descricao:Mapped[str] = mapped_column(String(1000))
