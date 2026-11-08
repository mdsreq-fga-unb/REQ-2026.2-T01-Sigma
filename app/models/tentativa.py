from datetime import datetime
from sqlalchemy import Boolean, DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base
from .mixins import TimestampMixin

class TentativaLogin(TimestampMixin, Base):
    __tablename__ = "TentativaLogin"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(150))
    id_user: Mapped[int | None] = mapped_column(ForeignKey("Usuario.id"), nullable=True)
    data_hora: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    sucesso: Mapped[bool] = mapped_column(Boolean)
    motivo: Mapped[str] = mapped_column(String(50))
