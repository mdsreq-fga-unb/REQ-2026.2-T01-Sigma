# app/models/matricula.py
from datetime import date
from typing import TYPE_CHECKING
from sqlalchemy import Date, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from .mixins import TimestampMixin

if TYPE_CHECKING:
    from .aluno import Aluno
    from .etapa import Etapa
    from .requerimento_matricula import RequerimentoMatricula
    from .ficha_socioeco import FichaSocioeconomica
    from .termo_saida import TermoSaida
    from .termo_imagem import TermoImagem
    from .termo_comp import TermoCompromisso

class Matricula(TimestampMixin, Base):

    __tablename__ = "Matricula"

    id: Mapped[int] = mapped_column(primary_key=True)
    ano: Mapped[int] = mapped_column()
    data_matricula: Mapped[date] = mapped_column(Date, server_default=func.current_date())
    id_aluno: Mapped[int] = mapped_column(ForeignKey("Aluno.id"))
    id_etapa: Mapped[int] = mapped_column(ForeignKey("Etapa.id"))  # etapa escolhida no cadastro do card

    etapa: Mapped["Etapa"] = relationship()

    aluno: Mapped["Aluno"] = relationship(back_populates="matriculas")
    requerimento: Mapped["RequerimentoMatricula | None"] = relationship(back_populates="matricula", uselist=False)
    ficha_socioeconomica: Mapped["FichaSocioeconomica | None"] = relationship(back_populates="matricula", uselist=False)
    termo_saida: Mapped["TermoSaida | None"] = relationship(back_populates="matricula", uselist=False)
    termo_imagem: Mapped["TermoImagem | None"] = relationship(back_populates="matricula", uselist=False)
    termo_compromisso: Mapped["TermoCompromisso | None"] = relationship(back_populates="matricula", uselist=False)
