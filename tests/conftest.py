import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_db
from app.core.security import get_password_hash
from app.main import app
from app.models.user import Usuario

# Cria banco em memória SQLite para testes
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(autouse=True)
def setup_database():
    """Cria todas as tabelas antes de cada teste e remove ao final."""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def db_session():
    """Retorna uma sessão isolada para o teste."""
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    try:
        yield session
    finally:
        session.close()
        transaction.rollback()
        connection.close()


@pytest.fixture
def client(db_session):
    """Cliente de teste do FastAPI com sobrescrita de banco."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def test_user(db_session):
    """Cria um usuário padrão para os testes."""
    user = Usuario(
        nome="Secretária Maria",
        email="maria@estacaovida.org.br",
        senha_hash=get_password_hash("Senha@123"),
        is_Admin=False,
        ativo=True,
        tentativas_falhas=0,
        bloqueado_ate=None,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def inactive_user(db_session):
    """Cria um usuário inativo para teste da RN18."""
    user = Usuario(
        nome="Usuário Desativado",
        email="inativo@estacaovida.org.br",
        senha_hash=get_password_hash("Senha@123"),
        is_Admin=False,
        ativo=False,
        tentativas_falhas=0,
        bloqueado_ate=None,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user
