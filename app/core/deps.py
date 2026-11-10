from typing import Annotated, Generator
from fastapi import Depends, HTTPException, Request, Response, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_db
from app.core.security import create_access_token, decode_access_token
from app.models.user import Usuario

security_bearer = HTTPBearer(auto_error=False)


def get_current_user(


        
    request: Request,
    response: Response,
    db: Annotated[Session, Depends(get_db)],
    token_auth: Annotated[HTTPAuthorizationCredentials | None, Depends(security_bearer)] = None,
) -> Usuario:
    """
    Dependência reutilizável para rotas internas (FE02 / RF06 / RNF02).
    Verifica a autenticação com JWT e renova o token a cada requisição válida (RN17),
    devolvendo o novo token no cabeçalho configurado (padrão: X-Renewed-Token).
    """
    if not token_auth or not token_auth.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de autenticação ausente ou inválido.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = token_auth.credentials
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expirado ou inválido.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload.get("user_id") or payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token com formato inválido.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        user_id_int = int(user_id)
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Identificador de usuário inválido no token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.query(Usuario).filter(Usuario.id == user_id_int).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário não encontrado.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.ativo:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado. Sua conta encontra-se inativa. Procure a administração.",
        )

    # Renovação do token a cada requisição autenticada (RN17)
    renewed_token = create_access_token({
        "sub": str(user.id),
        "user_id": user.id,
        "email": user.email,
        "is_Admin": user.is_Admin,
    })
    response.headers[settings.renewed_token_header_name] = renewed_token
    # Exposição do cabeçalho para permitir leitura em clientes navegadores/Axios
    response.headers["Access-Control-Expose-Headers"] = settings.renewed_token_header_name

    return user


def get_admin_atual(
    user_atual: Annotated[Usuario, Depends(get_current_user)],
) -> Usuario:

    if not user_atual.is_Admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuário não tem permissão para realizar esta ação.",
        )
    return user_atual
