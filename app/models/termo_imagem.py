from datetime import date
from typing import TYPE_CHECKING
from sqlalchemy import Boolean, Date, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from .mixins import TimestampMixin

if TYPE_CHECKING:
    from .matricula import Matricula


class TermoImagem(TimestampMixin, Base):
    """Autorização de uso de imagem da matrícula (1:1). Os dados do responsável são guardados aqui."""

    __tablename__ = "TermoImagem"

    id: Mapped[int] = mapped_column(primary_key=True)
    autorizacao: Mapped[bool | None] = mapped_column(Boolean, nullable=True)  # None = não respondido
    id_matricula: Mapped[int] = mapped_column(ForeignKey("Matricula.id"), unique=True)

    # Responsável que assina o termo (não depende de Responsavel nem de Pessoa)
    resp_nome: Mapped[str | None] = mapped_column(String(150))
    resp_nacionalidade: Mapped[str | None] = mapped_column(String(50))
    resp_estado_civil: Mapped[str | None] = mapped_column(String(50))
    resp_rg: Mapped[str | None] = mapped_column(String(20))
    resp_cpf: Mapped[str | None] = mapped_column(String(11))  # só dígitos; sem unicidade
    residente_em: Mapped[str] = mapped_column(String(300))  # obrigatório; endereço montado do aluno
    local: Mapped[str | None] = mapped_column(String(100))
    data: Mapped[date | None] = mapped_column(Date)

    matricula: Mapped["Matricula"] = relationship(back_populates="termo_imagem")
