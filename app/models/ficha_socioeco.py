import enum
from datetime import date
from decimal import Decimal
from typing import TYPE_CHECKING
from sqlalchemy import Boolean, CheckConstraint, Date, Enum, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from .mixins import TimestampMixin

if TYPE_CHECKING:
    from .matricula import Matricula
    from .familiar import Familiar


class SituacaoMoradia(enum.Enum):
    PROPRIO = "PROPRIO"
    CEDIDO = "CEDIDO"
    FINANCIADO = "FINANCIADO"
    ALUGADO = "ALUGADO"
    OCUPACAO_IRREGULAR = "OCUPACAO_IRREGULAR"


class MeioTransporte(enum.Enum):
    NENHUM_A_PE_BICICLETA = "NENHUM_A_PE_BICICLETA"
    CARONA = "CARONA"
    TRANSPORTE_COLETIVO = "TRANSPORTE_COLETIVO"
    CARRO_MOTO_PROPRIO = "CARRO_MOTO_PROPRIO"


class FichaSocioeconomica(TimestampMixin, Base):
    """Ficha socioeconômica da matrícula (1:1 com Matricula). Uma por ano letivo."""

    __tablename__ = "FichaSocioeconomica"

    id: Mapped[int] = mapped_column(primary_key=True)
    id_matricula: Mapped[int] = mapped_column(ForeignKey("Matricula.id"), unique=True)
    moradia: Mapped[SituacaoMoradia | None] = mapped_column(Enum(SituacaoMoradia, name="situacao_moradia"))
    cedido_por: Mapped[str | None] = mapped_column(String(150))
    valor: Mapped[Decimal | None] = mapped_column(Numeric(10, 2))  # valor mensal do imóvel
    transporte: Mapped[MeioTransporte | None] = mapped_column(Enum(MeioTransporte, name="meio_transporte"))
    possui_outras_propriedades: Mapped[bool | None] = mapped_column(Boolean)
    propriedades: Mapped[str | None] = mapped_column(Text)
    obs_nucleo_familiar: Mapped[str | None] = mapped_column(Text)
    telefone_contato: Mapped[str | None] = mapped_column(String(11))  # só dígitos
    celular: Mapped[str | None] = mapped_column(String(11))  # só dígitos
    email: Mapped[str | None] = mapped_column(String(150))
    declaracao_nome: Mapped[str | None] = mapped_column(String(150))
    declaracao_local: Mapped[str | None] = mapped_column(String(100))
    declaracao_data: Mapped[date | None] = mapped_column(Date)

    __table_args__ = (
        CheckConstraint("valor IS NULL OR valor >= 0", name="ck_ficha_valor_nao_negativo"),
    )

    matricula: Mapped["Matricula"] = relationship(back_populates="ficha_socioeconomica")
    # Membros retirados da lista são apagados (a API sincroniza a lista inteira)
    familiares: Mapped[list["Familiar"]] = relationship(back_populates="fs", cascade="all, delete-orphan")
