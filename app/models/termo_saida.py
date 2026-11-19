import enum
from datetime import date
from typing import TYPE_CHECKING
from sqlalchemy import Date, Enum, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from .mixins import TimestampMixin

if TYPE_CHECKING:
    from .matricula import Matricula
    from .pessoas_a import PessoaAutorizada


class FormaSaida(enum.Enum):
    RESPONSAVEIS = "RESPONSAVEIS"
    TRANSPORTE_ESCOLAR = "TRANSPORTE_ESCOLAR"
    OUTROS = "OUTROS"


class TermoSaida(TimestampMixin, Base):
    """Autorização de saída da criança (1:1 com Matricula). O local é fixo e fica na configuração da aplicação."""

    __tablename__ = "TermoSaida"

    id: Mapped[int] = mapped_column(primary_key=True)
    tipo_saida: Mapped[FormaSaida | None] = mapped_column(Enum(FormaSaida, name="forma_saida"))
    descricao_outros: Mapped[str | None] = mapped_column(String(300))  # preenchido quando tipo_saida = OUTROS
    data: Mapped[date | None] = mapped_column(Date)  # data da assinatura, sem hora
    resp_nome: Mapped[str | None] = mapped_column(String(150))
    periodo: Mapped[str | None] = mapped_column(String(50))  # texto livre
    id_matricula: Mapped[int] = mapped_column(ForeignKey("Matricula.id"), unique=True)

    matricula: Mapped["Matricula"] = relationship(back_populates="termo_saida")
    # A API sincroniza a lista inteira: pessoas retiradas são apagadas
    pessoas_autorizadas: Mapped[list["PessoaAutorizada"]] = relationship(
        back_populates="termo_saida", cascade="all, delete-orphan",
    )
