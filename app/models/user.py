from sqlalchemy import String
from sqlalchemy import Boolean, Integer, Float, Numeric, LargeBinary
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base

class Usuario(Base):
    __tablename__ = "Usuario"

    id:Mapped[int] = mapped_column(primary_key=True)
    nome:Mapped[str] = mapped_column(String(100))
    email:Mapped[str] = mapped_column(String(100), unique=True)
    senha:Mapped[str] = mapped_column(String(20))
    is_Admin:Mapped[bool] = mapped_column(default=True)
