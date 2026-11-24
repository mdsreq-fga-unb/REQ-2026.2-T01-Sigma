"""Acesso ao banco da matrícula e do Requerimento de matrícula (UC04).

Este módulo **não faz `commit`**: quem controla a transação é o service, que grava o aluno, a
matrícula, a documentação civil, o requerimento, a saúde e o histórico juntos ou não grava nada (FE04).
"""
from typing import Any

from sqlalchemy import exists, select
from sqlalchemy.orm import Session, joinedload

from app.models.aluno import Aluno
from app.models.documentacao_civil import DocumentacaoCivil
from app.models.matricula import Matricula
from app.models.requerimento_matricula import RequerimentoMatricula
from app.models.saude import Saude
from app.models.turma import Turma

ID_MAXIMO = 2_147_483_647  # maior valor do inteiro de 4 bytes (a chave primária no PostgreSQL)


def id_possivel(id_registro: int) -> bool:
    """Id fora do intervalo do inteiro do banco não pode existir (e a consulta estouraria)."""
    return 1 <= id_registro <= ID_MAXIMO


def consulta_matricula(id_matricula: int):
    """Matrícula com aluno, turma e etapa já carregados (poucas consultas, para caber nos 5 s)."""
    return (
        select(Matricula)
        .where(Matricula.id == id_matricula)
        .options(joinedload(Matricula.aluno).joinedload(Aluno.turma).joinedload(Turma.etapa))
    )


def buscar_matricula_com_requerimento(db: Session, id_matricula: int) -> Matricula | None:
    """Matrícula com aluno, turma, etapa, documentação civil, requerimento e saúde."""
    if not id_possivel(id_matricula):
        return None
    consulta = consulta_matricula(id_matricula).options(
        joinedload(Matricula.aluno).joinedload(Aluno.documentacao_civil),
        joinedload(Matricula.requerimento).joinedload(RequerimentoMatricula.saude),
    )
    return db.scalars(consulta).unique().first()


def existe_outro_aluno_com_cpf(db: Session, cpf: str, id_aluno: int) -> bool:
    return db.scalar(select(exists().where(Aluno.cpf == cpf, Aluno.id != id_aluno))) or False


def existe_outro_aluno_com_nis(db: Session, nis: str, id_aluno: int) -> bool:
    return db.scalar(select(exists().where(Aluno.nis == nis, Aluno.id != id_aluno))) or False


def existe_outro_aluno_com_rg(db: Session, rg: str, uf_rg: str | None, id_aluno: int) -> bool:
    """RG é único por UF (`uq_documentacao_civil_rg_uf`)."""
    condicao_uf = DocumentacaoCivil.uf_rg.is_(None) if uf_rg is None else DocumentacaoCivil.uf_rg == uf_rg
    return (
        db.scalar(
            select(exists().where(DocumentacaoCivil.rg == rg, condicao_uf, DocumentacaoCivil.id_aluno != id_aluno))
        )
        or False
    )


def atualizar(objeto: Any, valores: dict[str, Any]) -> None:
    for campo, valor in valores.items():
        setattr(objeto, campo, valor)


def criar_ou_atualizar_documentacao_civil(db: Session, aluno: Aluno, valores: dict[str, Any]) -> DocumentacaoCivil:
    """A documentação civil é do aluno (1:1), não da matrícula: vale para todos os anos letivos."""
    documentacao = aluno.documentacao_civil
    if documentacao is None:
        documentacao = DocumentacaoCivil(aluno=aluno, **valores)
        db.add(documentacao)
    else:
        atualizar(documentacao, valores)
    return documentacao


def criar_ou_atualizar_requerimento(
    db: Session, matricula: Matricula, valores: dict[str, Any]
) -> RequerimentoMatricula:
    """Requerimento da matrícula. Só mexe nesta matrícula."""
    requerimento = matricula.requerimento
    if requerimento is None:
        requerimento = RequerimentoMatricula(matricula=matricula, **valores)
        db.add(requerimento)
    else:
        atualizar(requerimento, valores)
    return requerimento


def criar_ou_atualizar_saude(db: Session, requerimento: RequerimentoMatricula, valores: dict[str, Any]) -> Saude:
    saude = requerimento.saude
    if saude is None:
        saude = Saude(rm=requerimento, **valores)
        db.add(saude)
    else:
        atualizar(saude, valores)
    return saude
