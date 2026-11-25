"""Schemas do card do aluno e visão geral (UC04 / issue #108).

Entrada (POST /alunos): `AlunoCardCreate`.
Respostas: `AlunoCardCreateResponse` (201) e `AlunoVisaoGeralResponse` (200).
"""
from collections.abc import Mapping
from datetime import date, datetime
from enum import Enum
from typing import Any, Self

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    ModelWrapValidatorHandler,
    field_serializer,
    field_validator,
    model_validator,
)
from pydantic_core import InitErrorDetails, PydanticCustomError, ValidationError

from app.core.tempo import hoje_sao_paulo, para_sao_paulo
from app.core.validadores import nis_valido, telefone_valido, uf_valida
from app.models.aluno import Raca, Sexo
from app.schemas.etapa import EtapaResumo
from app.schemas.requerimento import ANO_LETIVO_MINIMO, ROTULOS_RACA, ROTULOS_SEXO, enum_por_nome
from app.schemas.termo_comum import (
    Caminho,
    EntradaBase,
    avaliar_campos,
    data_iso,
    erro_regra,
    juntar_com_faltantes,
    levantar_erros,
    valor_em,
)

ROTULOS: dict[Caminho, str] = {
    ("aluno", "nome"): "Nome do aluno",
    ("aluno", "data_nasc"): "Data de nascimento",
    ("aluno", "sexo"): "Sexo",
    ("aluno", "cpf"): "CPF do aluno",
    ("aluno", "nis"): "Nº do NIS",
    ("aluno", "naturalidade"): "Naturalidade",
    ("aluno", "uf"): "UF de naturalidade",
    ("aluno", "nacionalidade"): "Nacionalidade",
    ("aluno", "raca"): "Cor/raça",
    ("responsavel", "nome"): "Nome do responsável",
    ("responsavel", "parentesco"): "Parentesco",
    ("responsavel", "cpf"): "CPF do responsável",
    ("responsavel", "telefone"): "Telefone do responsável",
    ("matricula", "id_etapa"): "Etapa",
    ("matricula", "ano"): "Ano letivo",
    ("matricula", "data_matricula"): "Data da matrícula",
}

CAMPOS_OBRIGATORIOS: tuple[Caminho, ...] = (
    ("aluno", "nome"),
    ("aluno", "data_nasc"),
    ("aluno", "sexo"),
    ("aluno", "cpf"),
    ("aluno", "uf"),
    ("aluno", "nacionalidade"),
    ("responsavel", "nome"),
    ("responsavel", "parentesco"),
    ("matricula", "id_etapa"),
    ("matricula", "ano"),
    ("matricula", "data_matricula"),
)

LIMITES: dict[Caminho, int] = {
    ("aluno", "nome"): 100,
    ("aluno", "naturalidade"): 100,
    ("aluno", "nacionalidade"): 50,
    ("responsavel", "nome"): 150,
    ("responsavel", "parentesco"): 50,
}

CAMPOS_CPF: tuple[Caminho, ...] = (
    ("aluno", "cpf"),
    ("responsavel", "cpf"),
)

DATAS_NAO_FUTURAS: tuple[Caminho, ...] = (("aluno", "data_nasc"),)


def _avaliar_cadastro(dados: Mapping[str, Any]) -> list[InitErrorDetails]:
    """Valida todos os campos obrigatórios e formatos de uma vez (FE01 / RN06)."""
    erros = avaliar_campos(
        dados,
        rotulos=ROTULOS,
        obrigatorios=CAMPOS_OBRIGATORIOS,
        limites=LIMITES,
        cpfs=CAMPOS_CPF,
        datas_nao_futuras=DATAS_NAO_FUTURAS,
    )

    def preenchido(caminho: Caminho) -> Any:
        valor = valor_em(dados, caminho)
        return None if valor in (None, "") else valor

    if (nis := preenchido(("aluno", "nis"))) is not None and not nis_valido(nis):
        erros.append(
            erro_regra(
                ("aluno", "nis"),
                "formato_invalido",
                "Nº do NIS: valor inválido. Informe os 11 dígitos, sem pontuação.",
            )
        )

    if (uf := preenchido(("aluno", "uf"))) is not None and not uf_valida(uf):
        erros.append(
            erro_regra(
                ("aluno", "uf"),
                "formato_invalido",
                "UF de naturalidade: valor inválido. Use a sigla do estado em maiúsculas (ex.: GO).",
            )
        )

    if (tel := preenchido(("responsavel", "telefone"))) is not None and not telefone_valido(tel):
        erros.append(
            erro_regra(
                ("responsavel", "telefone"),
                "formato_invalido",
                "Telefone do responsável: valor inválido. Informe DDD e número (10 ou 11 dígitos), sem pontuação.",
            )
        )

    if (id_etapa := preenchido(("matricula", "id_etapa"))) is not None and id_etapa < 1:
        erros.append(
            erro_regra(
                ("matricula", "id_etapa"),
                "etapa_invalida",
                "Etapa inválida.",
            )
        )

    ano = preenchido(("matricula", "ano"))
    ano_maximo = hoje_sao_paulo().year + 1
    if ano is not None and not (ANO_LETIVO_MINIMO <= ano <= ano_maximo):
        erros.append(
            erro_regra(
                ("matricula", "ano"),
                "ano_invalido",
                f"Ano letivo deve estar entre {ANO_LETIVO_MINIMO} e {ano_maximo}.",
            )
        )

    return erros


# ---------------------------------------------------------------------------
# Entrada (POST /alunos)
# ---------------------------------------------------------------------------


class AlunoCardDadosCreate(EntradaBase):
    model_config = ConfigDict(extra="forbid")

    nome: str | None = None
    data_nasc: date | None = None
    sexo: Sexo | None = None
    cpf: str | None = None
    nis: str | None = None
    naturalidade: str | None = None
    uf: str | None = None
    nacionalidade: str | None = None
    raca: Raca | None = None

    @field_validator("data_nasc", mode="before")
    @classmethod
    def _validar_data_nasc(cls, valor: Any) -> Any:
        return data_iso(valor)

    @field_validator("sexo", mode="before")
    @classmethod
    def _validar_sexo(cls, valor: Any) -> Any:
        return enum_por_nome(valor, Sexo)

    @field_validator("raca", mode="before")
    @classmethod
    def _validar_raca(cls, valor: Any) -> Any:
        return enum_por_nome(valor, Raca)


class ResponsavelCardCreate(EntradaBase):
    nome: str | None = None
    parentesco: str | None = None
    cpf: str | None = None
    telefone: str | None = None


class MatriculaCardCreate(EntradaBase):
    id_etapa: int | None = None
    ano: int | None = None
    data_matricula: date | None = None

    @field_validator("data_matricula", mode="before")
    @classmethod
    def _validar_data_matricula(cls, valor: Any) -> Any:
        return data_iso(valor)


class AlunoCardCreate(BaseModel):
    aluno: AlunoCardDadosCreate = Field(default_factory=AlunoCardDadosCreate)
    responsavel: ResponsavelCardCreate = Field(default_factory=ResponsavelCardCreate)
    matricula: MatriculaCardCreate = Field(default_factory=MatriculaCardCreate)

    @model_validator(mode="wrap")
    @classmethod
    def _listar_tudo(cls, dados: Any, handler: ModelWrapValidatorHandler[Self]) -> Self:
        try:
            return handler(dados)
        except ValidationError as exc:
            juntar_com_faltantes(
                cls.__name__, exc, dados, rotulos=ROTULOS, obrigatorios=CAMPOS_OBRIGATORIOS
            )

    @model_validator(mode="after")
    def _recusar_pendencias(self) -> Self:
        erros = _avaliar_cadastro(self.model_dump())
        if erros:
            levantar_erros(type(self).__name__, erros)
        return self


# ---------------------------------------------------------------------------
# Respostas
# ---------------------------------------------------------------------------


class TurmaResumoCard(BaseModel):
    id: int
    nome: str
    turno: str | None = None
    status: str


class FichaStatusItem(BaseModel):
    completa: bool


class FichasStatusResponse(BaseModel):
    requerimento: FichaStatusItem
    socioeconomica: FichaStatusItem
    termo_imagem: FichaStatusItem
    termo_saida: FichaStatusItem
    termo_compromisso: FichaStatusItem


class ResponsavelResumoResponse(BaseModel):
    nome: str
    parentesco: str
    telefone: str | None = None
    cpf: str | None = None


class TurmaEtapaResumoResponse(BaseModel):
    etapa: str | None = None
    turma: str | None = None


class ResumoCardResponse(BaseModel):
    responsavel: ResponsavelResumoResponse
    telefone: str | None = None
    endereco: str | None = None
    turma_etapa: TurmaEtapaResumoResponse


class DocumentoChecklistItem(BaseModel):
    tipo: str
    nome: str
    entregue: bool


class DocumentosChecklistResponse(BaseModel):
    itens: list[DocumentoChecklistItem]
    entregues: int
    total: int


class UltimaEdicaoResponse(BaseModel):
    data: datetime
    autor: str

    @field_serializer("data")
    def serializar_data(self, valor: datetime):
        return para_sao_paulo(valor)


class AlunoVisaoGeralResponse(BaseModel):
    id_aluno: int
    id_matricula: int
    nome: str
    data_nasc: date
    status: str
    etapa: EtapaResumo | None = None
    turma: TurmaResumoCard | None = None
    ano_letivo: int
    data_matricula: date
    fichas: FichasStatusResponse
    resumo: ResumoCardResponse
    documentos: DocumentosChecklistResponse
    ultima_edicao: UltimaEdicaoResponse | None = None
