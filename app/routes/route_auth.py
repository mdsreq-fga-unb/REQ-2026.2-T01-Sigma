"""
Módulo de Autenticação - UC01 (Login, Logout e Sessão com JWT)

Convenções e Regras de Negócio:
- RF06 / FP01: POST /auth/login autentica usuários válidos com credenciais seguras e emite token JWT.
- RF07 / FP02: POST /auth/logout registra encerramento da sessão em Operacao (tipo LOGOUT).
- RNF02 / FE02: Rotas internas protegidas retornam HTTP 401 caso não haja token válido.
- RN16 / FE04: Bloqueio temporário após 5 falhas consecutivas de login por 15 minutos (HTTP 423 Locked).
- RN17: A sessão expira após 30 minutos de inatividade. O backend renova o token a cada requisição
  autenticada e o devolve através do cabeçalho HTTP 'X-Renewed-Token'. O frontend deve capturar
  esse cabeçalho (ex: via interceptor do Axios) e atualizar seu armazenamento local com o novo token.
- RN18 / FE05: Usuários com status ativo = False são impedidos de autenticar (HTTP 403 Forbidden).
"""
from datetime import datetime, timedelta, timezone
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.security import create_access_token, verify_password
from app.models.ops import Operacao, Tipo
from app.models.tentativa import TentativaLogin
from app.models.user import Usuario
from app.schemas.auth import LoginRequest, TokenResponse, UserResponse

router = APIRouter(prefix="/auth", tags=["Autenticação"])


def _get_utc_now() -> datetime:
    return datetime.now(timezone.utc)


def _ensure_aware(dt: datetime) -> datetime:
    """Garante que o datetime tenha timezone UTC para comparação segura."""
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt


@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Realiza a autenticação de secretária ou administrador (UC01 - FP01)",
    responses={
        200: {"description": "Login realizado com sucesso e token JWT emitido."},
        401: {"description": "Credenciais inválidas (FE01)."},
        403: {"description": "Conta inativa (FE05 / RN18)."},
        423: {"description": "Conta bloqueada por excesso de tentativas (FE04 / RN16)."},
        503: {"description": "Falha de conexão com o banco de dados (FE03)."},
    },
)
def login(
    login_data: LoginRequest,
    db: Annotated[Session, Depends(get_db)],
):
    now = _get_utc_now()
    try:
        user = db.query(Usuario).filter(Usuario.email == login_data.email.lower()).first()
    except SQLAlchemyError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Não foi possível conectar ao servidor. Tente novamente mais tarde.",
        )

    # FE01: Usuário inexistente
    if not user:
        try:
            tentativa = TentativaLogin(
                email=str(login_data.email.lower()),
                id_user=None,
                data_hora=now,
                sucesso=False,
                motivo="inexistente",
            )
            db.add(tentativa)
            db.commit()
        except SQLAlchemyError:
            db.rollback()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail ou senha incorretos.",
        )

    # FE04 / RN16: Verifica se a conta está bloqueada por tentativas excedidas
    if user.bloqueado_ate:
        bloqueado_ate_aware = _ensure_aware(user.bloqueado_ate)
        if bloqueado_ate_aware > now:
            segundos_restantes = int((bloqueado_ate_aware - now).total_seconds())
            if segundos_restantes > 0:
                try:
                    tentativa = TentativaLogin(
                        email=user.email,
                        id_user=user.id,
                        data_hora=now,
                        sucesso=False,
                        motivo="bloqueada",
                    )
                    db.add(tentativa)
                    db.commit()
                except SQLAlchemyError:
                    db.rollback()
                return JSONResponse(
                    status_code=status.HTTP_423_LOCKED,
                    content={
                        "detail": f"Conta temporariamente bloqueada por excesso de tentativas. Tente novamente em {segundos_restantes} segundos.",
                        "segundos_restantes": segundos_restantes,
                    },
                )
        else:
            # Bloqueio expirou: restabelece o acesso e reseta contador
            user.bloqueado_ate = None
            user.tentativas_falhas = 0
            try:
                db.commit()
            except SQLAlchemyError:
                db.rollback()

    # Validação da senha
    if not verify_password(login_data.senha, user.senha_hash):
        user.tentativas_falhas = (user.tentativas_falhas or 0) + 1
        motivo = "senha_incorreta"

        # Ao atingir 5 falhas consecutivas, bloqueia por 15 minutos (RN16)
        if user.tentativas_falhas >= settings.max_login_failed_attempts:
            user.bloqueado_ate = now + timedelta(minutes=settings.lockout_duration_minutes)

        try:
            tentativa = TentativaLogin(
                email=user.email,
                id_user=user.id,
                data_hora=now,
                sucesso=False,
                motivo=motivo,
            )
            db.add(tentativa)
            db.commit()
        except SQLAlchemyError:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Não foi possível conectar ao servidor. Tente novamente mais tarde.",
            )

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail ou senha incorretos.",
        )

    # FE05 / RN18: Conta inativa não tem permissão para acessar
    if not user.ativo:
        try:
            tentativa = TentativaLogin(
                email=user.email,
                id_user=user.id,
                data_hora=now,
                sucesso=False,
                motivo="inativa",
            )
            db.add(tentativa)
            db.commit()
        except SQLAlchemyError:
            db.rollback()

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado. Sua conta encontra-se inativa. Procure a administração.",
        )

    # FP01: Login com sucesso
    try:
        user.tentativas_falhas = 0
        user.bloqueado_ate = None

        tentativa = TentativaLogin(
            email=user.email,
            id_user=user.id,
            data_hora=now,
            sucesso=True,
            motivo="sucesso",
        )
        db.add(tentativa)

        # Auditoria: registro de operação de LOGIN
        operacao = Operacao(
            id_user=user.id,
            id_aluno=None,
            tipo=Tipo.LOGIN,
            data_op=now,
            descricao="Login realizado com sucesso",
        )
        db.add(operacao)
        db.commit()
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Não foi possível conectar ao servidor. Tente novamente mais tarde.",
        )

    token = create_access_token(
        data={
            "sub": str(user.id),
            "user_id": user.id,
            "email": user.email,
            "is_Admin": user.is_Admin,
        }
    )

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        expires_in=settings.access_token_expire_minutes * 60,
    )


@router.post(
    "/logout",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Realiza o encerramento da sessão ativa (UC01 - FP02)",
    responses={
        204: {"description": "Logout efetuado com sucesso e operação registrada."},
        401: {"description": "Usuário não autenticado (FE02)."},
    },
)
def logout(
    current_user: Annotated[Usuario, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    try:
        operacao = Operacao(
            id_user=current_user.id,
            id_aluno=None,
            tipo=Tipo.LOGOUT,
            data_op=_get_utc_now(),
            descricao="Logout realizado com sucesso",
        )
        db.add(operacao)
        db.commit()
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Não foi possível conectar ao servidor. Tente novamente mais tarde.",
        )

    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Retorna os dados do usuário autenticado no token",
    responses={
        200: {"description": "Dados do usuário autenticado."},
        401: {"description": "Token ausente, inválido ou expirado (FE02)."},
        403: {"description": "Conta inativa."},
    },
)
def get_me(
    current_user: Annotated[Usuario, Depends(get_current_user)],
):
    return current_user
