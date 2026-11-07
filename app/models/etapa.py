from sqlalchemy import String
from sqlalchemy import Boolean, Integer, Float, Numeric, LargeBinary
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base

class Etapa(Base):

    __tablename__ = "Etapa"

    nome:Mapped[str] = mapped_column(String(100))
    codigo:Mapped[int] = mapped_column(primary_key=True)

