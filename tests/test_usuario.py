import pytest
from pydantic import ValidationError
from sqlalchemy.exc import SQLAlchemyError

from app.core.security import create_access_token, get_password_hash
from app.models.ops import Operacao, Tipo
from app.models.user import Usuario
from app.schemas.schema_usuario import UsuarioCreate

SENHA_VALIDA = "Abc@1234"


def _headers(user: Usuario) -> dict:
    token = create_access_token({
        "sub": str(user.id),
        "user_id": user.id,
        "email": user.email,
        "is_Admin": user.is_Admin,
    })
    return {"Authorization": f"Bearer {token}"}


def _payload(**overrides):
    dados = {"nome": "Novo Usuário", "email": "novo@estacaovida.org.br", "senha": SENHA_VALIDA}
    dados.update(overrides)
    return dados


@pytest.fixture
def admin_user(db_session):
    user = Usuario(
        nome="Administrador Teste",
        email="admin.teste@estacaovida.org.br",
        senha_hash=get_password_hash("Admin@1234"),
        is_Admin=True,
        ativo=True,
        tentativas_falhas=0,
        bloqueado_ate=None,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def admin_headers(admin_user):
    return _headers(admin_user)


@pytest.fixture
def user_headers(test_user):
    return _headers(test_user)


# ---------- RN20: validação de senha (unitário, sem banco) ----------

@pytest.mark.parametrize("senha", [
    "Ab@1",                  # menos de 8 caracteres
    "abcdefg@",              # sem número
    "abcdefg12",             # sem caractere especial
    "12345678@",             # sem letra
    "Abc@1234" + "a" * 70,   # mais de 72 bytes
])
def test_senha_fora_do_padrao_e_rejeitada(senha):
    with pytest.raises(ValidationError):
        UsuarioCreate(nome="X", email="x@estacaovida.org.br", senha=senha)


def test_senha_valida_e_aceita():
    UsuarioCreate(nome="X", email="x@estacaovida.org.br", senha=SENHA_VALIDA)


# ---------- POST /usuarios (UC02 / FP01) ----------

def test_admin_cadastra_usuario_com_sucesso(client, db_session, admin_user, admin_headers):
    """Cadastro válido: 201, is_Admin False, ativo True, senha em hash, Operacao gravada."""
    res = client.post("/usuarios", json=_payload(), headers=admin_headers)

    assert res.status_code == 201
    data = res.json()
    assert data["is_Admin"] is False
    assert data["ativo"] is True
    assert "senha" not in data
    assert "senha_hash" not in data

    usuario = db_session.query(Usuario).filter(Usuario.email == "novo@estacaovida.org.br").first()
    assert usuario is not None
    assert usuario.senha_hash != SENHA_VALIDA
    assert usuario.senha_hash.startswith("$2")

    op = db_session.query(Operacao).filter(Operacao.tipo == Tipo.CADASTRO_USUARIO).first()
    assert op is not None
    assert op.id_user == admin_user.id
    assert "Novo Usuário" in op.descricao


def test_cadastro_sem_token_retorna_401(client):
    """FE02 / RNF02: sem token válido, 401."""
    res = client.post("/usuarios", json=_payload())
    assert res.status_code == 401


def test_usuario_comum_recebe_403(client, user_headers):
    """Somente administrador cadastra."""
    res = client.post("/usuarios", json=_payload(), headers=user_headers)
    assert res.status_code == 403


def test_email_duplicado_em_outra_caixa_retorna_409(client, admin_headers):
    """RN19 / FE01: mesmo e-mail em maiúsculas ou minúsculas retorna 409 com a mensagem do caso de uso."""
    primeiro = client.post("/usuarios", json=_payload(email="Ana@Estacao.org.br"), headers=admin_headers)
    assert primeiro.status_code == 201

    res = client.post("/usuarios", json=_payload(email="ana@estacao.org.br"), headers=admin_headers)
    assert res.status_code == 409
    assert res.json()["detail"] == "Este e-mail já está em uso por outro usuário."


def test_email_de_usuario_existente_em_outra_caixa_retorna_409(client, admin_headers, test_user):
    """RN19: e-mail de usuário já existente, digitado em maiúsculas, retorna 409."""
    res = client.post("/usuarios", json=_payload(email="MARIA@estacaovida.org.br"), headers=admin_headers)
    assert res.status_code == 409


def test_campos_obrigatorios_vazios_retornam_422(client, admin_headers):
    """FE02: campo obrigatório ausente retorna 422 indicando o campo."""
    res = client.post(
        "/usuarios",
        json={"email": "x@estacaovida.org.br", "senha": SENHA_VALIDA},
        headers=admin_headers,
    )
    assert res.status_code == 422
    campos = [erro["loc"][-1] for erro in res.json()["detail"]]
    assert "nome" in campos


def test_senha_fraca_retorna_422(client, admin_headers):
    """FE04: senha fora do padrão retorna 422."""
    res = client.post("/usuarios", json=_payload(senha="abcdefgh"), headers=admin_headers)
    assert res.status_code == 422


def test_falha_de_banco_retorna_503(client, admin_headers, monkeypatch):
    """FE03: falha de banco durante o cadastro retorna 503."""
    def falha(*args, **kwargs):
        raise SQLAlchemyError("falha simulada")

    monkeypatch.setattr("app.routes.route_usuario.criar_usuario", falha)
    res = client.post("/usuarios", json=_payload(), headers=admin_headers)
    assert res.status_code == 503


def test_falha_ao_gravar_operacao_nao_deixa_usuario_gravado(client, db_session, admin_headers, monkeypatch):
    """Atomicidade: se Operacao falhar, o usuário não fica gravado pela metade."""
    def operacao_com_falha(*args, **kwargs):
        raise SQLAlchemyError("falha simulada na operação")

    monkeypatch.setattr("app.services.service_usuario.Operacao", operacao_com_falha)
    res = client.post("/usuarios", json=_payload(email="atomico@estacaovida.org.br"), headers=admin_headers)

    assert res.status_code == 503
    assert db_session.query(Usuario).filter(Usuario.email == "atomico@estacaovida.org.br").first() is None


def test_nao_existe_rota_de_exclusao(client, admin_headers, test_user):
    """RN21: exclusão de usuário não existe no MVP."""
    res = client.delete(f"/usuarios/{test_user.id}", headers=admin_headers)
    assert res.status_code in (404, 405)


# ---------- GET /usuarios (paginado, somente admin) ----------

def test_admin_lista_usuarios_paginados(client, admin_headers, admin_user, test_user):
    res = client.get("/usuarios?pagina=1&tamanho=1", headers=admin_headers)

    assert res.status_code == 200
    data = res.json()
    assert data["total"] == 2
    assert len(data["itens"]) == 1
    assert data["pagina"] == 1
    assert data["tamanho"] == 1
    assert "senha_hash" not in data["itens"][0]


def test_listagem_por_usuario_comum_retorna_403(client, user_headers):
    res = client.get("/usuarios", headers=user_headers)
    assert res.status_code == 403


def test_listagem_sem_token_retorna_401(client):
    res = client.get("/usuarios")
    assert res.status_code == 401


def test_tamanho_acima_de_100_retorna_422(client, admin_headers):
    res = client.get("/usuarios?tamanho=101", headers=admin_headers)
    assert res.status_code == 422


def test_pagina_zero_retorna_422(client, admin_headers):
    res = client.get("/usuarios?pagina=0", headers=admin_headers)
    assert res.status_code == 422
