from sqlalchemy import String
from sqlalchemy import ForeignKey
from typing import TYPE_CHECKING
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from .mixins import TimestampMixin

if TYPE_CHECKING:
    from .termo_saida import TermoSaida


class PessoaAutorizada(TimestampMixin, Base):
    """Pessoa autorizada a buscar a criança. Guarda só nome e parentesco (não depende de Pessoa)."""

    __tablename__ = "PessoaAutorizada"

    id: Mapped[int] = mapped_column(primary_key=True)
    nome: Mapped[str] = mapped_column(String(100))
    parentesco: Mapped[str] = mapped_column(String(50))  # texto livre
    id_termo_saida: Mapped[int] = mapped_column(ForeignKey("TermoSaida.id"))

    termo_saida: Mapped["TermoSaida"] = relationship(back_populates="pessoas_autorizadas")
