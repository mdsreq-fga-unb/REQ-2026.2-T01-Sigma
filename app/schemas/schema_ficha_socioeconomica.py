import enum
from datetime import date, datetime
from decimal import Decimal

from pydantic import (
    BaseModel,
    ConfigDict,
    EmailStr,
    Field,
    field_serializer,
    field_validator,
    model_validator,
)
from pydantic_core import PydanticCustomError

from app.core.tempo import para_sao_paulo
from app.core.validadores import (
    normalizar_cep,
    normalizar_telefone,
    validar_dinheiro,
    validar_uf,
)



class MeioTransporte(str, enum.Enum):
    NENHUM_A_PE_BICICLETA = "NENHUM_A_PE_BICICLETA"
    CARONA = "CARONA"
    TRANSPORTE_COLETIVO = "TRANSPORTE_COLETIVO"
    CARRO_MOTO_PROPRIO = "CARRO_MOTO_PROPRIO"


class SituacaoMoradia(str, enum.Enum):
    PROPRIO = "PROPRIO"
    CEDIDO = "CEDIDO"
    FINANCIADO = "FINANCIADO"
    ALUGADO = "ALUGADO"
    OCUPACAO_IRREGULAR = "OCUPACAO_IRREGULAR"



class _SchemaBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    @field_validator("*", mode="before")
    @classmethod
    def vazio_para_none(cls, v):
        if isinstance(v, str):
            v = v.strip()
            return v or None
        return v

class EnderecoSchema(_SchemaBase):
    """Gravado no Aluno."""

    logradouro: str | None = Field(default=None, max_length=200)
    numero: str | None = Field(default=None, max_length=10)
    bairro: str | None = Field(default=None, max_length=100)
    cidade: str | None = Field(default=None, max_length=100)
    uf_residencia: str | None = None
    cep: str | None = None

    @field_validator("cep")
    @classmethod
    def valida_cep(cls, v: str | None) -> str | None:
        return None if v is None else normalizar_cep(v)

    @field_validator("uf_residencia")
    @classmethod
    def valida_uf(cls, v: str | None) -> str | None:
        return None if v is None else validar_uf(v)


class ContatosSchema(_SchemaBase):
    """Gravado na ficha (não altera o telefone do Aluno)."""

    telefone_contato: str | None = None
    celular: str | None = None
    email: EmailStr | None = None

    @field_validator("telefone_contato", "celular")
    @classmethod
    def valida_telefone(cls, v: str | None) -> str | None:
        return None if v is None else normalizar_telefone(v)

    @field_validator("email")
    @classmethod
    def email_ate_150(cls, v):
        if v is not None and len(str(v)) > 150:
            raise ValueError("O e-mail deve ter no máximo 150 caracteres.")
        return v


class MoradiaSchema(_SchemaBase):
    situacao: SituacaoMoradia | None = None
    cedido_por: str | None = Field(default=None, max_length=150)
    valor: Decimal | None = None

    @field_validator("valor")
    @classmethod
    def valida_valor(cls, v: Decimal | None) -> Decimal | None:
        return None if v is None else validar_dinheiro(v)

    @model_validator(mode="after")
    def descarta_condicionais(self):
        # Campo condicional sem a opção que o exige é descartado (decisão 7)
        if self.situacao != SituacaoMoradia.CEDIDO:
            self.cedido_por = None
        if self.situacao not in (SituacaoMoradia.FINANCIADO, SituacaoMoradia.ALUGADO):
            self.valor = None
        return self


class TransporteSchema(_SchemaBase):
    meio: MeioTransporte | None = None


class MembroFamiliaSchema(_SchemaBase):
    """Com id: atualiza. Sem id: cria. Ausente da lista: remove."""

    id: int | None = None
    tipo: str | None = Field(default=None, max_length=100)  # componente
    profissao: str | None = Field(default=None, max_length=100)
    idade: int | None = Field(default=None, ge=0, le=120)
    estado_civil: str | None = Field(default=None, max_length=100)
    escolaridade: str | None = Field(default=None, max_length=100)
    renda_mensal: Decimal | None = None

    @field_validator("renda_mensal")
    @classmethod
    def valida_renda(cls, v: Decimal | None) -> Decimal | None:
        return None if v is None else validar_dinheiro(v)


class NucleoFamiliarSchema(_SchemaBase):
    membros: list[MembroFamiliaSchema] = Field(default_factory=list, max_length=20)
    observacoes: str | None = None


class OutrasPropriedadesSchema(_SchemaBase):
    possui: bool | None = None
    relacao: str | None = None

    @model_validator(mode="after")
    def descarta_relacao(self):
        if self.possui is not True:
            self.relacao = None
        return self


class DeclaracaoSchema(_SchemaBase):
    nome: str | None = Field(default=None, max_length=150)
    local: str | None = Field(default=None, max_length=100)
    data: date | None = None

    @field_validator("data")
    @classmethod
    def data_nao_futura(cls, v: date | None) -> date | None:
        if v is not None and v > date.today():
            raise ValueError("A data da declaração não pode ser futura.")
        return v


class DadosPessoaisSchema(_SchemaBase):
    """Somente leitura: vem do Aluno e do requerimento."""

    nome: str | None = None
    data_nasc: date | None = None
    sexo: str | None = None
    etapa: str | None = None
    ano_letivo: int | None = None
    nome_mae: str | None = None
    nome_pai: str | None = None


ENDERECO_OBRIGATORIO = (
    ("logradouro", "logradouro"),
    ("numero", "número"),
    ("bairro", "bairro"),
    ("cidade", "cidade"),
    ("uf_residencia", "estado"),
    ("cep", "CEP"),
)
MEMBRO_OBRIGATORIO = (("tipo", "componente"), ("idade", "idade"))
DECLARACAO_OBRIGATORIA = (
    ("nome", "nome do responsável"),
    ("local", "local"),
    ("data", "data"),
)


def _vazio(v) -> bool:
    return v is None or (isinstance(v, str) and not v.strip())


def campos_faltantes(ficha) -> list[str]:

    faltam: list[str] = []

    for campo, rotulo in ENDERECO_OBRIGATORIO:
        if _vazio(getattr(ficha.endereco, campo)):
            faltam.append(f"Endereço – {rotulo}")

    if _vazio(ficha.contato.telefone_contato) and _vazio(ficha.contato.celular):
        faltam.append("Contato – telefone ou celular")

    m = ficha.moradia
    if m.situacao is None:
        faltam.append("Moradia – situação do imóvel")
    if m.situacao == SituacaoMoradia.CEDIDO and _vazio(m.cedido_por):
        faltam.append("Moradia – quem cedeu")
    if m.situacao in (SituacaoMoradia.FINANCIADO, SituacaoMoradia.ALUGADO) and (
        m.valor is None or m.valor <= 0
    ):
        faltam.append("Moradia – valor mensal")

    if ficha.transporte.meio is None:
        faltam.append("Transporte – meio de transporte")

    membros = ficha.nucleo_familiar.membros
    if not membros:
        faltam.append("Núcleo familiar – pelo menos um membro")
    for i, membro in enumerate(membros, start=1):
        for campo, rotulo in MEMBRO_OBRIGATORIO:
            if _vazio(getattr(membro, campo)):
                faltam.append(f"Núcleo familiar – membro {i} – {rotulo}")

    op = ficha.outras_propriedades
    if op.possui is None:
        faltam.append("Outras propriedades – resposta (sim ou não)")
    if op.possui is True and _vazio(op.relacao):
        faltam.append("Outras propriedades – relação das propriedades")

    for campo, rotulo in DECLARACAO_OBRIGATORIA:
        if _vazio(getattr(ficha.declaracao, campo)):
            faltam.append(f"Declaração – {rotulo}")

    return faltam



class FichaSocioeconomicaBase(_SchemaBase):
    endereco: EnderecoSchema = Field(default_factory=EnderecoSchema)
    contato: ContatosSchema = Field(default_factory=ContatosSchema)
    moradia: MoradiaSchema = Field(default_factory=MoradiaSchema)
    transporte: TransporteSchema = Field(default_factory=TransporteSchema)
    nucleo_familiar: NucleoFamiliarSchema = Field(default_factory=NucleoFamiliarSchema)
    outras_propriedades: OutrasPropriedadesSchema = Field(default_factory=OutrasPropriedadesSchema)
    declaracao: DeclaracaoSchema = Field(default_factory=DeclaracaoSchema)


class FichaSocioeconomicaEntrada(FichaSocioeconomicaBase):
    """Corpo do PUT. Recusa com 422 listando TODOS os campos faltantes."""

    @model_validator(mode="after")
    def exige_obrigatorios(self):
        faltam = campos_faltantes(self)
        if faltam:
            raise PydanticCustomError(
                "campos_obrigatorios",
                "Campos obrigatórios não preenchidos: {lista}",
                {"lista": "; ".join(faltam), "campos": faltam},
            )
        return self


class FichaSocioeconomicaResposta(FichaSocioeconomicaBase):
    dados_pessoais: DadosPessoaisSchema = Field(default_factory=DadosPessoaisSchema)
    completa: bool = False
    created_at: datetime | None = None
    updated_at: datetime | None = None

    @field_serializer("created_at", "updated_at")
    def serializa_datas_sao_paulo(self, valor: datetime | None):
        return para_sao_paulo(valor)
