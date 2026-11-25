import enum
from datetime import date
from typing import TYPE_CHECKING
from sqlalchemy import Boolean, Date, Enum, ForeignKey, String, false
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from .mixins import TimestampMixin

if TYPE_CHECKING:
    from .matricula import Matricula


class ModalidadeEnsino(enum.Enum):
    CRECHE = "CRECHE"
    PRE_ESCOLA = "PRE_ESCOLA"


class RegimeAtendimento(enum.Enum):
    TEMPO_INTEGRAL = "TEMPO_INTEGRAL"
    PARCIAL_MATUTINO = "PARCIAL_MATUTINO"
    PARCIAL_VESPERTINO = "PARCIAL_VESPERTINO"


class TermoCompromisso(TimestampMixin, Base):
    """Termo de compromisso escolar da matrícula (1:1). Os dados do responsável que assina ficam aqui.

    No banco os campos são opcionais; a obrigatoriedade é validada no schema (issue #107).
    """

    __tablename__ = "TermoCompromisso"

    id: Mapped[int] = mapped_column(primary_key=True)
    nome_responsavel: Mapped[str | None] = mapped_column(String(150))
    cpf_responsavel: Mapped[str | None] = mapped_column(String(11))  # só dígitos; sem unicidade
    modalidade: Mapped[ModalidadeEnsino | None] = mapped_column(Enum(ModalidadeEnsino, name="modalidade_ensino"))
    regime: Mapped[RegimeAtendimento | None] = mapped_column(Enum(RegimeAtendimento, name="regime_atendimento"))
    # O responsável leu e assinou o termo em papel. Com assinatura, a data é obrigatória (schema).
    assinatura: Mapped[bool] = mapped_column(Boolean, default=False, server_default=false())
    data_assinatura: Mapped[date | None] = mapped_column(Date)
    id_matricula: Mapped[int] = mapped_column(ForeignKey("Matricula.id"), unique=True)

    matricula: Mapped["Matricula"] = relationship(back_populates="termo_compromisso")
