"""Acesso ao banco dos termos da matrícula (UC04).

Este módulo **não faz `commit`**: quem controla a transação é o service, que grava o termo,
as pessoas autorizadas e o histórico de edições juntos ou não grava nada (FE04).
"""
from typing import Any

from sqlalchemy.orm import Session, joinedload, selectinload

from app.models.matricula import Matricula
from app.models.pessoas_a import PessoaAutorizada
from app.models.termo_comp import TermoCompromisso
from app.models.termo_imagem import TermoImagem
from app.models.termo_saida import TermoSaida
from app.repository.repository_matricula import consulta_matricula as _consulta_matricula
from app.repository.repository_matricula import id_possivel as _id_possivel


def buscar_matricula_com_termo_imagem(db: Session, id_matricula: int) -> Matricula | None:
    """Matrícula com aluno, turma, etapa e o Termo de imagem (se existir)."""
    if not _id_possivel(id_matricula):
        return None
    consulta = _consulta_matricula(id_matricula).options(joinedload(Matricula.termo_imagem))
    return db.scalars(consulta).unique().first()


def buscar_matricula_com_termo_saida(db: Session, id_matricula: int) -> Matricula | None:
    """Matrícula com aluno, turma, etapa, o Termo de saída (se existir) e suas pessoas autorizadas."""
    if not _id_possivel(id_matricula):
        return None
    consulta = _consulta_matricula(id_matricula).options(
        selectinload(Matricula.termo_saida).selectinload(TermoSaida.pessoas_autorizadas)
    )
    return db.scalars(consulta).unique().first()


def buscar_matricula_com_termo_compromisso(db: Session, id_matricula: int) -> Matricula | None:
    """Matrícula com aluno, turma, etapa e o Termo de compromisso escolar (se existir)."""
    if not _id_possivel(id_matricula):
        return None
    consulta = _consulta_matricula(id_matricula).options(joinedload(Matricula.termo_compromisso))
    return db.scalars(consulta).unique().first()


def _criar_ou_atualizar(db: Session, matricula: Matricula, relacao: str, modelo: type, valores: dict[str, Any]):
    """Cria o termo da matrícula (`relacao` é o atributo dela, ex.: "termo_imagem") ou atualiza o
    que já existe. Só mexe nesta matrícula."""
    termo = getattr(matricula, relacao)
    if termo is None:
        termo = modelo(matricula=matricula, **valores)
        db.add(termo)
    else:
        for campo, valor in valores.items():
            setattr(termo, campo, valor)
    return termo


def criar_ou_atualizar_termo_imagem(db: Session, matricula: Matricula, valores: dict[str, Any]) -> TermoImagem:
    return _criar_ou_atualizar(db, matricula, "termo_imagem", TermoImagem, valores)


def criar_ou_atualizar_termo_saida(db: Session, matricula: Matricula, valores: dict[str, Any]) -> TermoSaida:
    return _criar_ou_atualizar(db, matricula, "termo_saida", TermoSaida, valores)


def criar_ou_atualizar_termo_compromisso(db: Session, matricula: Matricula, valores: dict[str, Any]) -> TermoCompromisso:
    return _criar_ou_atualizar(db, matricula, "termo_compromisso", TermoCompromisso, valores)


def sincronizar_pessoas_autorizadas(termo: TermoSaida, pessoas: list[dict[str, Any]]) -> None:
    """Deixa as pessoas autorizadas do termo iguais à lista recebida.

    - com `id`: atualiza a pessoa (o service já conferiu que ela pertence a este termo);
    - sem `id`: cria;
    - existia e não veio na lista: remove (a cascata `delete-orphan` apaga a linha).
    """
    existentes = {pessoa.id: pessoa for pessoa in termo.pessoas_autorizadas}
    mantidas: set[int] = set()

    for dados in pessoas:
        id_pessoa = dados.get("id")
        if id_pessoa is None:
            termo.pessoas_autorizadas.append(
                PessoaAutorizada(nome=dados["nome"], parentesco=dados["parentesco"])
            )
        else:
            pessoa = existentes[id_pessoa]
            pessoa.nome = dados["nome"]
            pessoa.parentesco = dados["parentesco"]
            mantidas.add(id_pessoa)

    for id_pessoa, pessoa in existentes.items():
        if id_pessoa not in mantidas:
            termo.pessoas_autorizadas.remove(pessoa)
