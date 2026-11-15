from sqlalchemy import String
from sqlalchemy import ForeignKey
from typing import TYPE_CHECKING
from datetime import date, datetime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from .mixins import TimestampMixin

if TYPE_CHECKING:
    from .matricula import Matricula
    from .documento import Documento
    from .saude import Saude

class RequerimentoMatricula(TimestampMixin, Base):

    __tablename__ = "RequerimentoMatricula"

    id:Mapped[int] = mapped_column(primary_key=True)
    rg:Mapped[str] = mapped_column(String(11), unique=True)
    oe:Mapped[str] = mapped_column(String(100))
    uf:Mapped[str] = mapped_column(String(3))
    data_exp:Mapped[date] = mapped_column()
    certidao:Mapped[bool] = mapped_column()
    num_termo:Mapped[int] = mapped_column(unique=True)
    folha:Mapped[int] = mapped_column()
    livro:Mapped[str] = mapped_column(String(100))
    data_emiss:Mapped[date] = mapped_column()
    nome_cart:Mapped[str] = mapped_column(String(200))
    uf_cart:Mapped[str] = mapped_column(String(3))
    nome_pai:Mapped[str] = mapped_column(String(100))
    nome_mae:Mapped[str] = mapped_column(String(100))
    esc_pai:Mapped[str] = mapped_column(String(100))
    esc_mae:Mapped[str] = mapped_column(String(100))
    tel_pai:Mapped[str] = mapped_column(String(100))
    tel_mae:Mapped[str] = mapped_column(String(100))
    loc_pai:Mapped[str] = mapped_column(String(200))
    loc_mae:Mapped[str] = mapped_column(String(200))
    data_ped_transf:Mapped[date] = mapped_column()
    data_ent_transf:Mapped[date] = mapped_column()
    id_matricula:Mapped[int] = mapped_column(ForeignKey("Matricula.id"), unique=True)

    matricula:Mapped["Matricula"] = relationship(back_populates="requerimento")
    documentos:Mapped[list["Documento"]] = relationship(back_populates="rm")
    saude:Mapped["Saude | None"] = relationship(back_populates="rm", uselist=False)
