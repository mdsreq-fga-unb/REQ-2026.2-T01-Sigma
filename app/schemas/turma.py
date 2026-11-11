from datetime import datetime
from typing import Optional
from pydantic import AliasChoices, BaseModel, ConfigDict, Field, field_serializer, field_validator
from app.core.tempo import para_sao_paulo
from app.models.turma import Turno
from app.schemas.etapa import EtapaResumo


class TurmaCreate(BaseModel):
    nome: str
    id_etapa: int = Field(validation_alias=AliasChoices("id_etapa", "etapaId", "etapa_id"))
    turno: Optional[Turno | str] = None

    @field_validator("nome")
    @classmethod
    def validate_nome(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("O nome da turma é obrigatório.")
        return v.strip()

    @field_validator("id_etapa")
    @classmethod
    def validate_etapa(cls, v: int) -> int:
        if v is None:
            raise ValueError("O ID da etapa é obrigatório.")
        return v

    @field_validator("turno", mode="before")
    @classmethod
    def validate_turno(cls, v: Optional[str]) -> Optional[str]:
        if v is None or v == "":
            return None
        if isinstance(v, str):
            v_lower = v.strip().lower()
            validos = {"manha", "tarde", "noite", "integral"}
            if v_lower not in validos:
                raise ValueError(f"Turno inválido. Valores aceitos: {', '.join(validos)}")
            return v_lower
        return v


class TurmaResponse(BaseModel):
    id: int
    nome: str
    turno: Optional[str] = None
    status: str
    id_etapa: int
    etapa: EtapaResumo
    quantidadeAlunos: int = Field(default=0, serialization_alias="quantidadeAlunos")
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    @field_serializer("created_at", "updated_at")
    def serializa_datas_sao_paulo(self, valor: datetime | None):
        return para_sao_paulo(valor)
