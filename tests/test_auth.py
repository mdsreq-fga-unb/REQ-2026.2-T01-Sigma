from datetime import datetime, timedelta, timezone
from app.core.config import settings
from app.core.security import create_access_token
from app.models.ops import Operacao, Tipo
from app.models.tentativa import TentativaLogin
from app.models.user import Usuario
from app.scripts.seed_admin import seed_admin


def test_login_success(client, db_session, test_user):
    """FP01: Login com credenciais válidas retorna token JWT e grava Operação e TentativaLogin."""
    response = client.post(
        "/auth/login",
        json={"email": test_user.email, "senha": "Senha@123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["expires_in"] == 1800

    # Verifica registro em Operacao
    op = db_session.query(Operacao).filter(Operacao.id_user == test_user.id).first()
    assert op is not None
    assert op.tipo == Tipo.LOGIN or op.tipo.value == "LOGIN"

    # Verifica registro em TentativaLogin
    tentativa = db_session.query(TentativaLogin).filter(TentativaLogin.id_user == test_user.id).first()
    assert tentativa is not None
    assert tentativa.sucesso is True
    assert tentativa.motivo == "sucesso"


def test_login_invalid_email(client, db_session):
    """FE01: E-mail inexistente retorna 401 genérico e grava tentativa."""
    response = client.post(
        "/auth/login",
        json={"email": "naoexiste@estacaovida.org.br", "senha": "QualquerCoisa"},
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "E-mail ou senha incorretos."

    tentativa = db_session.query(TentativaLogin).filter(
        TentativaLogin.email == "naoexiste@estacaovida.org.br"
    ).first()
    assert tentativa is not None
    assert tentativa.sucesso is False
    assert tentativa.id_user is None
    assert tentativa.motivo == "inexistente"


def test_login_invalid_password(client, db_session, test_user):
    """FE01: Senha incorreta retorna 401 genérico e incrementa falhas."""
    response = client.post(
        "/auth/login",
        json={"email": test_user.email, "senha": "SenhaErrada"},
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "E-mail ou senha incorretos."

    db_session.refresh(test_user)
    assert test_user.tentativas_falhas == 1

    tentativa = db_session.query(TentativaLogin).filter(
        TentativaLogin.id_user == test_user.id
    ).first()
    assert tentativa is not None
    assert tentativa.sucesso is False
    assert tentativa.motivo == "senha_incorreta"


def test_login_lockout_after_five_failures(client, db_session, test_user):
    """RN16 / FE04: Após 5 falhas consecutivas, a 6ª tentativa retorna 423 com tempo restante."""
    # 5 tentativas falhas consecutivas
    for i in range(5):
        res = client.post(
            "/auth/login",
            json={"email": test_user.email, "senha": f"SenhaErrada{i}"},
        )
        assert res.status_code == 401

    db_session.refresh(test_user)
    assert test_user.tentativas_falhas == 5
    assert test_user.bloqueado_ate is not None

    # 6ª tentativa mesmo com senha correta -> retorna 423 Locked
    res6 = client.post(
        "/auth/login",
        json={"email": test_user.email, "senha": "Senha@123"},
    )
    assert res6.status_code == 423
    data6 = res6.json()
    assert "Conta temporariamente bloqueada por excesso de tentativas" in data6["detail"]
    assert data6["segundos_restantes"] > 0


def test_login_lockout_expiry(client, db_session, test_user):
    """RN16: Após o tempo de bloqueio expirar, o login é restabelecido e falhas zeradas."""
    test_user.tentativas_falhas = 5
    # Bloqueado no passado (expirado)
    test_user.bloqueado_ate = datetime.now(timezone.utc) - timedelta(minutes=1)
    db_session.commit()

    response = client.post(
        "/auth/login",
        json={"email": test_user.email, "senha": "Senha@123"},
    )
    assert response.status_code == 200
    db_session.refresh(test_user)
    assert test_user.tentativas_falhas == 0
    assert test_user.bloqueado_ate is None


def test_login_reset_failures_on_success(client, db_session, test_user):
    """Login bem-sucedido zera contador de falhas."""
    test_user.tentativas_falhas = 3
    db_session.commit()

    response = client.post(
        "/auth/login",
        json={"email": test_user.email, "senha": "Senha@123"},
    )
    assert response.status_code == 200
    db_session.refresh(test_user)
    assert test_user.tentativas_falhas == 0


def test_login_inactive_user(client, inactive_user):
    """RN18 / FE05: Usuário inativo recebe 403 e não recebe token."""
    response = client.post(
        "/auth/login",
        json={"email": inactive_user.email, "senha": "Senha@123"},
    )
    assert response.status_code == 403
    assert "Sua conta encontra-se inativa" in response.json()["detail"]


def test_get_me_authenticated(client, test_user):
    """GET /auth/me autenticado retorna dados do usuário e novo token em X-Renewed-Token."""
    token = create_access_token({"sub": str(test_user.id), "user_id": test_user.id})
    response = client.get(
        "/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == test_user.email
    assert data["nome"] == test_user.nome
    assert "senha" not in data
    assert "senha_hash" not in data

    # Verifica RN17: header com token renovado presente
    assert settings.renewed_token_header_name in response.headers
    renewed_token = response.headers[settings.renewed_token_header_name]
    assert renewed_token != ""


def test_get_me_unauthorized(client):
    """FE02: Rota protegida sem token retorna 401."""
    response = client.get("/auth/me")
    assert response.status_code == 401


def test_logout(client, db_session, test_user):
    """FP02: Logout com usuário autenticado retorna 204 e grava Operacao."""
    token = create_access_token({"sub": str(test_user.id), "user_id": test_user.id})
    response = client.post(
        "/auth/logout",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 204

    op = db_session.query(Operacao).filter(
        Operacao.id_user == test_user.id,
    ).first()
    assert op is not None
    assert op.tipo == Tipo.LOGOUT or op.tipo.value == "LOGOUT"


def test_seed_admin_script(db_session):
    """Seed de administrador inicial cria conta se não existir."""
    admin = seed_admin(
        nome="Admin Teste",
        email="adminteste@estacaovida.org.br",
        senha="Senha@Segura123",
        db=db_session,
    )
    assert admin.id is not None
    assert admin.email == "adminteste@estacaovida.org.br"
    assert admin.is_Admin is True
    assert admin.ativo is True
