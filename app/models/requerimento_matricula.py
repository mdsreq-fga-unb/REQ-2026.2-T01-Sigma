from datetime import date
from typing import TYPE_CHECKING
from sqlalchemy import JSON, ForeignKey, String, text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from .mixins import TimestampMixin

if TYPE_CHECKING:
    from .matricula import Matricula
    from .documento import Documento
    from .saude import Saude


class RequerimentoMatricula(TimestampMixin, Base):

    __tablename__ = "RequerimentoMatricula"

    id: Mapped[int] = mapped_column(primary_key=True)
    nome_pai: Mapped[str | None] = mapped_column(String(100))
    nome_mae: Mapped[str | None] = mapped_column(String(100))
    esc_pai: Mapped[str | None] = mapped_column(String(100))
    esc_mae: Mapped[str | None] = mapped_column(String(100))
    tel_pai: Mapped[str | None] = mapped_column(String(11))  # só dígitos
    tel_mae: Mapped[str | None] = mapped_column(String(11))  # só dígitos
    loc_pai: Mapped[str | None] = mapped_column(String(200))
    loc_mae: Mapped[str | None] = mapped_column(String(200))
    data_ped_transf: Mapped[date | None] = mapped_column()
    data_ent_transf: Mapped[date | None] = mapped_column()
    telefone_requerimento: Mapped[str | None] = mapped_column(String(11))  # campo "Telefone" da tela, só dígitos
    nome_resp_compromisso: Mapped[str | None] = mapped_column(String(150))
    nome_resp_transferencia: Mapped[str | None] = mapped_column(String(150))
    # Checklist de entrega (valores de TipoDocumento). Não depende de arquivo anexado.
    documentos_entregues: Mapped[list[str]] = mapped_column(JSON, default=list, server_default=text("'[]'"))
    id_matricula: Mapped[int] = mapped_column(ForeignKey("Matricula.id"), unique=True)

    matricula: Mapped["Matricula"] = relationship(back_populates="requerimento")
    documentos: Mapped[list["Documento"]] = relationship(back_populates="rm")
    saude: Mapped["Saude | None"] = relationship(back_populates="rm", uselist=False)
