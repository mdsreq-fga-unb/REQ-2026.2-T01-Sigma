"""Fixtures e funções de apoio compartilhadas pelos testes dos termos da matrícula (UC04).

Importadas explicitamente pelos módulos de teste (não ficam no conftest.py para não conflitar
com as fixtures das outras fichas da matrícula).

Duas famílias de fixtures:
- `matricula_termos` / `auth_termos`: usam a sessão do conftest (`db_session`), que roda dentro de
  uma transação externa. Servem para quase todos os testes.
- `*_real`: usam uma sessão com `commit` e `rollback` de verdade. Só assim dá para provar que
  uma falha no meio do salvamento não deixa dados parciais (FE04): na sessão do conftest, o
  `rollback` desfaz até os dados criados pela própria fixture e o teste passaria à toa.
"""
import io
import itertools
import unicodedata
from datetime import date

import pytest
from fastapi.testclient import TestClient

from app.core.database import get_db
from app.core.security import create_access_token, get_password_hash
from app.main import app
from app.models.aluno import Aluno, Raca, Sexo
from app.models.etapa import Etapa
from app.models.matricula import Matricula
from app.models.pessoa import Pessoa
from app.models.responsavel import Responsavel
from app.models.turma import Turma, Turno
from app.models.user import Usuario
from tests.conftest import TestingSessionLocal

# CPFs com dígito verificador válido.
CPF_VALIDO = "52998224725"
OUTRO_CPF_VALIDO = "11144477735"

ENDERECO_DO_ALUNO = "Rua das Flores, nº 10, Centro, Águas Lindas de Goiás/GO, CEP 72910-000"

_contador = itertools.count(1)


def weasyprint_disponivel() -> bool:
    """`False` quando as bibliotecas do sistema (Pango) não estão instaladas."""
    try:
        import weasyprint  # noqa: F401
    except (ImportError, OSError):
        return False
    return True


# Os testes de PDF dependem do WeasyPrint: sem ele, são pulados em vez de quebrar a suíte.
pular_sem_pdf = pytest.mark.skipif(
    not weasyprint_disponivel(),
    reason="WeasyPrint não carregou (faltam as bibliotecas do sistema, ex.: Pango)",
)


def texto_do_pdf(conteudo: bytes) -> str:
    """Texto do PDF, com espaços e quebras de linha normalizados (para comparar com outros textos)."""
    pypdf = pytest.importorskip("pypdf")
    leitor = pypdf.PdfReader(io.BytesIO(conteudo))
    return normalizar("\n".join(pagina.extract_text() for pagina in leitor.pages))


def normalizar(texto: str) -> str:
    """NFKC desfaz ligaduras da fonte; split/join junta as quebras de linha do PDF."""
    return " ".join(unicodedata.normalize("NFKC", texto).split())


def sem_espacos(texto: str) -> str:
    """Tira todos os espaços. Serve para comparar textos que o PDF quebrou em linhas, inclusive
    no meio de palavras com hífen ("bus-" / "door")."""
    return "".join(normalizar(texto).split())


def cabecalhos(usuario: Usuario) -> dict:
    token = create_access_token({
        "sub": str(usuario.id),
        "user_id": usuario.id,
        "email": usuario.email,
        "is_Admin": usuario.is_Admin,
    })
    return {"Authorization": f"Bearer {token}"}


def criar_usuario(db, email: str = "secretaria@estacaovida.org.br", ativo: bool = True) -> Usuario:
    usuario = Usuario(
        nome="Secretária Teste",
        email=email,
        senha_hash=get_password_hash("Senha@123"),
        is_Admin=False,
        ativo=ativo,
    )
    db.add(usuario)
    db.commit()
    db.refresh(usuario)
    return usuario


def criar_aluno(db, nome: str = "Ana Beatriz de Souza", nome_etapa: str = "Maternal I", **extras) -> Aluno:
    """Aluno com etapa, turma, pessoa e responsável (CPFs únicos a cada chamada)."""
    n = next(_contador)
    etapa = Etapa(nome=nome_etapa)
    db.add(etapa)
    db.flush()
    turma = Turma(nome=f"Turma {n}", turno=Turno.INTEGRAL, id_etapa=etapa.id)
    pessoa = Pessoa(
        nome="Maria das Graças Souza",
        cpf=str(20_000_000_000 + n),
        data_nasc=date(1990, 3, 15),
    )
    db.add_all([turma, pessoa])
    db.flush()
    responsavel = Responsavel(id_pessoa=pessoa.id, telefone="61999990000", email="maria@example.com")
    db.add(responsavel)
    db.flush()

    dados = {
        "nome": nome,
        "data_nasc": date(2022, 5, 10),
        "nis": None,
        "cpf": str(30_000_000_000 + n),
        "sexo": Sexo.FEMININO,
        "raca": Raca.PARDO,
        "nacionalidade": "Brasileira",
        "uf": "GO",
        "logradouro": "Rua das Flores",
        "numero": "10",
        "bairro": "Centro",
        "cidade": "Águas Lindas de Goiás",
        "cep": "72910-000",
        "uf_residencia": "GO",
        "responsavel_id": responsavel.id,
        "turma_id": turma.id,
    }
    dados.update(extras)
    aluno = Aluno(**dados)
    db.add(aluno)
    db.flush()
    return aluno


def criar_matricula(db, aluno: Aluno | None = None, ano: int = 2026, **dados_aluno) -> Matricula:
    """Matrícula de `ano`. Sem `aluno`, cria um. Com `aluno`, é outra matrícula do mesmo aluno."""
    if aluno is None:
        aluno = criar_aluno(db, **dados_aluno)
    matricula = Matricula(ano=ano, id_aluno=aluno.id)
    db.add(matricula)
    db.commit()
    db.refresh(matricula)
    return matricula


# ---------------------------------------------------------------------------
# Sessão do conftest (transação externa)
# ---------------------------------------------------------------------------


@pytest.fixture
def matricula_termos(db_session) -> Matricula:
    return criar_matricula(db_session)


@pytest.fixture
def auth_termos(test_user) -> dict:
    return cabecalhos(test_user)


# ---------------------------------------------------------------------------
# Sessão com commit e rollback reais
# ---------------------------------------------------------------------------


@pytest.fixture
def db_real():
    sessao = TestingSessionLocal()
    try:
        yield sessao
    finally:
        sessao.close()


@pytest.fixture
def client_real(db_real):
    def sobrescrever_get_db():
        yield db_real

    app.dependency_overrides[get_db] = sobrescrever_get_db
    with TestClient(app) as cliente:
        yield cliente
    app.dependency_overrides.clear()


@pytest.fixture
def matricula_real(db_real) -> Matricula:
    return criar_matricula(db_real)


@pytest.fixture
def auth_real(db_real) -> dict:
    return cabecalhos(criar_usuario(db_real))
