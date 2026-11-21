"""Peças comuns aos schemas dos termos da matrícula (UC04).

Contém o bloco do aluno (somente leitura) e o "motor" de validação que os dois termos usam
para listar **todas** as pendências de uma vez (FE01), no formato padrão de 422 do FastAPI:
um item por campo, com `loc` (posição no corpo da requisição) e `msg` (texto legível).
"""
import re
from collections.abc import Iterable, Mapping, Sequence
from datetime import date
from typing import TYPE_CHECKING, Any, NoReturn

from pydantic import BaseModel, field_validator
from pydantic_core import InitErrorDetails, PydanticCustomError, ValidationError

from app.core.tempo import hoje_sao_paulo
from app.core.validadores import cpf_valido

if TYPE_CHECKING:
    from app.models.matricula import Matricula

# Posição de um campo no corpo da requisição. Ex.: ("responsavel", "cpf") ou
# ("pessoas_autorizadas", 1, "parentesco").
Caminho = tuple[str | int, ...]

_DATA_ISO = re.compile(r"[0-9]{4}-[0-9]{2}-[0-9]{2}")


# Bloco do aluno (somente leitura nos dois termos)


class AlunoTermoResponse(BaseModel):
    """Identificação do aluno exibida nos termos. Para alterar estes dados, usa-se o requerimento."""

    nome: str
    data_nascimento: date
    etapa: str | None = None  # "ano/série": nome da etapa da turma do aluno
    ano_letivo: int  # ano da matrícula

    @classmethod
    def de_matricula(cls, matricula: "Matricula") -> "AlunoTermoResponse":
        aluno = matricula.aluno
        turma = aluno.turma
        return cls(
            nome=aluno.nome,
            data_nascimento=aluno.data_nasc,
            etapa=turma.etapa.nome if turma is not None and turma.etapa is not None else None,
            ano_letivo=matricula.ano,
        )


# Tratamento dos valores recebidos


def limpar_texto(valor: Any) -> Any:
    """Tira os espaços das pontas. Texto vazio vira `None` ("não preenchido")."""
    if isinstance(valor, str):
        valor = valor.strip()
        return valor or None
    return valor


def data_iso(valor: Any) -> Any:
    """Aceita só data ISO (AAAA-MM-DD). Outro formato vira erro em português."""
    valor = limpar_texto(valor)
    if valor is None or isinstance(valor, date):
        return valor
    if isinstance(valor, str) and _DATA_ISO.fullmatch(valor):
        try:
            return date.fromisoformat(valor)
        except ValueError:
            pass
    raise PydanticCustomError("data_invalida", "Data inválida. Use o formato AAAA-MM-DD.")


class EntradaBase(BaseModel):
    """Base dos blocos de entrada: texto só com espaços é tratado como não preenchido."""

    @field_validator("*", mode="before")
    @classmethod
    def _limpar_texto(cls, valor: Any) -> Any:
        return limpar_texto(valor)


def valor_em(dados: Mapping[str, Any], caminho: Caminho) -> Any:
    """Lê o valor de um campo num dicionário aninhado. Caminho inexistente devolve `None`."""
    atual: Any = dados
    for chave in caminho:
        if isinstance(atual, Mapping):
            atual = atual.get(chave)
        elif isinstance(atual, Sequence) and not isinstance(atual, str) and isinstance(chave, int):
            atual = atual[chave] if 0 <= chave < len(atual) else None
        else:
            return None
    return atual


def esta_vazio(valor: Any) -> bool:
    """`None` e texto em branco são "vazio". `False` e `0` são respostas válidas."""
    return valor is None or (isinstance(valor, str) and not valor.strip())


# Erros no formato dos 422 do FastAPI


def erro_campo_obrigatorio(caminho: Caminho, rotulo: str) -> InitErrorDetails:
    return {
        "type": PydanticCustomError(
            "campo_obrigatorio", "Campo obrigatório não preenchido: {campo}.", {"campo": rotulo}
        ),
        "loc": caminho,
        "input": None,
    }


def erro_regra(caminho: Caminho, tipo: str, mensagem: str) -> InitErrorDetails:
    return {"type": PydanticCustomError(tipo, mensagem), "loc": caminho, "input": None}


def levantar_erros(titulo: str, erros: Sequence[InitErrorDetails]) -> NoReturn:
    """Recusa o corpo da requisição listando todos os erros de uma vez (vira 422)."""
    raise ValidationError.from_exception_data(titulo, list(erros))


def avaliar_campos(
    dados: Mapping[str, Any],
    *,
    rotulos: Mapping[Caminho, str],
    obrigatorios: Iterable[Caminho],
    limites: Mapping[Caminho, int],
    cpfs: Iterable[Caminho] = (),
) -> list[InitErrorDetails]:
    """Confere os campos simples de um termo e devolve **todas** as pendências (FE01).

    Para cada campo de `rotulos`, na ordem da tela:
    - obrigatório e vazio: erro de campo obrigatório com o nome legível do campo;
    - texto maior que o limite da coluna: erro de tamanho;
    - CPF: 11 dígitos, só números, com dígito verificador válido;
    - data: não pode ser futura.
    """
    obrigatorios = set(obrigatorios)
    cpfs = set(cpfs)
    erros: list[InitErrorDetails] = []

    for caminho, rotulo in rotulos.items():
        valor = valor_em(dados, caminho)

        if esta_vazio(valor):
            if caminho in obrigatorios:
                erros.append(erro_campo_obrigatorio(caminho, rotulo))
            continue

        limite = limites.get(caminho)
        if limite is not None and isinstance(valor, str) and len(valor) > limite:
            erros.append(erro_tamanho(caminho, rotulo, limite))
            continue

        if caminho in cpfs and not cpf_valido(valor):
            erros.append(
                erro_regra(
                    caminho,
                    "cpf_invalido",
                    f"{rotulo} inválido. Informe os 11 dígitos de um CPF válido, sem pontuação.",
                )
            )
        elif isinstance(valor, date) and valor > hoje_sao_paulo():
            erros.append(erro_regra(caminho, "data_futura", f"{rotulo}: a data não pode ser futura."))

    return erros


def erro_tamanho(caminho: Caminho, rotulo: str, limite: int) -> InitErrorDetails:
    return erro_regra(caminho, "texto_longo", f"{rotulo} deve ter no máximo {limite} caracteres.")
