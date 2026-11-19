from decimal import Decimal
from typing import TYPE_CHECKING
from sqlalchemy import CheckConstraint, ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from .mixins import TimestampMixin

if TYPE_CHECKING:
    from .ficha_socioeco import FichaSocioeconomica


class Familiar(TimestampMixin, Base):

    __tablename__ = "Familiar"

    id: Mapped[int] = mapped_column(primary_key=True)
    tipo: Mapped[str] = mapped_column(String(100))  # componente: mãe, pai, irmão etc.
    profissao: Mapped[str | None] = mapped_column(String(100))
    idade: Mapped[int] = mapped_column()
    estado_civil: Mapped[str | None] = mapped_column(String(100))
    escolaridade: Mapped[str | None] = mapped_column(String(100))
    renda_mensal: Mapped[Decimal | None] = mapped_column(Numeric(10, 2))
    id_fs: Mapped[int] = mapped_column(ForeignKey("FichaSocioeconomica.id"))

    __table_args__ = (
        CheckConstraint("idade BETWEEN 0 AND 120", name="ck_familiar_idade"),
        CheckConstraint("renda_mensal IS NULL OR renda_mensal >= 0", name="ck_familiar_renda_nao_negativa"),
    )

    fs: Mapped["FichaSocioeconomica"] = relationship(back_populates="familiares")
