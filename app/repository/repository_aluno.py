"""Acesso ao banco para o cadastro do card do aluno e visão geral (UC04 / issue #108).

Este módulo não faz `commit`: a transação é controlada pelo service (FE04).
"""
from sqlalchemy import exists, select
from sqlalchemy.orm import Session, joinedload, selectinload

from app.models.aluno import Aluno
from app.models.etapa import Etapa
from app.models.ficha_socioeco import FichaSocioeconomica
from app.models.matricula import Matricula
from app.models.ops import Operacao
from app.models.pessoa import Pessoa
from app.models.requerimento_matricula import RequerimentoMatricula
from app.models.responsavel import Responsavel
from app.models.termo_saida import TermoSaida
from app.models.turma import Turma
from app.models.user import Usuario
from app.repository.repository_historico import TIPOS_FORA_DO_HISTORICO
from app.repository.repository_matricula import id_possivel


def existe_aluno_com_cpf(db: Session, cpf: str) -> bool:
    return db.scalar(select(exists().where(Aluno.cpf == cpf))) or False


def existe_aluno_com_nis(db: Session, nis: str) -> bool:
    return db.scalar(select(exists().where(Aluno.nis == nis))) or False


def buscar_etapa_por_id(db: Session, id_etapa: int) -> Etapa | None:
    if not id_possivel(id_etapa):
        return None
    return db.get(Etapa, id_etapa)


def buscar_responsavel_por_cpf(db: Session, cpf: str) -> Responsavel | None:
    consulta = (
        select(Responsavel)
        .join(Pessoa, Responsavel.id_pessoa == Pessoa.id)
        .where(Pessoa.cpf == cpf)
    )
    return db.scalars(consulta).first()


def buscar_pessoa_por_id(db: Session, id_pessoa: int) -> Pessoa | None:
    return db.get(Pessoa, id_pessoa)


def buscar_aluno_visao_geral(db: Session, id_aluno: int) -> Aluno | None:
    """Carrega o aluno com responsável, turma/etapa, matrículas e todas as 5 fichas."""
    if not id_possivel(id_aluno):
        return None
    consulta = (
        select(Aluno)
        .where(Aluno.id == id_aluno)
        .options(
            joinedload(Aluno.responsavel),
            joinedload(Aluno.turma).joinedload(Turma.etapa),
            joinedload(Aluno.documentacao_civil),
            selectinload(Aluno.matriculas).joinedload(Matricula.etapa),
            selectinload(Aluno.matriculas)
            .joinedload(Matricula.requerimento)
            .joinedload(RequerimentoMatricula.saude),
            selectinload(Aluno.matriculas)
            .joinedload(Matricula.ficha_socioeconomica)
            .selectinload(FichaSocioeconomica.familiares),
            selectinload(Aluno.matriculas).joinedload(Matricula.termo_imagem),
            selectinload(Aluno.matriculas)
            .joinedload(Matricula.termo_saida)
            .selectinload(TermoSaida.pessoas_autorizadas),
            selectinload(Aluno.matriculas).joinedload(Matricula.termo_compromisso),
        )
    )
    return db.scalars(consulta).unique().first()


def buscar_ultima_edicao(db: Session, id_aluno: int) -> tuple[Operacao, Usuario] | None:
    """Operação mais recente do histórico do aluno (sem exportação de PDF nem consulta): é a
    primeira linha de `GET /alunos/{id}/historico`."""
    consulta = (
        select(Operacao, Usuario)
        .join(Usuario, Operacao.id_user == Usuario.id)
        .where(Operacao.id_aluno == id_aluno, Operacao.tipo.not_in(TIPOS_FORA_DO_HISTORICO))
        .order_by(Operacao.data_op.desc(), Operacao.id.desc())
        .limit(1)
    )
    row = db.execute(consulta).first()
    return (row[0], row[1]) if row is not None else None
