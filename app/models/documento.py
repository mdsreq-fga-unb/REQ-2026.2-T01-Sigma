import enum
from sqlalchemy import Enum, String
from sqlalchemy import ForeignKey
from typing import TYPE_CHECKING
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from .mixins import TimestampMixin

if TYPE_CHECKING:
    from .Req_matricula import RequerimentoMatricula

class TipoDocumento(enum.Enum):
    FOTO_3X4 = "2 fotos 3x4"
    COMPROVANTE_RESIDENCIA = "comprovante de residencia"
    CERTIDAO_NASCIMENTO = "certidao de nascimento"
    HISTORICO_ESCOLAR = "historico escolar"
    CARTAO_VACINA = "cartão vacina"

class Documento(TimestampMixin, Base):

    __tablename__ = "Documento"

    id:Mapped[int] = mapped_column(primary_key=True)
    nome:Mapped[str] = mapped_column(String(100))
    tipo:Mapped[TipoDocumento] = mapped_column(Enum(TipoDocumento, name="tipo_documento"))
    caminho_arquivo:Mapped[str] = mapped_column(String(500))
    id_rm:Mapped[int] = mapped_column(ForeignKey("RequerimentoMatricula.id"))

    rm:Mapped["RequerimentoMatricula"] = relationship(back_populates="documentos")
