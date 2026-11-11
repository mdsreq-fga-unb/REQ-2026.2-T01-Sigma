from pydantic import BaseModel,ConfigDict,EmailStr,Field,field_serializer,field_validator
from app.core.tempo import para_sao_paulo
from datetime import datetime
import re

class UsuarioCreate(BaseModel):
    nome:str = Field(min_length=1, max_length=100) 
    email:EmailStr
    senha:str = Field(min_length=8)

    @field_validator("email")
    @classmethod
    def email_ate_100_caracteres(cls, v: EmailStr) -> EmailStr:
        if len(str(v)) > 100:
            raise ValueError("O email deve ter no máximo 100 caracteres")
        return v

    @field_validator("senha")
    @classmethod
    def senha_ate_72_bytes(cls, v: str) -> str:
        if len(v.encode("utf-8")) > 72:
            raise ValueError("A senha deve ter no máximo 72 bytes")
        return v

    @field_validator("senha")
    @classmethod
    def senha_tem_numero(cls,v:str) -> str:
        if (re.search(r'[A-Za-z]', v) and re.search(r'\d', v) and re.search(r'[^a-zA-Z0-9]', v)):
            return v
        else:
            raise ValueError("A senha deve conter no mínimo 8 caracteres, incluindo letras, números e caracteres especiais.")

class UsuarioResponse(BaseModel):
    model_config = ConfigDict(from_attributes= True)
    id:int
    nome:str
    email:EmailStr
    is_Admin:bool
    ativo:bool
    created_at:datetime
    updated_at:datetime

    @field_serializer("created_at", "updated_at")
    def serializa_datas_sao_paulo(self, valor: datetime | None):
        return para_sao_paulo(valor)

class UsuarioAdminCreate(UsuarioCreate):
    is_Admin:bool


class UsuarioListResponse(BaseModel):
    itens: list[UsuarioResponse]
    total: int
    pagina: int
    tamanho: int
