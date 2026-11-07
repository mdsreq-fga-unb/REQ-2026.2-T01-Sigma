from sqlalchemy import String
from sqlalchemy import Boolean, Integer, Float, Numeric, LargeBinary
from sqlalchemy import ForeignKey
from datetime import datetime, date, time
from sqlalchemy import DateTime, func
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base

class Operacao(Base):
    __tablename__ = "Operacao"

    id:Mapped[int] = mapped_column(primary_key=True)
    id_user:Mapped[int] = mapped_column(ForeignKey("Usuario.id"))
    tipo:Mapped[str] = mapped_column(String(100))
    data_op:Mapped[datetime] = mapped_column()
    descricao:Mapped[str] = mapped_column(String(1000))
