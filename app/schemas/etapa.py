from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator


class EtapaCreate(BaseModel):
    nome: str

    @field_validator("nome")
    @classmethod
    def validate_nome(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("O nome da etapa é obrigatório.")
        return v.strip()


class EtapaResumo(BaseModel):
    id: int
    nome: str

    model_config = ConfigDict(from_attributes=True)


class EtapaResponse(BaseModel):
    id: int
    nome: str
    quantidadeTurmas: int = Field(default=0, serialization_alias="quantidadeTurmas")
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)
