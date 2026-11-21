"""Histórico de edições das fichas e termos da matrícula (UC04 / FA01 / FA04 / RF17).

Cada preenchimento, edição e exportação vira uma `Operacao` com autor, data e aluno.
A descrição guarda só os **nomes** dos campos alterados, nunca os valores: RG, CPF,
endereço, nomes e outros dados pessoais não podem ficar no histórico (LGPD).

Reaproveitável pelas outras fichas da matrícula.
"""
from collections.abc import Mapping
from typing import Any

from sqlalchemy.orm import Session

from app.core.tempo import agora_utc
from app.models.ops import Operacao, Tipo
from app.models.user import Usuario

LIMITE_DESCRICAO = 1000  # tamanho da coluna Operacao.descricao


def _normalizar(valor: Any) -> Any:
    """Texto vazio e `None` contam como o mesmo "não preenchido"."""
    if isinstance(valor, str) and not valor.strip():
        return None
    return valor


def campos_alterados(
    antes: Mapping[Any, Any],
    depois: Mapping[Any, Any],
    rotulos: Mapping[Any, str],
) -> list[str]:
    """Nomes legíveis dos campos cujo valor mudou, na ordem de `rotulos` (a ordem da tela).

    `antes` e `depois` são fotografias do estado da ficha, com a mesma chave de `rotulos`.
    Só os nomes saem daqui: os valores nunca são copiados.
    """
    return [
        rotulo
        for chave, rotulo in rotulos.items()
        if _normalizar(antes.get(chave)) != _normalizar(depois.get(chave))
    ]


def descrever(ficha: str, acao: str, ano_letivo: int, alterados: list[str] | None = None) -> str:
    """Texto do histórico. Ex.: "Termo ... editado (ano letivo 2026). Campos alterados: A; B."."""
    texto = f"{ficha} {acao} (ano letivo {ano_letivo})."
    if alterados:
        texto += " Campos alterados: " + "; ".join(alterados) + "."
    return texto


def registrar(
    db: Session,
    usuario: Usuario,
    id_aluno: int | None,
    tipo: Tipo,
    descricao: str,
) -> Operacao:
    """Adiciona a `Operacao` à sessão **sem `commit`**: ela é gravada junto com a ficha (FE04)."""
    if len(descricao) > LIMITE_DESCRICAO:
        descricao = descricao[: LIMITE_DESCRICAO - 1] + "…"

    operacao = Operacao(
        id_user=usuario.id,
        id_aluno=id_aluno,
        tipo=tipo,
        data_op=agora_utc(),
        descricao=descricao,
    )
    db.add(operacao)
    return operacao
