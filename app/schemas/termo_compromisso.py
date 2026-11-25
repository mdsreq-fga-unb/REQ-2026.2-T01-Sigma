"""Schemas do Termo de compromisso escolar (UC04 / issue #107).

Regras (FE01 / RN06): para salvar, nome e CPF do responsável, modalidade e regime. Com
`assinatura: true`, a data da assinatura também é obrigatória (e não pode ser futura); com
`false` ou ausente, a data é limpa. `completa` exige ainda o termo assinado e com data.
CPF com 11 dígitos válidos, sem unicidade. O 422 lista **todos** os campos com problema.
"""
import enum
from collections.abc import Mapping
from datetime import date, datetime
from typing import Any, NoReturn, Self

from pydantic import (
    BaseModel,
    ConfigDict,
    ModelWrapValidatorHandler,
    ValidationError,
    ValidationInfo,
    field_serializer,
    field_validator,
    model_validator,
)
from pydantic_core import InitErrorDetails, PydanticCustomError

from app.core.tempo import para_sao_paulo
from app.models.termo_comp import ModalidadeEnsino, RegimeAtendimento
from app.schemas.termo_comum import (
    AlunoTermoResponse,
    Caminho,
    EntradaBase,
    avaliar_campos,
    data_iso,
    erro_campo_obrigatorio,
    esta_vazio,
    levantar_erros,
    limpar_texto,
)

# Configuração do termo. É o ÚNICO lugar para ajustar campos, nomes e limites

# Nomes legíveis, na ordem da tela. Usados nas mensagens de erro e no histórico de edições.
ROTULOS: dict[Caminho, str] = {
    ("nome_responsavel",): "Responsável – nome",
    ("cpf_responsavel",): "Responsável – CPF",
    ("modalidade",): "Modalidade",
    ("regime",): "Regime",
    ("assinatura",): "Leitura e assinatura do termo",
    ("data_assinatura",): "Data da assinatura",
}
# FE01: sem estes campos o termo não é salvo. A data entra quando o termo foi assinado.
CAMPOS_OBRIGATORIOS: tuple[Caminho, ...] = (("nome_responsavel",), ("cpf_responsavel",), ("modalidade",), ("regime",))
CAMPO_DATA_ASSINATURA: Caminho = ("data_assinatura",)
LIMITES: dict[Caminho, int] = {("nome_responsavel",): 150}  # tamanho da coluna
CAMPOS_CPF: tuple[Caminho, ...] = (("cpf_responsavel",),)

# Opções aceitas por campo e o texto delas na tela e no PDF.
OPCOES: dict[str, type[enum.Enum]] = {"modalidade": ModalidadeEnsino, "regime": RegimeAtendimento}
ROTULOS_MODALIDADE = {ModalidadeEnsino.CRECHE: "Creche", ModalidadeEnsino.PRE_ESCOLA: "Pré-escola"}
ROTULOS_REGIME = {
    RegimeAtendimento.TEMPO_INTEGRAL: "Tempo integral",
    RegimeAtendimento.PARCIAL_MATUTINO: "Parcial – matutino",
    RegimeAtendimento.PARCIAL_VESPERTINO: "Parcial – vespertino",
}


def obrigatorios(assinado: bool) -> tuple[Caminho, ...]:
    return CAMPOS_OBRIGATORIOS + ((CAMPO_DATA_ASSINATURA,) if assinado else ())


def avaliar(dados: Mapping[str, Any]) -> list[InitErrorDetails]:
    """Todas as pendências do termo, de uma vez (FE01). Lista vazia = sem pendências."""
    return avaliar_campos(
        dados, rotulos=ROTULOS, obrigatorios=obrigatorios(dados.get("assinatura") is True),
        limites=LIMITES, cpfs=CAMPOS_CPF,
    )


def termo_completo(dados: Mapping[str, Any]) -> bool:
    """Indicador `completa` (RN03): obrigatórios preenchidos, termo assinado e com data."""
    return dados.get("assinatura") is True and not esta_vazio(dados.get("data_assinatura")) and not avaliar(dados)


def _juntar_com_faltantes(excecao: ValidationError, dados_brutos: Any) -> NoReturn:
    """Erro de conversão de um campo (ex.: opção inválida) + os obrigatórios vazios, num único 422
    (FE01): sem isto, o Pydantic para no campo que não converteu. O valor recebido (`input`) não
    volta na resposta, porque pode ser um dado pessoal."""
    erros: list[InitErrorDetails] = [
        {"type": PydanticCustomError(e["type"], e["msg"].replace("{", "{{").replace("}", "}}")),
         "loc": e["loc"], "input": None}
        for e in excecao.errors()
    ]
    com_erro = {tuple(e["loc"]) for e in excecao.errors()}
    dados = dados_brutos if isinstance(dados_brutos, Mapping) else {}
    erros += [
        erro_campo_obrigatorio(caminho, ROTULOS[caminho])
        for caminho in obrigatorios(dados.get("assinatura") is True)
        if caminho not in com_erro and esta_vazio(limpar_texto(dados.get(caminho[0])))
    ]
    levantar_erros("TermoCompromissoUpdate", erros)


class _CamposTermo(BaseModel):
    """Campos do termo, iguais na entrada (PUT) e na resposta (GET e PUT)."""

    nome_responsavel: str | None = None
    cpf_responsavel: str | None = None  # só dígitos
    modalidade: ModalidadeEnsino | None = None
    regime: RegimeAtendimento | None = None
    assinatura: bool = False  # o responsável leu e assinou o termo em papel
    data_assinatura: date | None = None  # ISO (AAAA-MM-DD)


class TermoCompromissoUpdate(EntradaBase, _CamposTermo):
    """Corpo do PUT. Dados do aluno não são aceitos: são somente leitura."""

    model_config = ConfigDict(json_schema_extra={"campos_obrigatorios": [c[0] for c in CAMPOS_OBRIGATORIOS]})

    @field_validator("modalidade", "regime", mode="before")
    @classmethod
    def _opcao(cls, valor: Any, info: ValidationInfo) -> Any:
        """Aceita só o nome de uma opção (ex.: "CRECHE"). Outro valor vira erro em português."""
        opcoes, valor = OPCOES[info.field_name], limpar_texto(valor)
        if valor is None or isinstance(valor, opcoes):
            return valor
        if isinstance(valor, str) and valor in opcoes.__members__:
            return opcoes[valor]
        rotulo, nomes = ROTULOS[(info.field_name,)], ", ".join(opcoes.__members__)
        raise PydanticCustomError("opcao_invalida", f"{rotulo}: opção inválida. Use uma destas: {nomes}.")

    @field_validator("assinatura", mode="before")
    @classmethod
    def _assinatura(cls, valor: Any) -> Any:
        if valor is None or isinstance(valor, bool):
            return bool(valor)
        raise PydanticCustomError(
            "booleano_invalido", f"{ROTULOS[('assinatura',)]}: informe true (assinado) ou false (não assinado)."
        )

    @field_validator("data_assinatura", mode="before")
    @classmethod
    def _data_iso(cls, valor: Any) -> Any:
        return data_iso(valor)

    @model_validator(mode="wrap")
    @classmethod
    def _listar_tudo(cls, dados: Any, handler: ModelWrapValidatorHandler[Self]) -> Self:
        try:
            return handler(dados)
        except ValidationError as exc:
            _juntar_com_faltantes(exc, dados)

    @model_validator(mode="after")
    def _recusar_pendencias(self) -> Self:
        if not self.assinatura:
            self.data_assinatura = None  # sem assinatura não há data
        if erros := avaliar(self.model_dump()):
            levantar_erros(type(self).__name__, erros)
        return self


class TermoCompromissoResponse(_CamposTermo):
    aluno: AlunoTermoResponse
    completa: bool
    created_at: datetime | None = None  # nulos enquanto o termo não foi salvo
    updated_at: datetime | None = None

    @field_serializer("created_at", "updated_at")
    def serializa_datas_sao_paulo(self, valor: datetime | None):
        return para_sao_paulo(valor)
