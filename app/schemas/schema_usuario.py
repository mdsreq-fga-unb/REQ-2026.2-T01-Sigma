from pydantic import BaseModel,ConfigDict,EmailStr
from datetime import datetime

class UsuarioCreate(BaseModel):
    nome:str 
    email:EmailStr
    senha:str
    

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