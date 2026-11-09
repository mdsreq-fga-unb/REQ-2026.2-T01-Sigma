from pydantic import BaseModel,ConfigDict,EmailStr,Field,field_validator
from datetime import datetime

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

class UsuarioResponse(BaseModel):
    model_config = ConfigDict(from_attributes= True)
    id:int
    nome:str
    email:EmailStr
    is_Admin:bool
    ativo:bool
    created_at:datetime
    updated_at:datetime

class UsuarioAdminCreate(UsuarioCreate):
    is_Admin:bool
