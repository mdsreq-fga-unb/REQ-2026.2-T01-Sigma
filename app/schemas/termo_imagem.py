"""Schemas do Termo de autorização de uso de imagem (UC04).

Entrada (PUT): `TermoImagemUpdate`. Resposta (GET e PUT): `TermoImagemResponse`.

Regras (issue #92):
- "Residente em" é sempre obrigatório. Os demais campos da lista abaixo também são exigidos
  para salvar (FE01), com **uma única exceção**: a autorização pode ficar vazia, o que
  significa "não respondido". "Não autoriza" é uma resposta válida.
- O termo só é considerado completo (`completa`) quando a autorização foi respondida.
- CPF com 11 dígitos, só números, com dígito verificador válido. Sem verificação de unicidade.
- A data não pode ser futura.
"""
from collections.abc import Mapping
from datetime import date, datetime
from typing import Any, Self

from pydantic import BaseModel, ConfigDict, Field, field_serializer, field_validator, model_validator
from pydantic_core import InitErrorDetails

from app.core.tempo import para_sao_paulo
from app.schemas.termo_comum import (
    AlunoTermoResponse,
    Caminho,
    EntradaBase,
    avaliar_campos,
    data_iso,
    levantar_erros,
)

# Configuração do termo. É o ÚNICO lugar para ajustar campos, nomes e limites

# Nomes legíveis, na ordem da tela. Usados nas mensagens de erro e no histórico de edições.
ROTULOS: dict[Caminho, str] = {
    ("responsavel", "nome"): "Responsável legal – nome",
    ("responsavel", "nacionalidade"): "Responsável legal – nacionalidade",
    ("responsavel", "estado_civil"): "Responsável legal – estado civil",
    ("responsavel", "rg"): "Responsável legal – RG",
    ("responsavel", "cpf"): "Responsável legal – CPF",
    ("responsavel", "residente_em"): "Responsável legal – residente em",
    ("autorizacao", "autoriza"): "Autorização de uso de imagem",
    ("autorizacao", "local"): "Local",
    ("autorizacao", "data"): "Data",
}

# FE01: sem estes campos o termo não é salvo (422 listando todos os que faltam).
CAMPOS_OBRIGATORIOS: tuple[Caminho, ...] = (
    ("responsavel", "nome"),
    ("responsavel", "cpf"),
    ("responsavel", "residente_em"),  # sempre obrigatório, inclusive no banco
    ("autorizacao", "local"),
    ("autorizacao", "data"),
)

# Para o termo ser "completo", além dos obrigatórios é preciso responder a autorização
# (sim ou não). Vazio é aceito ao salvar, mas deixa `completa` falso.
CAMPOS_PARA_COMPLETA: tuple[Caminho, ...] = CAMPOS_OBRIGATORIOS + (("autorizacao", "autoriza"),)

# Tamanhos das colunas de TermoImagem.
LIMITES: dict[Caminho, int] = {
    ("responsavel", "nome"): 150,
    ("responsavel", "nacionalidade"): 50,
    ("responsavel", "estado_civil"): 50,
    ("responsavel", "rg"): 20,
    ("responsavel", "residente_em"): 300,
    ("autorizacao", "local"): 100,
}

CAMPOS_CPF: tuple[Caminho, ...] = (("responsavel", "cpf"),)


def avaliar(dados: Mapping[str, Any], *, para_completa: bool = False) -> list[InitErrorDetails]:
    """Todas as pendências do termo, de uma vez (FE01). Lista vazia = sem pendências."""
    return avaliar_campos(
        dados,
        rotulos=ROTULOS,
        obrigatorios=CAMPOS_PARA_COMPLETA if para_completa else CAMPOS_OBRIGATORIOS,
        limites=LIMITES,
        cpfs=CAMPOS_CPF,
    )


def termo_completo(dados: Mapping[str, Any]) -> bool:
    """Indicador `completa`: obrigatórios preenchidos e autorização respondida (sim ou não)."""
    return not avaliar(dados, para_completa=True)


# Entrada


class ResponsavelImagemEntrada(EntradaBase):
    """Responsável legal que assina o termo. Não usa `Responsavel` nem `Pessoa`."""

    nome: str | None = None
    nacionalidade: str | None = None
    estado_civil: str | None = None
    rg: str | None = None
    cpf: str | None = None  # só dígitos
    residente_em: str | None = None


class AutorizacaoImagemEntrada(EntradaBase):
    autoriza: bool | None = None  # true = autoriza, false = não autoriza, null = não respondido
    local: str | None = None
    data: date | None = None  # ISO (AAAA-MM-DD); não pode ser futura

    @field_validator("data", mode="before")
    @classmethod
    def _data_iso(cls, valor: Any) -> Any:
        return data_iso(valor)


class TermoImagemUpdate(BaseModel):
    """Corpo do PUT. Dados do aluno não são aceitos: são somente leitura."""

    model_config = ConfigDict(
        json_schema_extra={"campos_obrigatorios": [".".join(c) for c in CAMPOS_OBRIGATORIOS]},
    )

    responsavel: ResponsavelImagemEntrada = Field(default_factory=ResponsavelImagemEntrada)
    autorizacao: AutorizacaoImagemEntrada = Field(default_factory=AutorizacaoImagemEntrada)

    @model_validator(mode="after")
    def _recusar_pendencias(self) -> Self:
        erros = avaliar(self.model_dump())
        if erros:
            levantar_erros(type(self).__name__, erros)
        return self


# Resposta


class ResponsavelImagemResponse(BaseModel):
    nome: str | None = None
    nacionalidade: str | None = None
    estado_civil: str | None = None
    rg: str | None = None
    cpf: str | None = None
    # Termo ainda não salvo: vem sugerido com o endereço montado do aluno.
    residente_em: str


class AutorizacaoImagemResponse(BaseModel):
    autoriza: bool | None = None
    local: str | None = None
    data: date | None = None


class TermoImagemResponse(BaseModel):
    aluno: AlunoTermoResponse
    responsavel: ResponsavelImagemResponse
    autorizacao: AutorizacaoImagemResponse
    completa: bool
    created_at: datetime | None = None  # nulos enquanto o termo não foi salvo
    updated_at: datetime | None = None

    @field_serializer("created_at", "updated_at")
    def serializa_datas_sao_paulo(self, valor: datetime | None):
        return para_sao_paulo(valor)


class TextoTermoResponse(BaseModel):
    """Texto integral do termo, o mesmo que sai no PDF (link "Ver texto completo do termo")."""

    titulo: str
    texto: str  # parágrafos separados por uma linha em branco
