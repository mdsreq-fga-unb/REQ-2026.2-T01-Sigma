from datetime import datetime
import enum
from sqlalchemy import DateTime, Enum, ForeignKey, Index, JSON, String, func, text
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base
from .mixins import TimestampMixin

class Tipo(str, enum.Enum):
    CONSULTA = "Consulta"
    INATIVACAO = "Inativacao"
    MATRICULA = "Matricula"
    LOGIN = "LOGIN"
    LOGOUT = "LOGOUT"
    CADASTRO_USUARIO = "CADASTRO_USUARIO"
    CADASTRO_ETAPA = "CADASTRO_ETAPA"
    CADASTRO_TURMA = "CADASTRO_TURMA"
    INATIVACAO_TURMA = "INATIVACAO_TURMA"
    INATIVACAO_USUARIO = "INATIVACAO_USUARIO"
    REATIVACAO_USUARIO = "REATIVACAO_USUARIO"
    PREENCHIMENTO_REQUERIMENTO = "PREENCHIMENTO_REQUERIMENTO"
    EDICAO_REQUERIMENTO = "EDICAO_REQUERIMENTO"
    PREENCHIMENTO_SOCIOECONOMICA = "PREENCHIMENTO_SOCIOECONOMICA"
    EDICAO_SOCIOECONOMICA = "EDICAO_SOCIOECONOMICA"
    PREENCHIMENTO_TERMO_IMAGEM = "PREENCHIMENTO_TERMO_IMAGEM"
    EDICAO_TERMO_IMAGEM = "EDICAO_TERMO_IMAGEM"
    PREENCHIMENTO_TERMO_SAIDA = "PREENCHIMENTO_TERMO_SAIDA"
    EDICAO_TERMO_SAIDA = "EDICAO_TERMO_SAIDA"
    EXPORTACAO_PDF = "EXPORTACAO_PDF"

class Operacao(TimestampMixin, Base):
    __tablename__ = "Operacao"

    __table_args__ = (Index("ix_operacao_id_aluno_data_op", "id_aluno", "data_op"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    id_user: Mapped[int] = mapped_column(ForeignKey("Usuario.id"))
    id_aluno: Mapped[int | None] = mapped_column(ForeignKey("Aluno.id"), nullable=True)
    tipo: Mapped[Tipo] = mapped_column(Enum(Tipo, name="tipo"))
    data_op: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )
    descricao: Mapped[str] = mapped_column(String(1000))  # resumo curto da operação
    # Alterações estruturadas: [{ficha, campo, valor_anterior, valor_novo, sensivel}]
    alteracoes: Mapped[list[dict]] = mapped_column(JSON, default=list, server_default=text("'[]'"))
