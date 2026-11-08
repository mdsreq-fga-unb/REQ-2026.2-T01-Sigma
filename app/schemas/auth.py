from pydantic import BaseModel, ConfigDict, EmailStr


class LoginRequest(BaseModel):
    email: EmailStr
    senha: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class UserResponse(BaseModel):
    id: int
    nome: str
    email: str
    is_Admin: bool
    ativo: bool

    model_config = ConfigDict(from_attributes=True)


class LockoutResponse(BaseModel):
    detail: str
    segundos_restantes: int
