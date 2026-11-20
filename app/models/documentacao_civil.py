import enum
from datetime import date
from typing import TYPE_CHECKING
from sqlalchemy import CheckConstraint, Date, Enum, ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from .const import UFS
from .mixins import TimestampMixin

if TYPE_CHECKING:
    from .aluno import Aluno

_UFS_SQL = ", ".join(f"'{u}'" for u in UFS)


class TipoCertidao(enum.Enum):
    NASCIMENTO = "NASCIMENTO"
    CASAMENTO = "CASAMENTO"


class DocumentacaoCivil(TimestampMixin, Base):
    """Documentação civil da criança (1:1 com Aluno). RG e certidão não mudam a cada ano letivo."""

    __tablename__ = "DocumentacaoCivil"

    id: Mapped[int] = mapped_column(primary_key=True)
    id_aluno: Mapped[int] = mapped_column(ForeignKey("Aluno.id"), unique=True)
    rg: Mapped[str | None] = mapped_column(String(20))
    orgao_emissor: Mapped[str | None] = mapped_column(String(100))
    uf_rg: Mapped[str | None] = mapped_column(String(2))
    data_expedicao: Mapped[date | None] = mapped_column(Date)
    tipo_certidao: Mapped[TipoCertidao | None] = mapped_column(Enum(TipoCertidao, name="tipo_certidao"))
    num_termo: Mapped[str | None] = mapped_column(String(20))  # texto para manter zeros à esquerda
    folha: Mapped[str | None] = mapped_column(String(10))  # texto para manter zeros à esquerda
    livro: Mapped[str | None] = mapped_column(String(20))
    data_emissao_certidao: Mapped[date | None] = mapped_column(Date)
    nome_cartorio: Mapped[str | None] = mapped_column(String(200))
    uf_cartorio: Mapped[str | None] = mapped_column(String(2))
    documento_estrangeiro: Mapped[str | None] = mapped_column(String(50))

    __table_args__ = (
        # RG é emitido por estado: o mesmo número pode existir em UFs diferentes.
        # num_termo NÃO tem unicidade: números se repetem entre cartórios e livros.
        UniqueConstraint("rg", "uf_rg", name="uq_documentacao_civil_rg_uf"),
        CheckConstraint(f"uf_rg IN ({_UFS_SQL})", name="ck_documentacao_civil_uf_rg"),
        CheckConstraint(f"uf_cartorio IN ({_UFS_SQL})", name="ck_documentacao_civil_uf_cartorio"),
    )

    aluno: Mapped["Aluno"] = relationship(back_populates="documentacao_civil")
