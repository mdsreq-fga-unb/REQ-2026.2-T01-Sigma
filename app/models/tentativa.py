from sqlalchemy import String
from sqlalchemy import ForeignKey
from datetime import datetime
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base
from .mixins import TimestampMixin

class TentativaLogin(TimestampMixin, Base):

    __tablename__ = "TentativaLogin"

    id:Mapped[int] = mapped_column(primary_key=True)
    email:Mapped[str] = mapped_column(String(150))
    id_user:Mapped[int] = mapped_column(ForeignKey("Usuario.id"))
    data_hora:Mapped[datetime] = mapped_column(default=True)
    sucesso:Mapped[bool] = mapped_column()
    motivo:Mapped[str] = mapped_column(default=True)

