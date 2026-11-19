import enum
from sqlalchemy import JSON, String
from sqlalchemy import ForeignKey
from typing import TYPE_CHECKING
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from .mixins import TimestampMixin

if TYPE_CHECKING:
    from .requerimento_matricula import RequerimentoMatricula

class ProblemaSaude(enum.Enum):
    AUDICAO = "AUDICAO"
    GARGANTA = "GARGANTA"
    FALA = "FALA"
    VISAO = "VISAO"
    DESMAIOS = "DESMAIOS"
    RINS = "RINS"
    ALERGIA = "ALERGIA"
    OUTROS = "OUTROS"


class AcompanhamentoMedico(enum.Enum):
    PSICOLOGICO = "PSICOLOGICO"
    ALERGISTA = "ALERGISTA"
    UROLOGICO = "UROLOGICO"
    FONOAUDIOLOGICO = "FONOAUDIOLOGICO"
    CARDIOLOGICO = "CARDIOLOGICO"
    RINS = "RINS"
    OUTROS = "OUTROS"


class Saude(TimestampMixin, Base):

    __tablename__ = "Saude"

    tipo:Mapped[list[str] | None] = mapped_column(JSON, nullable=True)  # valores de ProblemaSaude
    descricao:Mapped[str] = mapped_column(String(1000), nullable=True)
    acomp:Mapped[list[str] | None] = mapped_column(JSON, nullable=True)  # valores de AcompanhamentoMedico
    descricao_acomp:Mapped[str] = mapped_column(String(1000), nullable=True)
    id_rm:Mapped[int] = mapped_column(ForeignKey("RequerimentoMatricula.id"), unique=True)
    id:Mapped[int] = mapped_column(primary_key=True)

    rm:Mapped["RequerimentoMatricula"] = relationship(back_populates="saude")
