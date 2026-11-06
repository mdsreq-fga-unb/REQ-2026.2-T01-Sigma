from sqlalchemy import String
from sqlalchemy import Boolean, Integer, Float, Numeric, LargeBinary
from sqlalchemy import ForeignKey
from datetime import datetime, date, time
from sqlalchemy import DateTime, func
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base



class Responsavel(Base):

    __tablename__ = "Responsavel"

    mat_aluno:Mapped[int] = mapped_column(ForeignKey("Aluno.matricula"))
    id_pessoa:Mapped[int] = mapped_column(ForeignKey("Pessoa.id"))
    id:Mapped[int] = mapped_column(primary_key=True)


