from sqlalchemy import String
from sqlalchemy import ForeignKey
from typing import TYPE_CHECKING
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from .mixins import TimestampMixin

if TYPE_CHECKING:
    from .tasa import TermoSaida
    from .pessoa import Pessoa

class PessoaAutorizada(TimestampMixin, Base):

    __tablename__ = "PessoaAutorizada"

    nome:Mapped[str] = mapped_column(String(100))
    parentesco:Mapped[str] = mapped_column(String(100))
    id_tasa:Mapped[int] = mapped_column(ForeignKey("TermoSaida.id"))
    id_pessoa:Mapped[int] = mapped_column(ForeignKey("Pessoa.id"))
    id:Mapped[int] = mapped_column(primary_key=True)

    tasa:Mapped["TermoSaida"] = relationship(back_populates="pessoa_autorizada")
    pessoa:Mapped["Pessoa"] = relationship(back_populates="pessoa_autorizada")