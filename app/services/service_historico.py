"""Histórico de edições das fichas e termos da matrícula (UC04 / FA01 / FA04 / RF17).

Cada preenchimento, edição e exportação vira uma `Operacao` com autor, data e aluno.

- `descricao`: resumo curto, com os **nomes** dos campos alterados.
- `alteracoes`: lista estruturada, uma linha por campo alterado:
  {"ficha", "campo", "valor_anterior", "valor_novo", "sensivel"}.
  Os valores vêm já formatados para leitura (data, R$, Sim/Não, nome da opção).
  Campo sensível (app/core/auditoria.py) vem com `sensivel=True` e valores vazios.
"""
from collections.abc import Callable, Mapping, Sequence
from datetime import date
from decimal import Decimal
from enum import Enum
from typing import Any

from sqlalchemy.orm import Session

from app.core.auditoria import e_sensivel
from app.core.tempo import agora_utc
from app.models.ops import Operacao, Tipo
from app.models.user import Usuario

LIMITE_DESCRICAO = 1000  # tamanho da coluna Operacao.descricao

Formatador = Callable[[Any], str]


def _normalizar(valor: Any) -> Any:
    """Texto vazio e listas vazias contam como o mesmo "não preenchido" (None)."""
    if isinstance(valor, str) and not valor.strip():
        return None
    if isinstance(valor, (list, tuple)) and not valor:
        return None
    return valor


def _dinheiro(valor: Decimal | float) -> str:
    texto = f"{Decimal(str(valor)):,.2f}"  # 1,234.56
    return "R$ " + texto.replace(",", "X").replace(".", ",").replace("X", ".")  # R$ 1.234,56


def formatar(valor: Any) -> str:
    """Texto legível de um valor. Opções de enum com rótulo usam `rotulo_de`."""
    if isinstance(valor, bool):
        return "Sim" if valor else "Não"
    if isinstance(valor, Enum):
        return str(valor.value)
    if isinstance(valor, date):
        return valor.strftime("%d/%m/%Y")
    if isinstance(valor, (Decimal, float)):
        return _dinheiro(valor)
    return str(valor)


def rotulo_de(enum_cls: type[Enum], rotulos: Mapping[Any, str]) -> Formatador:
    """Formatador que troca o nome/valor de um enum pelo texto da opção.
    Ex.: 'PROPRIO' -> 'Própria'. Valor desconhecido volta como está."""

    def formatador(valor: Any) -> str:
        if isinstance(valor, enum_cls):
            membro = valor
        else:
            membro = enum_cls.__members__.get(valor) or next(
                (m for m in enum_cls if m.value == valor), None
            )
        if membro is None:
            return str(valor)
        return rotulos.get(membro, str(membro.value))

    return formatador


def _texto(valor: Any, formatador: Formatador | None = None) -> str:
    valor = _normalizar(valor)
    if valor is None:
        return ""
    if isinstance(valor, (list, tuple)):
        partes = [_texto(v, formatador) for v in valor]
        return "; ".join(p for p in partes if p)
    return formatador(valor) if formatador else formatar(valor)


def item(
    ficha: str,
    campo: str,
    anterior: Any = None,
    novo: Any = None,
    formatador: Formatador | None = None,
    *,
    sensivel: bool = False,
) -> dict[str, Any]:
    """Uma linha do histórico. Campo sensível sai sem valores."""
    if sensivel:
        return {"ficha": ficha, "campo": campo, "valor_anterior": "", "valor_novo": "", "sensivel": True}
    return {
        "ficha": ficha,
        "campo": campo,
        "valor_anterior": _texto(anterior, formatador),
        "valor_novo": _texto(novo, formatador),
        "sensivel": False,
    }


def itens_alterados(
    antes: Mapping[Any, Any],
    depois: Mapping[Any, Any],
    rotulos: Mapping[Any, str],
    ficha: str,
    formatadores: Mapping[Any, Formatador] | None = None,
) -> list[dict[str, Any]]:
    """Itens dos campos cujo valor mudou, na ordem de `rotulos` (a ordem da tela).

    `antes` e `depois` são fotografias da ficha, com as mesmas chaves (caminhos) de `rotulos`.
    """
    formatadores = formatadores or {}
    itens = []
    for caminho, rotulo in rotulos.items():
        valor_antes = antes.get(caminho)
        valor_depois = depois.get(caminho)
        if _normalizar(valor_antes) == _normalizar(valor_depois):
            continue
        itens.append(
            item(
                ficha,
                rotulo,
                valor_antes,
                valor_depois,
                formatadores.get(caminho),
                sensivel=e_sensivel(caminho),
            )
        )
    return itens


def nomes(itens: Sequence[Mapping[str, Any]]) -> list[str]:
    """Nomes dos campos alterados, sem repetição, para o resumo da descrição."""
    return list(dict.fromkeys(i["campo"] for i in itens))


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
    alteracoes: list[dict[str, Any]] | None = None,
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
        alteracoes=list(alteracoes or []),
    )
    db.add(operacao)
    return operacao
