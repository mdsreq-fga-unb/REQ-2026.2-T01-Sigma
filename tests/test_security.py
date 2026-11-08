from datetime import timedelta
import time
from app.core.security import (
    create_access_token,
    decode_access_token,
    get_password_hash,
    verify_password,
)


def test_password_hashing():
    password = "MinhaSenhaForte@2026"
    hashed = get_password_hash(password)

    assert hashed != password
    assert verify_password(password, hashed) is True
    assert verify_password("SenhaErrada", hashed) is False


def test_jwt_create_and_decode():
    data = {"sub": "123", "email": "teste@estacaovida.org.br"}
    token = create_access_token(data, expires_delta=timedelta(minutes=5))

    decoded = decode_access_token(token)
    assert decoded is not None
    assert decoded.get("sub") == "123"
    assert decoded.get("email") == "teste@estacaovida.org.br"
    assert "exp" in decoded


def test_jwt_expired():
    data = {"sub": "123"}
    # Token expirado há 10 segundos
    token = create_access_token(data, expires_delta=timedelta(seconds=-10))
    decoded = decode_access_token(token)
    assert decoded is None


def test_jwt_tampered():
    data = {"sub": "123"}
    token = create_access_token(data)
    tampered_token = token + "corrompido"
    decoded = decode_access_token(tampered_token)
    assert decoded is None
