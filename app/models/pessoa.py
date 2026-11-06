from sqlalchemy import String
from sqlalchemy import Boolean, Integer, Float, Numeric, LargeBinary
from sqlalchemy import ForeignKey
from datetime import datetime, date, time
from sqlalchemy import DateTime, func
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base

class Pessoa(Base):

    __tablename__ = "Pessoa"

    nome:Mapped[str] = mapped_column(String(150))
    id:Mapped[int] = mapped_column(primary_key=True)
    cpf:Mapped[str] = mapped_column(String(100), unique=True)
    tipo:Mapped[str] = mapped_column(String(100))
    trabalho:Mapped[str] = mapped_column(String(100));
    data_nasc:Mapped[date] = mapped_column()
