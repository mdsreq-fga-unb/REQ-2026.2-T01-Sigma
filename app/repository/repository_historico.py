"""Consulta do histórico de edições do card do aluno (UC04 / FA04 / RF17 / issue #109).

Somente leitura: não existe função para editar ou apagar `Operacao` (o histórico é imutável).
As consultas filtram por `id_aluno` e ordenam por `data_op`, usando o índice
`ix_operacao_id_aluno_data_op` (#104).
"""
from collections.abc import Collection
from datetime import datetime

from sqlalchemy import exists, select
from sqlalchemy.orm import Session

from app.models.aluno import Aluno
from app.models.ops import Operacao, Tipo
from app.models.user import Usuario
from app.repository.repository_matricula import id_possivel

# Operações que não são edição e nunca aparecem no histórico nem na "Última edição".
TIPOS_FORA_DO_HISTORICO = (Tipo.EXPORTACAO_PDF, Tipo.CONSULTA)


def aluno_existe(db: Session, id_aluno: int) -> bool:
    if not id_possivel(id_aluno):
        return False
    return db.scalar(select(exists().where(Aluno.id == id_aluno))) or False


def buscar_operacoes(
    db: Session,
    id_aluno: int,
    *,
    tipos: Collection[Tipo] | None = None,
    id_usuario: int | None = None,
    desde: datetime | None = None,
) -> list[tuple[Operacao, Usuario]]:
    """Operações do histórico do aluno com o autor, da mais recente para a mais antiga."""
    consulta = (
        select(Operacao, Usuario)
        .join(Usuario, Operacao.id_user == Usuario.id)
        .where(Operacao.id_aluno == id_aluno, Operacao.tipo.not_in(TIPOS_FORA_DO_HISTORICO))
        .order_by(Operacao.data_op.desc(), Operacao.id.desc())
    )
    if tipos is not None:
        consulta = consulta.where(Operacao.tipo.in_(tipos))
    if id_usuario is not None:
        consulta = consulta.where(Operacao.id_user == id_usuario)
    if desde is not None:
        consulta = consulta.where(Operacao.data_op >= desde)
    return [(operacao, usuario) for operacao, usuario in db.execute(consulta).all()]


def listar_autores(db: Session, id_aluno: int) -> list[tuple[int, str]]:
    """Usuários com algum registro no histórico do aluno (para o filtro "Usuário"), por nome."""
    consulta = (
        select(Usuario.id, Usuario.nome)
        .join(Operacao, Operacao.id_user == Usuario.id)
        .where(Operacao.id_aluno == id_aluno, Operacao.tipo.not_in(TIPOS_FORA_DO_HISTORICO))
        .distinct()
        .order_by(Usuario.nome, Usuario.id)
    )
    return [(id_usuario, nome) for id_usuario, nome in db.execute(consulta).all()]
