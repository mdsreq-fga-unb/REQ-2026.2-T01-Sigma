"""Schemas do Requerimento de matrícula (UC04).

Entrada (PUT): `RequerimentoUpdate`. Resposta (GET e PUT): `RequerimentoResponse`.
Uma classe por seção da tela, e a ficha completa composta por elas.

Regras (issue #90):
- Os obrigatórios ficam em uma lista única (`CAMPOS_OBRIGATORIOS`), provisória até o PO confirmar.
  Faltando algum, o 422 lista **todos** de uma vez (FE01).
- CPF, NIS, telefones e CEP chegam só com dígitos. Datas em ISO (AAAA-MM-DD).
- CPF com dígito verificador válido; NIS com 11 dígitos; telefone com 10 ou 11; CEP com 8; UF em `UFS`.
- Data de nascimento não pode ser futura. A emissão da certidão não pode ser anterior ao nascimento.
- Transferência: a data de entrega exige a do pedido e não pode ser anterior a ela.
- Saúde: "OUTROS" exige a observação. Listas de saúde e de documentos só aceitam os valores do enum,
  sem repetição.
- Ano de escolaridade (etapa) e turma são somente leitura: a troca de turma é do UC07.
- Sexo, raça, tipo de certidão e as listas usam o NOME do enum (ex.: "FEMININO", "FOTO_3X4").
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
from app.core.validadores import cep_valido, nis_valido, telefone_valido, uf_valida
from app.models.aluno import Raca, Sexo
from app.models.documentacao_civil import TipoCertidao
from app.models.documento import TipoDocumento
from app.models.saude import AcompanhamentoMedico, ProblemaSaude
from app.schemas.termo_comum import (
    Caminho,
    EntradaBase,
    avaliar_campos,
    data_iso,
    erro_regra,
    juntar_com_faltantes,
    levantar_erros,
    limpar_texto,
    valor_em,
)

# Configuração da ficha. É o ÚNICO lugar para ajustar campos, nomes e limites

# Nomes legíveis, na ordem da tela. Usados nas mensagens de erro e no histórico de edições.
ROTULOS: dict[Caminho, str] = {
    ("dados_pessoais", "nome"): "Nome do aluno",
    ("dados_pessoais", "data_nascimento"): "Data de nascimento",
    ("dados_pessoais", "sexo"): "Sexo",
    ("dados_pessoais", "nis"): "Nº do NIS",
    ("dados_pessoais", "cpf"): "CPF",
    ("dados_pessoais", "naturalidade"): "Naturalidade",
    ("dados_pessoais", "uf"): "UF de naturalidade",
    ("dados_pessoais", "nacionalidade"): "Nacionalidade",
    ("dados_pessoais", "raca"): "Cor/raça",
    ("matricula", "ano_letivo"): "Ano letivo",
    ("matricula", "data_matricula"): "Data da matrícula",
    ("documentacao_civil", "rg"): "Documentação civil – nº do RG",
    ("documentacao_civil", "orgao_emissor"): "Documentação civil – órgão emissor",
    ("documentacao_civil", "uf_rg"): "Documentação civil – UF do RG",
    ("documentacao_civil", "data_expedicao"): "Documentação civil – data de expedição",
    ("documentacao_civil", "tipo_certidao"): "Documentação civil – certidão civil",
    ("documentacao_civil", "num_termo"): "Documentação civil – nº do termo",
    ("documentacao_civil", "folha"): "Documentação civil – folha",
    ("documentacao_civil", "livro"): "Documentação civil – livro",
    ("documentacao_civil", "data_emissao_certidao"): "Documentação civil – data de emissão da certidão",
    ("documentacao_civil", "nome_cartorio"): "Documentação civil – nome do cartório",
    ("documentacao_civil", "uf_cartorio"): "Documentação civil – UF do cartório",
    ("documentacao_civil", "documento_estrangeiro"): "Documentação civil – nº do documento estrangeiro",
    ("filiacao", "pai", "nome"): "Filiação – nome do pai",
    ("filiacao", "pai", "escolaridade"): "Filiação – escolaridade do pai",
    ("filiacao", "pai", "local_trabalho"): "Filiação – local de trabalho do pai",
    ("filiacao", "pai", "telefone_trabalho"): "Filiação – telefone do trabalho do pai",
    ("filiacao", "mae", "nome"): "Filiação – nome da mãe",
    ("filiacao", "mae", "escolaridade"): "Filiação – escolaridade da mãe",
    ("filiacao", "mae", "local_trabalho"): "Filiação – local de trabalho da mãe",
    ("filiacao", "mae", "telefone_trabalho"): "Filiação – telefone do trabalho da mãe",
    ("endereco_contato", "logradouro"): "Endereço – logradouro",
    ("endereco_contato", "numero"): "Endereço – número",
    ("endereco_contato", "bairro"): "Endereço – bairro",
    ("endereco_contato", "cidade"): "Endereço – cidade",
    ("endereco_contato", "uf"): "Endereço – UF",
    ("endereco_contato", "cep"): "Endereço – CEP",
    ("endereco_contato", "telefone"): "Telefone",
    ("saude", "problemas"): "Saúde – problemas de saúde",
    ("saude", "observacao_problemas"): "Saúde – observação dos problemas de saúde",
    ("saude", "acompanhamentos"): "Saúde – acompanhamentos",
    ("saude", "observacao_acompanhamentos"): "Saúde – observação dos acompanhamentos",
    ("termo_compromisso", "nome_responsavel"): "Termo de compromisso – nome de quem assina",
    ("termo_compromisso", "documentos_entregues"): "Termo de compromisso – documentos entregues",
    ("transferencia", "data_pedido"): "Transferência – data do pedido",
    ("transferencia", "data_entrega"): "Transferência – data de entrega",
    ("transferencia", "nome_responsavel"): "Transferência – nome do responsável",
}

# FE01: lista inicial da issue #90, a confirmar com o PO. "Endereço" = as colunas obrigatórias do Aluno.
CAMPOS_OBRIGATORIOS: tuple[Caminho, ...] = (
    ("dados_pessoais", "nome"),
    ("dados_pessoais", "data_nascimento"),
    ("dados_pessoais", "sexo"),
    ("dados_pessoais", "cpf"),
    ("dados_pessoais", "naturalidade"),
    ("dados_pessoais", "uf"),
    ("dados_pessoais", "nacionalidade"),
    ("dados_pessoais", "raca"),
    ("matricula", "ano_letivo"),
    ("matricula", "data_matricula"),
    ("endereco_contato", "logradouro"),
    ("endereco_contato", "cidade"),
    ("endereco_contato", "cep"),
)

# Tamanhos das colunas (Aluno, DocumentacaoCivil, RequerimentoMatricula e Saude).
LIMITES: dict[Caminho, int] = {
    ("dados_pessoais", "nome"): 100,
    ("dados_pessoais", "naturalidade"): 100,
    ("dados_pessoais", "nacionalidade"): 50,
    ("documentacao_civil", "rg"): 20,
    ("documentacao_civil", "orgao_emissor"): 100,
    ("documentacao_civil", "num_termo"): 20,
    ("documentacao_civil", "folha"): 10,
    ("documentacao_civil", "livro"): 20,
    ("documentacao_civil", "nome_cartorio"): 200,
    ("documentacao_civil", "documento_estrangeiro"): 50,
    ("filiacao", "pai", "nome"): 100,
    ("filiacao", "pai", "escolaridade"): 100,
    ("filiacao", "pai", "local_trabalho"): 200,
    ("filiacao", "mae", "nome"): 100,
    ("filiacao", "mae", "escolaridade"): 100,
    ("filiacao", "mae", "local_trabalho"): 200,
    ("endereco_contato", "logradouro"): 200,
    ("endereco_contato", "numero"): 10,
    ("endereco_contato", "bairro"): 100,
    ("endereco_contato", "cidade"): 100,
    ("saude", "observacao_problemas"): 1000,
    ("saude", "observacao_acompanhamentos"): 1000,
    ("termo_compromisso", "nome_responsavel"): 150,
    ("transferencia", "nome_responsavel"): 150,
}

CAMPOS_CPF: tuple[Caminho, ...] = (("dados_pessoais", "cpf"),)
CAMPOS_NIS: tuple[Caminho, ...] = (("dados_pessoais", "nis"),)
CAMPOS_TELEFONE: tuple[Caminho, ...] = (
    ("filiacao", "pai", "telefone_trabalho"),
    ("filiacao", "mae", "telefone_trabalho"),
    ("endereco_contato", "telefone"),
)
CAMPOS_CEP: tuple[Caminho, ...] = (("endereco_contato", "cep"),)
CAMPOS_UF: tuple[Caminho, ...] = (
    ("dados_pessoais", "uf"),
    ("documentacao_civil", "uf_rg"),
    ("documentacao_civil", "uf_cartorio"),
    ("endereco_contato", "uf"),
)
# Só estas datas não podem ser futuras (a data da matrícula e a da transferência podem).
DATAS_NAO_FUTURAS: tuple[Caminho, ...] = (
    ("dados_pessoais", "data_nascimento"),
    ("documentacao_civil", "data_expedicao"),
    ("documentacao_civil", "data_emissao_certidao"),
)
ANO_LETIVO_MINIMO = 2000

# Listas de múltipla escolha: campo -> enum dos valores aceitos.
LISTAS: dict[Caminho, type[Enum]] = {
    ("saude", "problemas"): ProblemaSaude,
    ("saude", "acompanhamentos"): AcompanhamentoMedico,
    ("termo_compromisso", "documentos_entregues"): TipoDocumento,
}
# "OUTROS" marcado exige a observação correspondente.
OBSERVACAO_DE_OUTROS: dict[Caminho, Caminho] = {
    ("saude", "problemas"): ("saude", "observacao_problemas"),
    ("saude", "acompanhamentos"): ("saude", "observacao_acompanhamentos"),
}

# Textos das opções (tela e PDF), na ordem em que aparecem.
ROTULOS_SEXO = {Sexo.FEMININO: "Feminino", Sexo.MASCULINO: "Masculino", Sexo.NAO_DECLARADO: "Não declarado"}
ROTULOS_RACA = {
    Raca.BRANCO: "Branca",
    Raca.PRETO: "Preta",
    Raca.PARDO: "Parda",
    Raca.AMARELO: "Amarela",
    Raca.INDIGENA: "Indígena",
    Raca.NAO_DECLARADO: "Não declarada",
}
ROTULOS_CERTIDAO = {TipoCertidao.NASCIMENTO: "Certidão de nascimento", TipoCertidao.CASAMENTO: "Certidão de casamento"}
ROTULOS_PROBLEMA_SAUDE = {
    ProblemaSaude.AUDICAO: "Audição",
    ProblemaSaude.GARGANTA: "Garganta",
    ProblemaSaude.FALA: "Fala",
    ProblemaSaude.VISAO: "Visão",
    ProblemaSaude.DESMAIOS: "Desmaios",
    ProblemaSaude.RINS: "Rins",
    ProblemaSaude.ALERGIA: "Alergia",
    ProblemaSaude.OUTROS: "Outros",
}
ROTULOS_ACOMPANHAMENTO = {
    AcompanhamentoMedico.PSICOLOGICO: "Psicológico",
    AcompanhamentoMedico.ALERGISTA: "Alergista",
    AcompanhamentoMedico.UROLOGICO: "Urológico",
    AcompanhamentoMedico.FONOAUDIOLOGICO: "Fonoaudiológico",
    AcompanhamentoMedico.CARDIOLOGICO: "Cardiológico",
    AcompanhamentoMedico.RINS: "Rins",
    AcompanhamentoMedico.OUTROS: "Outros",
}
ROTULOS_DOCUMENTO = {  # ordem do modelo em papel e do protótipo
    TipoDocumento.FOTO_3X4: "2 fotos 3x4",
    TipoDocumento.CERTIDAO_NASCIMENTO: "Certidão de nascimento",
    TipoDocumento.HISTORICO_ESCOLAR: "Histórico escolar",
    TipoDocumento.CARTAO_VACINA: "Cartão de vacina",
    TipoDocumento.COMPROVANTE_RESIDENCIA: "Comprovante de residência",
}


def _erro_formato(caminho: Caminho, rotulo: str, regra: str) -> InitErrorDetails:
    return erro_regra(caminho, "formato_invalido", f"{rotulo}: valor inválido. {regra}")


def avaliar(dados: Mapping[str, Any]) -> list[InitErrorDetails]:
    """Todas as pendências da ficha, de uma vez (FE01). Lista vazia = sem pendências."""
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
        return None if valor in (None, "", []) else valor

    for caminho in CAMPOS_NIS:
        if (valor := preenchido(caminho)) is not None and not nis_valido(valor):
            erros.append(_erro_formato(caminho, ROTULOS[caminho], "Informe os 11 dígitos, sem pontuação."))
    for caminho in CAMPOS_TELEFONE:
        if (valor := preenchido(caminho)) is not None and not telefone_valido(valor):
            erros.append(_erro_formato(caminho, ROTULOS[caminho], "Informe DDD e número (10 ou 11 dígitos), sem pontuação."))
    for caminho in CAMPOS_CEP:
        if (valor := preenchido(caminho)) is not None and not cep_valido(valor):
            erros.append(_erro_formato(caminho, ROTULOS[caminho], "Informe os 8 dígitos, sem pontuação."))
    for caminho in CAMPOS_UF:
        if (valor := preenchido(caminho)) is not None and not uf_valida(valor):
            erros.append(_erro_formato(caminho, ROTULOS[caminho], "Use a sigla do estado em maiúsculas (ex.: GO)."))

    # Ano letivo
    caminho_ano = ("matricula", "ano_letivo")
    ano = preenchido(caminho_ano)
    ano_maximo = hoje_sao_paulo().year + 1
    if ano is not None and not ANO_LETIVO_MINIMO <= ano <= ano_maximo:
        erros.append(
            erro_regra(caminho_ano, "ano_invalido", f"Ano letivo deve estar entre {ANO_LETIVO_MINIMO} e {ano_maximo}.")
        )

    # Datas que dependem de outras
    nascimento = preenchido(("dados_pessoais", "data_nascimento"))
    caminho_certidao = ("documentacao_civil", "data_emissao_certidao")
    certidao = preenchido(caminho_certidao)
    if nascimento and certidao and certidao < nascimento:
        erros.append(
            erro_regra(
                caminho_certidao,
                "data_incoerente",
                f"{ROTULOS[caminho_certidao]}: não pode ser anterior à data de nascimento.",
            )
        )

    caminho_pedido, caminho_entrega = ("transferencia", "data_pedido"), ("transferencia", "data_entrega")
    pedido, entrega = preenchido(caminho_pedido), preenchido(caminho_entrega)
    if entrega and not pedido:
        erros.append(
            erro_regra(
                caminho_pedido,
                "data_incoerente",
                f"{ROTULOS[caminho_pedido]}: informe a data do pedido para registrar a data de entrega.",
            )
        )
    elif entrega and pedido and entrega < pedido:
        erros.append(
            erro_regra(
                caminho_entrega,
                "data_incoerente",
                f"{ROTULOS[caminho_entrega]}: não pode ser anterior à data do pedido.",
            )
        )

    # Listas de múltipla escolha
    for caminho, enum_cls in LISTAS.items():
        valores = valor_em(dados, caminho) or []
        aceitos = list(enum_cls.__members__)
        for indice, valor in enumerate(valores):
            if valor not in enum_cls.__members__:
                erros.append(
                    erro_regra(
                        (*caminho, indice),
                        "opcao_invalida",
                        f"{ROTULOS[caminho]}: opção inválida. Valores aceitos: {', '.join(aceitos)}.",
                    )
                )
            elif valor in valores[:indice]:
                erros.append(
                    erro_regra((*caminho, indice), "opcao_repetida", f"{ROTULOS[caminho]}: a opção {valor} foi repetida.")
                )

    for caminho_lista, caminho_obs in OBSERVACAO_DE_OUTROS.items():
        if "OUTROS" in (valor_em(dados, caminho_lista) or []) and preenchido(caminho_obs) is None:
            erros.append(
                erro_regra(
                    caminho_obs,
                    "campo_obrigatorio",
                    f"Campo obrigatório não preenchido: {ROTULOS[caminho_obs]} (“Outros” foi marcado).",
                )
            )

    return erros


def ficha_completa(dados: Mapping[str, Any]) -> bool:
    """Indicador `completa`: todos os obrigatórios preenchidos e sem pendências."""
    return not avaliar(dados)


def enum_por_nome(valor: Any, enum_cls: type[Enum]) -> Any:
    """Converte o nome do enum (ex.: "FEMININO") no membro. Outro valor vira erro em português."""
    valor = limpar_texto(valor)
    if valor is None or isinstance(valor, enum_cls):
        return valor
    if isinstance(valor, str) and valor in enum_cls.__members__:
        return enum_cls[valor]
    raise PydanticCustomError(
        "opcao_invalida",
        "Opção inválida. Valores aceitos: {validos}.",
        {"validos": ", ".join(enum_cls.__members__)},
    )


# Entrada


class DadosPessoaisEntrada(EntradaBase):
    nome: str | None = None
    data_nascimento: date | None = None
    sexo: Sexo | None = None
    nis: str | None = None  # só dígitos
    cpf: str | None = None  # só dígitos
    naturalidade: str | None = None  # cidade de nascimento
    uf: str | None = None  # UF de naturalidade
    nacionalidade: str | None = None
    raca: Raca | None = None

    @field_validator("data_nascimento", mode="before")
    @classmethod
    def _data_iso(cls, valor: Any) -> Any:
        return data_iso(valor)

    @field_validator("sexo", mode="before")
    @classmethod
    def _sexo(cls, valor: Any) -> Any:
        return enum_por_nome(valor, Sexo)

    @field_validator("raca", mode="before")
    @classmethod
    def _raca(cls, valor: Any) -> Any:
        return enum_por_nome(valor, Raca)


class MatriculaEntrada(EntradaBase):
    """Ano letivo e data da matrícula. Ano de escolaridade e turma não são aceitos (UC07)."""

    ano_letivo: int | None = None
    data_matricula: date | None = None

    @field_validator("ano_letivo", mode="before")
    @classmethod
    def _ano_inteiro(cls, valor: Any) -> Any:
        valor = limpar_texto(valor)
        if valor is None or (isinstance(valor, int) and not isinstance(valor, bool)):
            return valor
        if isinstance(valor, str) and valor.isascii() and valor.isdigit():
            return int(valor)
        raise PydanticCustomError("ano_invalido", "Ano letivo deve ser um número inteiro (ex.: 2026).")

    @field_validator("data_matricula", mode="before")
    @classmethod
    def _data_iso(cls, valor: Any) -> Any:
        return data_iso(valor)


class DocumentacaoCivilEntrada(EntradaBase):
    rg: str | None = None
    orgao_emissor: str | None = None
    uf_rg: str | None = None
    data_expedicao: date | None = None
    tipo_certidao: TipoCertidao | None = None
    num_termo: str | None = None  # texto: mantém zeros à esquerda
    folha: str | None = None
    livro: str | None = None
    data_emissao_certidao: date | None = None
    nome_cartorio: str | None = None
    uf_cartorio: str | None = None
    documento_estrangeiro: str | None = None

    @field_validator("data_expedicao", "data_emissao_certidao", mode="before")
    @classmethod
    def _data_iso(cls, valor: Any) -> Any:
        return data_iso(valor)

    @field_validator("tipo_certidao", mode="before")
    @classmethod
    def _certidao(cls, valor: Any) -> Any:
        return enum_por_nome(valor, TipoCertidao)


class ResponsavelFiliacaoEntrada(EntradaBase):
    nome: str | None = None
    escolaridade: str | None = None  # texto livre até a lista oficial ser definida
    local_trabalho: str | None = None
    telefone_trabalho: str | None = None  # só dígitos


class FiliacaoEntrada(BaseModel):
    pai: ResponsavelFiliacaoEntrada = Field(default_factory=ResponsavelFiliacaoEntrada)
    mae: ResponsavelFiliacaoEntrada = Field(default_factory=ResponsavelFiliacaoEntrada)


class EnderecoContatoEntrada(EntradaBase):
    logradouro: str | None = None
    numero: str | None = None
    bairro: str | None = None
    cidade: str | None = None
    uf: str | None = None  # UF de residência
    cep: str | None = None  # só dígitos
    telefone: str | None = None  # só dígitos


def _lista(valor: Any) -> Any:
    return [] if valor is None else valor


class SaudeEntrada(EntradaBase):
    problemas: list[str] = Field(default_factory=list)  # nomes de ProblemaSaude
    observacao_problemas: str | None = None
    acompanhamentos: list[str] = Field(default_factory=list)  # nomes de AcompanhamentoMedico
    observacao_acompanhamentos: str | None = None

    @field_validator("problemas", "acompanhamentos", mode="before")
    @classmethod
    def _lista_nula_vira_vazia(cls, valor: Any) -> Any:
        return _lista(valor)


class TermoCompromissoEntrada(EntradaBase):
    nome_responsavel: str | None = None  # quem assina
    documentos_entregues: list[str] = Field(default_factory=list)  # nomes de TipoDocumento

    @field_validator("documentos_entregues", mode="before")
    @classmethod
    def _lista_nula_vira_vazia(cls, valor: Any) -> Any:
        return _lista(valor)


class TransferenciaEntrada(EntradaBase):
    data_pedido: date | None = None
    data_entrega: date | None = None
    nome_responsavel: str | None = None

    @field_validator("data_pedido", "data_entrega", mode="before")
    @classmethod
    def _data_iso(cls, valor: Any) -> Any:
        return data_iso(valor)


class RequerimentoUpdate(BaseModel):
    """Corpo do PUT: a ficha inteira, todas as seções."""

    model_config = ConfigDict(
        json_schema_extra={"campos_obrigatorios": [".".join(c) for c in CAMPOS_OBRIGATORIOS]},
    )

    dados_pessoais: DadosPessoaisEntrada = Field(default_factory=DadosPessoaisEntrada)
    matricula: MatriculaEntrada = Field(default_factory=MatriculaEntrada)
    documentacao_civil: DocumentacaoCivilEntrada = Field(default_factory=DocumentacaoCivilEntrada)
    filiacao: FiliacaoEntrada = Field(default_factory=FiliacaoEntrada)
    endereco_contato: EnderecoContatoEntrada = Field(default_factory=EnderecoContatoEntrada)
    saude: SaudeEntrada = Field(default_factory=SaudeEntrada)
    termo_compromisso: TermoCompromissoEntrada = Field(default_factory=TermoCompromissoEntrada)
    transferencia: TransferenciaEntrada = Field(default_factory=TransferenciaEntrada)

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
        erros = avaliar(self.model_dump())
        if erros:
            levantar_erros(type(self).__name__, erros)
        return self


# Resposta


class DadosPessoaisResponse(BaseModel):
    nome: str | None = None
    data_nascimento: date | None = None
    sexo: str | None = None  # nome do enum
    nis: str | None = None
    cpf: str | None = None
    naturalidade: str | None = None
    uf: str | None = None
    nacionalidade: str | None = None
    raca: str | None = None


class MatriculaResponse(BaseModel):
    ano_letivo: int
    data_matricula: date | None = None
    ano_escolaridade: str | None = None  # somente leitura: nome da etapa da turma
    turma: str | None = None  # somente leitura


class DocumentacaoCivilResponse(BaseModel):
    rg: str | None = None
    orgao_emissor: str | None = None
    uf_rg: str | None = None
    data_expedicao: date | None = None
    tipo_certidao: str | None = None
    num_termo: str | None = None
    folha: str | None = None
    livro: str | None = None
    data_emissao_certidao: date | None = None
    nome_cartorio: str | None = None
    uf_cartorio: str | None = None
    documento_estrangeiro: str | None = None


class ResponsavelFiliacaoResponse(BaseModel):
    nome: str | None = None
    escolaridade: str | None = None
    local_trabalho: str | None = None
    telefone_trabalho: str | None = None


class FiliacaoResponse(BaseModel):
    pai: ResponsavelFiliacaoResponse
    mae: ResponsavelFiliacaoResponse


class EnderecoContatoResponse(BaseModel):
    logradouro: str | None = None
    numero: str | None = None
    bairro: str | None = None
    cidade: str | None = None
    uf: str | None = None
    cep: str | None = None
    telefone: str | None = None


class SaudeResponse(BaseModel):
    problemas: list[str]
    observacao_problemas: str | None = None
    acompanhamentos: list[str]
    observacao_acompanhamentos: str | None = None


class TermoCompromissoResponse(BaseModel):
    nome_responsavel: str | None = None
    documentos_entregues: list[str]


class TransferenciaResponse(BaseModel):
    data_pedido: date | None = None
    data_entrega: date | None = None
    nome_responsavel: str | None = None


class RequerimentoResponse(BaseModel):
    dados_pessoais: DadosPessoaisResponse
    matricula: MatriculaResponse
    documentacao_civil: DocumentacaoCivilResponse
    filiacao: FiliacaoResponse
    endereco_contato: EnderecoContatoResponse
    saude: SaudeResponse
    termo_compromisso: TermoCompromissoResponse
    transferencia: TransferenciaResponse
    completa: bool
    created_at: datetime | None = None  # nulos enquanto o requerimento não foi salvo
    updated_at: datetime | None = None

    @field_serializer("created_at", "updated_at")
    def serializa_datas_sao_paulo(self, valor: datetime | None):
        return para_sao_paulo(valor)
