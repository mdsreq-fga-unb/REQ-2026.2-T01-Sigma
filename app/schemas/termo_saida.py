"""Schemas do Termo de autorização de saída do aluno (UC04).

Entrada (PUT): `TermoSaidaUpdate`. Resposta (GET e PUT): `TermoSaidaResponse`.

Regras (issue #92):
- Forma de saída: RESPONSAVEIS, TRANSPORTE_ESCOLAR ou OUTROS.
- TRANSPORTE_ESCOLAR e OUTROS exigem ao menos uma pessoa autorizada; RESPONSAVEIS aceita a lista vazia.
- OUTROS exige a descrição. Nas outras formas a descrição é descartada.
- No máximo 4 pessoas autorizadas, enviadas como lista completa: com `id` é atualizada,
  sem `id` é criada e a que não vier na lista é removida.
- O período é texto livre (até 50 caracteres). A data não pode ser futura.
- O local é fixo e vem da configuração: só aparece na resposta e qualquer valor enviado é ignorado.
"""
from collections.abc import Mapping
from datetime import date, datetime
from typing import Any, Self

from pydantic import BaseModel, ConfigDict, Field, field_serializer, field_validator, model_validator
from pydantic_core import InitErrorDetails, PydanticCustomError

from app.core.tempo import para_sao_paulo
from app.models.termo_saida import FormaSaida
from app.schemas.termo_comum import (
    AlunoTermoResponse,
    Caminho,
    EntradaBase,
    avaliar_campos,
    data_iso,
    erro_campo_obrigatorio,
    erro_regra,
    erro_tamanho,
    esta_vazio,
    levantar_erros,
    limpar_texto,
)

# ----------------------------------------------------------------------------------------
# Configuração do termo. É o ÚNICO lugar para ajustar campos, nomes e limites quando o PO
# confirmar a lista de obrigatórios.
# ----------------------------------------------------------------------------------------

MAX_PESSOAS_AUTORIZADAS = 4

# Nomes legíveis, na ordem da tela. Usados nas mensagens de erro e no histórico de edições.
ROTULOS: dict[Caminho, str] = {
    ("responsavel", "nome"): "Responsável legal – nome",
    ("periodo",): "Período",
    ("saida", "forma_saida"): "Forma de saída",
    ("saida", "descricao_outros"): "Forma de saída – descrição de “Outros”",
    ("data",): "Data",
}
ROTULO_PESSOAS = "Pessoas autorizadas"

# Textos das opções de saída (tela e PDF).
ROTULOS_FORMA_SAIDA: dict[FormaSaida, str] = {
    FormaSaida.RESPONSAVEIS: "Responsáveis (pai/mãe)",
    FormaSaida.TRANSPORTE_ESCOLAR: "Transporte escolar",
    FormaSaida.OUTROS: "Outros",
}

# FE01: sem estes campos o termo não é salvo (422 listando todos os que faltam).
CAMPOS_OBRIGATORIOS: tuple[Caminho, ...] = (
    ("responsavel", "nome"),
    ("saida", "forma_saida"),
    ("data",),
)
# Obrigatórios em cada pessoa autorizada.
CAMPOS_OBRIGATORIOS_PESSOA: tuple[str, ...] = ("nome", "parentesco")

# Tamanhos das colunas de TermoSaida e PessoaAutorizada.
LIMITES: dict[Caminho, int] = {
    ("responsavel", "nome"): 150,
    ("periodo",): 50,
    ("saida", "descricao_outros"): 300,
}
LIMITES_PESSOA: dict[str, int] = {"nome": 100, "parentesco": 50}

# Formas de saída que exigem ao menos uma pessoa autorizada.
FORMAS_QUE_EXIGEM_PESSOAS = (FormaSaida.TRANSPORTE_ESCOLAR, FormaSaida.OUTROS)


def rotulo_pessoa(posicao: int, campo: str) -> str:
    """Nome legível de um campo de pessoa autorizada. `posicao` começa em 1."""
    return f"{ROTULO_PESSOAS} – pessoa {posicao} – {campo}"


def avaliar(dados: Mapping[str, Any]) -> list[InitErrorDetails]:
    """Todas as pendências do termo, de uma vez (FE01). Lista vazia = sem pendências."""
    forma = (dados.get("saida") or {}).get("forma_saida")
    pessoas = dados.get("pessoas_autorizadas") or []

    obrigatorios = set(CAMPOS_OBRIGATORIOS)
    if forma == FormaSaida.OUTROS:
        obrigatorios.add(("saida", "descricao_outros"))  # condicional

    erros = avaliar_campos(dados, rotulos=ROTULOS, obrigatorios=obrigatorios, limites=LIMITES)

    # Pessoas autorizadas
    if len(pessoas) > MAX_PESSOAS_AUTORIZADAS:
        erros.append(
            erro_regra(
                ("pessoas_autorizadas",),
                "limite_pessoas",
                f"{ROTULO_PESSOAS}: informe no máximo {MAX_PESSOAS_AUTORIZADAS} pessoas.",
            )
        )

    ids_vistos: set[int] = set()
    for indice, pessoa in enumerate(pessoas):
        posicao = indice + 1
        for campo in CAMPOS_OBRIGATORIOS_PESSOA:
            valor = pessoa.get(campo)
            caminho: Caminho = ("pessoas_autorizadas", indice, campo)
            if esta_vazio(valor):
                erros.append(erro_campo_obrigatorio(caminho, rotulo_pessoa(posicao, campo)))
            elif len(valor) > LIMITES_PESSOA[campo]:
                erros.append(erro_tamanho(caminho, rotulo_pessoa(posicao, campo), LIMITES_PESSOA[campo]))

        id_pessoa = pessoa.get("id")
        if id_pessoa is not None:
            if id_pessoa in ids_vistos:
                erros.append(
                    erro_regra(
                        ("pessoas_autorizadas", indice, "id"),
                        "pessoa_repetida",
                        f"{ROTULO_PESSOAS} – pessoa {posicao}: a mesma pessoa foi enviada mais de uma vez.",
                    )
                )
            ids_vistos.add(id_pessoa)

    if forma in FORMAS_QUE_EXIGEM_PESSOAS and not pessoas:
        erros.append(
            erro_regra(
                ("pessoas_autorizadas",),
                "pessoa_autorizada_obrigatoria",
                f"{ROTULO_PESSOAS}: informe ao menos uma pessoa para esta forma de saída.",
            )
        )

    return erros


def termo_completo(dados: Mapping[str, Any]) -> bool:
    """Indicador `completa`: obrigatórios e regras condicionais atendidos."""
    return not avaliar(dados)


# ----------------------------------------------------------------------------------------
# Entrada
# ----------------------------------------------------------------------------------------


class ResponsavelSaidaEntrada(EntradaBase):
    """Responsável legal que assina o termo. Não usa `Responsavel` nem `Pessoa`."""

    nome: str | None = None


class SaidaEscolaEntrada(EntradaBase):
    forma_saida: FormaSaida | None = None
    descricao_outros: str | None = None  # só vale quando a forma é OUTROS; senão é descartada

    @field_validator("forma_saida", mode="before")
    @classmethod
    def _forma_saida(cls, valor: Any) -> Any:
        valor = limpar_texto(valor)
        if valor is None or isinstance(valor, FormaSaida):
            return valor
        if isinstance(valor, str) and valor in FormaSaida.__members__:
            return FormaSaida[valor]
        raise PydanticCustomError(
            "forma_saida_invalida",
            "Forma de saída inválida. Valores aceitos: {validos}.",
            {"validos": ", ".join(FormaSaida.__members__)},
        )


class PessoaAutorizadaEntrada(EntradaBase):
    id: int | None = None  # com id: atualiza a pessoa do termo; sem id: cria
    nome: str | None = None
    parentesco: str | None = None  # texto livre


class TermoSaidaUpdate(EntradaBase):
    """Corpo do PUT. Dados do aluno e o local não são aceitos: o primeiro é somente leitura e
    o segundo é fixo (qualquer `local` enviado é ignorado)."""

    model_config = ConfigDict(
        json_schema_extra={
            "campos_obrigatorios": [".".join(map(str, c)) for c in CAMPOS_OBRIGATORIOS],
            "max_pessoas_autorizadas": MAX_PESSOAS_AUTORIZADAS,
        },
    )

    responsavel: ResponsavelSaidaEntrada = Field(default_factory=ResponsavelSaidaEntrada)
    periodo: str | None = None  # texto livre, até 50 caracteres
    saida: SaidaEscolaEntrada = Field(default_factory=SaidaEscolaEntrada)
    pessoas_autorizadas: list[PessoaAutorizadaEntrada] = Field(default_factory=list)
    data: date | None = None  # ISO (AAAA-MM-DD); não pode ser futura

    @field_validator("pessoas_autorizadas", mode="before")
    @classmethod
    def _lista_nula_vira_vazia(cls, valor: Any) -> Any:
        return [] if valor is None else valor

    @field_validator("data", mode="before")
    @classmethod
    def _data_iso(cls, valor: Any) -> Any:
        return data_iso(valor)

    @model_validator(mode="after")
    def _recusar_pendencias(self) -> Self:
        # Campo condicional: a descrição só existe quando a forma de saída é OUTROS.
        if self.saida.forma_saida != FormaSaida.OUTROS:
            self.saida.descricao_outros = None

        erros = avaliar(self.model_dump())
        if erros:
            levantar_erros(type(self).__name__, erros)
        return self


# ----------------------------------------------------------------------------------------
# Resposta
# ----------------------------------------------------------------------------------------


class ResponsavelSaidaResponse(BaseModel):
    nome: str | None = None


class SaidaEscolaResponse(BaseModel):
    forma_saida: FormaSaida | None = None
    descricao_outros: str | None = None


class PessoaAutorizadaResponse(BaseModel):
    id: int
    nome: str
    parentesco: str


class TermoSaidaResponse(BaseModel):
    aluno: AlunoTermoResponse
    responsavel: ResponsavelSaidaResponse
    periodo: str | None = None
    saida: SaidaEscolaResponse
    pessoas_autorizadas: list[PessoaAutorizadaResponse]  # na ordem de cadastro (por id)
    local: str  # fixo: vem da configuração da aplicação e não é editável
    data: date | None = None
    completa: bool
    created_at: datetime | None = None  # nulos enquanto o termo não foi salvo
    updated_at: datetime | None = None

    @field_serializer("created_at", "updated_at")
    def serializa_datas_sao_paulo(self, valor: datetime | None):
        return para_sao_paulo(valor)
