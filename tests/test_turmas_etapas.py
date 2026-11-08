from datetime import date
from unittest.mock import patch
import pytest
from sqlalchemy.exc import OperationalError
from app.core.security import create_access_token
from app.models.aluno import Aluno, Raca, Sexo, StatusAluno
from app.models.etapa import Etapa
from app.models.ops import Operacao, Tipo
from app.models.pessoa import Pessoa
from app.models.resp import Responsavel
from app.models.turma import StatusTurma, Turma, Turno


def get_auth_headers(user) -> dict:
    token = create_access_token(data={"sub": str(user.id)})
    return {"Authorization": f"Bearer {token}"}


# ----------------- TESTES DE AUTENTICAÇÃO (RNF02) -----------------


def test_rotas_etapas_e_turmas_exigem_autenticacao(client):
    """Rotas protegidas sem token retornam 401 Unauthorized (RNF02)."""
    assert client.get("/etapas").status_code == 401
    assert client.post("/etapas", json={"nome": "Etapa 1"}).status_code == 401
    assert client.get("/turmas").status_code == 401
    assert client.post("/turmas", json={"nome": "Turma A", "id_etapa": 1}).status_code == 401
    assert client.patch("/turmas/1/status").status_code == 401
    assert client.patch("/turmas/1/inativar").status_code == 401


# ----------------- TESTES DE ETAPAS (FP01, FP02 passo 2) -----------------


def test_cadastrar_etapa_sucesso_e_auditoria(client, test_user, db_session):
    """Cadastra etapa com sucesso e grava registro em Operacao (FP01)."""
    headers = get_auth_headers(test_user)
    payload = {"nome": "Maternal I"}

    response = client.post("/etapas", json=payload, headers=headers)
    assert response.status_code == 201
    data = response.json()

    assert data["nome"] == "Maternal I"
    assert data["id"] is not None
    assert data["quantidadeTurmas"] == 0

    # Verifica persistência no banco
    etapa_db = db_session.query(Etapa).filter(Etapa.id == data["id"]).first()
    assert etapa_db is not None
    assert etapa_db.nome == "Maternal I"

    # Verifica auditoria em Operacao
    op = (
        db_session.query(Operacao)
        .filter(Operacao.tipo == Tipo.CADASTRO_ETAPA)
        .order_by(Operacao.id.desc())
        .first()
    )
    assert op is not None
    assert op.id_user == test_user.id
    assert op.id_aluno is None
    assert f"ID {data['id']}" in op.descricao
    assert "Maternal I" in op.descricao


def test_cadastrar_etapa_com_mesmo_nome_aceita(client, test_user, db_session):
    """Etapa com nome igual ao de outra é aceita (fora do MVP validação de duplicidade)."""
    headers = get_auth_headers(test_user)

    r1 = client.post("/etapas", json={"nome": "Jardim II"}, headers=headers)
    assert r1.status_code == 201

    r2 = client.post("/etapas", json={"nome": "Jardim II"}, headers=headers)
    assert r2.status_code == 201

    assert r1.json()["id"] != r2.json()["id"]
    count = db_session.query(Etapa).filter(Etapa.nome == "Jardim II").count()
    assert count == 2


def test_cadastrar_etapa_nome_vazio_retorna_422(client, test_user):
    """Tentativa de cadastrar etapa com nome vazio ou nulo retorna 422 (FE01)."""
    headers = get_auth_headers(test_user)

    r1 = client.post("/etapas", json={"nome": ""}, headers=headers)
    assert r1.status_code == 422

    r2 = client.post("/etapas", json={"nome": "   "}, headers=headers)
    assert r2.status_code == 422

    r3 = client.post("/etapas", json={}, headers=headers)
    assert r3.status_code == 422


def test_listar_etapas_com_filtro_busca_e_contagem(client, test_user, db_session):
    """Listagem de etapas calcula turmas vinculadas e suporta filtro de busca."""
    headers = get_auth_headers(test_user)

    e1 = Etapa(nome="Berçário")
    e2 = Etapa(nome="Maternal II")
    db_session.add_all([e1, e2])
    db_session.commit()

    # Cria turmas para e1 (uma ativa e uma inativa - RN12 conta ambas)
    t1 = Turma(nome="Turma Berçário A", id_etapa=e1.id, status=StatusTurma.ATIVO)
    t2 = Turma(nome="Turma Berçário B", id_etapa=e1.id, status=StatusTurma.INATIVO)
    db_session.add_all([t1, t2])
    db_session.commit()

    # Listar todas
    res = client.get("/etapas", headers=headers)
    assert res.status_code == 200
    lista = res.json()
    assert len(lista) == 2

    bercario = next(e for e in lista if e["nome"] == "Berçário")
    assert bercario["quantidadeTurmas"] == 2

    maternal = next(e for e in lista if e["nome"] == "Maternal II")
    assert maternal["quantidadeTurmas"] == 0

    # Filtro de busca parcial
    res_busca = client.get("/etapas?busca=Matern", headers=headers)
    assert res_busca.status_code == 200
    lista_busca = res_busca.json()
    assert len(lista_busca) == 1
    assert lista_busca[0]["nome"] == "Maternal II"


# ----------------- TESTES DE TURMAS (FP02, FP04) -----------------


def test_cadastrar_turma_sem_etapas_cadastradas_retorna_409(client, test_user, db_session):
    """Cadastro de turma sem nenhuma etapa cadastrada retorna 409 com mensagem do caso de uso (FE04)."""
    headers = get_auth_headers(test_user)
    assert db_session.query(Etapa).count() == 0

    payload = {"nome": "Turma 101", "id_etapa": 1}
    response = client.post("/turmas", json=payload, headers=headers)

    assert response.status_code == 409
    assert response.json()["detail"] == "Não há etapas cadastradas. Cadastre uma etapa antes de continuar."


def test_cadastrar_turma_com_etapa_inexistente_retorna_422(client, test_user, db_session):
    """Cadastro de turma informando id_etapa que não existe retorna 422 (FE01)."""
    headers = get_auth_headers(test_user)
    # Cadastra uma etapa para que o banco não esteja vazio (passando pelo FE04)
    etapa = Etapa(nome="Etapa Existente")
    db_session.add(etapa)
    db_session.commit()

    payload = {"nome": "Turma 101", "id_etapa": 9999}
    response = client.post("/turmas", json=payload, headers=headers)

    assert response.status_code == 422
    assert "etapa informada não existe" in response.json()["detail"].lower()


def test_cadastrar_turma_nome_ou_etapa_vazios_retorna_422(client, test_user, db_session):
    """Cadastro de turma sem nome ou sem etapa retorna 422 (FE01 / RN22)."""
    headers = get_auth_headers(test_user)
    etapa = Etapa(nome="Etapa Base")
    db_session.add(etapa)
    db_session.commit()

    # Nome vazio
    r1 = client.post("/turmas", json={"nome": "", "id_etapa": etapa.id}, headers=headers)
    assert r1.status_code == 422

    # Nome com espaços
    r2 = client.post("/turmas", json={"nome": "   ", "id_etapa": etapa.id}, headers=headers)
    assert r2.status_code == 422

    # Sem id_etapa
    r3 = client.post("/turmas", json={"nome": "Turma A"}, headers=headers)
    assert r3.status_code == 422


def test_cadastrar_turma_sucesso_sem_turno_e_auditoria(client, test_user, db_session):
    """Turma sem turno é aceita, nasce com status ativo e vinculada à etapa informada (FP02)."""
    headers = get_auth_headers(test_user)
    etapa = Etapa(nome="Pré-Escola I")
    db_session.add(etapa)
    db_session.commit()

    payload = {"nome": "Turma Sol", "id_etapa": etapa.id}
    response = client.post("/turmas", json=payload, headers=headers)

    assert response.status_code == 201
    data = response.json()

    assert data["nome"] == "Turma Sol"
    assert data["status"] == "ATIVO"
    assert data["turno"] is None
    assert data["id_etapa"] == etapa.id
    assert data["etapa"]["id"] == etapa.id
    assert data["etapa"]["nome"] == "Pré-Escola I"
    assert data["quantidadeAlunos"] == 0

    # Verifica auditoria em Operacao
    op = (
        db_session.query(Operacao)
        .filter(Operacao.tipo == Tipo.CADASTRO_TURMA)
        .order_by(Operacao.id.desc())
        .first()
    )
    assert op is not None
    assert op.id_user == test_user.id
    assert op.id_aluno is None
    assert f"ID {data['id']}" in op.descricao
    assert "Turma Sol" in op.descricao


def test_cadastrar_turma_com_turno_e_alias_etapa_id(client, test_user, db_session):
    """Aceita payload com etapaId (convenção do frontend) e campo turno."""
    headers = get_auth_headers(test_user)
    etapa = Etapa(nome="Pré-Escola II")
    db_session.add(etapa)
    db_session.commit()

    payload = {"nome": "Turma Lua", "etapaId": etapa.id, "turno": "TARDE"}
    response = client.post("/turmas", json=payload, headers=headers)

    assert response.status_code == 201
    data = response.json()
    assert data["nome"] == "Turma Lua"
    assert data["turno"] == "tarde"


def test_cadastrar_turmas_com_mesmo_nome_na_mesma_etapa_aceita(client, test_user, db_session):
    """Turma com nome igual ao de outra turma da mesma etapa é aceita (RN14 fora do MVP)."""
    headers = get_auth_headers(test_user)
    etapa = Etapa(nome="Etapa Unica")
    db_session.add(etapa)
    db_session.commit()

    r1 = client.post("/turmas", json={"nome": "Turma Estrela", "id_etapa": etapa.id}, headers=headers)
    assert r1.status_code == 201

    r2 = client.post("/turmas", json={"nome": "Turma Estrela", "id_etapa": etapa.id}, headers=headers)
    assert r2.status_code == 201

    assert r1.json()["id"] != r2.json()["id"]
    count = db_session.query(Turma).filter(Turma.nome == "Turma Estrela").count()
    assert count == 2


def test_listar_turmas_com_filtros_status_e_etapa(client, test_user, db_session):
    """Listagem com filtro de status retorna apenas os registros do status pedido (FP04 / UC08)."""
    headers = get_auth_headers(test_user)
    e1 = Etapa(nome="Etapa 1")
    e2 = Etapa(nome="Etapa 2")
    db_session.add_all([e1, e2])
    db_session.commit()

    t1 = Turma(nome="Turma Ativa E1", id_etapa=e1.id, status=StatusTurma.ATIVO)
    t2 = Turma(nome="Turma Inativa E1", id_etapa=e1.id, status=StatusTurma.INATIVO)
    t3 = Turma(nome="Turma Ativa E2", id_etapa=e2.id, status=StatusTurma.ATIVO)
    db_session.add_all([t1, t2, t3])
    db_session.commit()

    # Filtro status=ativo (aceita minúsculo ou maiúsculo)
    res_ativo = client.get("/turmas?status=ativo", headers=headers)
    assert res_ativo.status_code == 200
    nomes_ativo = [t["nome"] for t in res_ativo.json()]
    assert "Turma Ativa E1" in nomes_ativo
    assert "Turma Ativa E2" in nomes_ativo
    assert "Turma Inativa E1" not in nomes_ativo

    # Filtro status=INATIVO
    res_inativo = client.get("/turmas?status=INATIVO", headers=headers)
    assert res_inativo.status_code == 200
    nomes_inativo = [t["nome"] for t in res_inativo.json()]
    assert nomes_inativo == ["Turma Inativa E1"]

    # Filtro por etapa
    res_etapa = client.get(f"/turmas?id_etapa={e2.id}", headers=headers)
    assert res_etapa.status_code == 200
    assert len(res_etapa.json()) == 1
    assert res_etapa.json()[0]["nome"] == "Turma Ativa E2"

    # Filtro por busca
    res_busca = client.get("/turmas?busca=Inativa", headers=headers)
    assert res_busca.status_code == 200
    assert len(res_busca.json()) == 1
    assert res_busca.json()[0]["nome"] == "Turma Inativa E1"


def test_inativar_turma_sucesso_e_preserva_vinculos_alunos(client, test_user, db_session):
    """Inativar turma muda somente o status; vínculos com alunos são preservados (RN12)."""
    headers = get_auth_headers(test_user)
    etapa = Etapa(nome="Etapa Matriz")
    db_session.add(etapa)
    db_session.commit()

    turma = Turma(nome="Turma Flores", id_etapa=etapa.id, status=StatusTurma.ATIVO)
    db_session.add(turma)
    db_session.commit()

    # Cria pessoa e responsável para o aluno
    pessoa = Pessoa(nome="Mãe Joana", cpf="12345678901", data_nasc=date(1990, 1, 1))
    db_session.add(pessoa)
    db_session.flush()

    resp = Responsavel(id_pessoa=pessoa.id, telefone="61999998888", email="mae@exemplo.com")
    db_session.add(resp)
    db_session.flush()

    aluno = Aluno(
        nome="Lucas Silva",
        data_nasc=date(2022, 5, 10),
        cpf="11122233344",
        sexo=Sexo.MASCULINO,
        raca=Raca.PARDO,
        nacionalidade="Brasileira",
        uf="DF",
        endereco="Rua 1",
        cidade="Brasília",
        cep="70000-000",
        status=StatusAluno.ATIVO,
        responsavel_id=resp.id,
        turma_id=turma.id,
    )
    db_session.add(aluno)
    db_session.commit()

    # Inativa turma via PATCH /turmas/{codigo}/status
    response = client.patch(f"/turmas/{turma.id}/status", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "INATIVO"
    assert data["quantidadeAlunos"] == 1

    # Verifica que no banco o status mudou para INATIVO
    db_session.expire_all()
    turma_db = db_session.query(Turma).filter(Turma.id == turma.id).first()
    assert turma_db.status == StatusTurma.INATIVO

    # RN12: O aluno continua com turma_id vinculado à turma inativada
    aluno_db = db_session.query(Aluno).filter(Aluno.id == aluno.id).first()
    assert aluno_db.turma_id == turma.id

    # Auditoria
    op = (
        db_session.query(Operacao)
        .filter(Operacao.tipo == Tipo.INATIVACAO_TURMA)
        .order_by(Operacao.id.desc())
        .first()
    )
    assert op is not None
    assert op.id_user == test_user.id
    assert f"ID {turma.id}" in op.descricao


def test_inativar_turma_endpoint_compatibilidade_frontend(client, test_user, db_session):
    """PATCH /turmas/{codigo}/inativar funciona com mesma lógica de status."""
    headers = get_auth_headers(test_user)
    etapa = Etapa(nome="Etapa Secundária")
    db_session.add(etapa)
    db_session.commit()

    turma = Turma(nome="Turma Ventos", id_etapa=etapa.id, status=StatusTurma.ATIVO)
    db_session.add(turma)
    db_session.commit()

    response = client.patch(f"/turmas/{turma.id}/inativar", headers=headers)
    assert response.status_code == 200
    assert response.json()["status"] == "INATIVO"


def test_inativar_turma_ja_inativa_retorna_409(client, test_user, db_session):
    """Inativar turma que já está com status inativo retorna 409 Conflict."""
    headers = get_auth_headers(test_user)
    etapa = Etapa(nome="Etapa Terceira")
    db_session.add(etapa)
    db_session.commit()

    turma = Turma(nome="Turma Chuva", id_etapa=etapa.id, status=StatusTurma.INATIVO)
    db_session.add(turma)
    db_session.commit()

    response = client.patch(f"/turmas/{turma.id}/status", headers=headers)
    assert response.status_code == 409
    assert "já está inativa" in response.json()["detail"].lower()


def test_inativar_turma_inexistente_retorna_404(client, test_user):
    """Tentativa de inativar turma inexistente retorna 404."""
    headers = get_auth_headers(test_user)
    response = client.patch("/turmas/99999/status", headers=headers)
    assert response.status_code == 404


def test_rotas_proibidas_fora_do_mvp_nao_existem(client, test_user, db_session):
    """
    Garante que nenhuma rota de exclusão, reativação ou inativação de etapa exista.
    """
    headers = get_auth_headers(test_user)
    etapa = Etapa(nome="Etapa Proibida")
    db_session.add(etapa)
    db_session.commit()
    turma = Turma(nome="Turma Proibida", id_etapa=etapa.id, status=StatusTurma.ATIVO)
    db_session.add(turma)
    db_session.commit()

    # Nenhuma exclusão física permitida
    assert client.delete(f"/turmas/{turma.id}", headers=headers).status_code in {404, 405}
    assert client.delete(f"/etapas/{etapa.id}", headers=headers).status_code in {404, 405}

    # Nenhuma reativação de turma permitida
    assert client.patch(f"/turmas/{turma.id}/reativar", headers=headers).status_code in {404, 405}

    # Nenhuma inativação de etapa permitida
    assert client.patch(f"/etapas/{etapa.id}/status", headers=headers).status_code in {404, 405}
    assert client.patch(f"/etapas/{etapa.id}/inativar", headers=headers).status_code in {404, 405}


def test_falha_de_banco_ao_cadastrar_etapa_retorna_503(client, test_user, db_session):
    """Falha de banco (FE06) retorna 503 e não persiste alterações ao cadastrar etapa."""
    headers = get_auth_headers(test_user)

    with patch("sqlalchemy.orm.Session.commit", side_effect=OperationalError("connection error", {}, None)):
        res_etapa = client.post("/etapas", json={"nome": "Etapa Nao Gravada"}, headers=headers)
        assert res_etapa.status_code == 503
        assert "Não foi possível conectar ao servidor" in res_etapa.json()["detail"]

    assert db_session.query(Etapa).filter(Etapa.nome == "Etapa Nao Gravada").first() is None


def test_falha_de_banco_ao_cadastrar_turma_retorna_503(client, test_user, db_session):
    """Falha de banco (FE06) retorna 503 e não persiste alterações ao cadastrar turma."""
    headers = get_auth_headers(test_user)
    etapa = Etapa(nome="Etapa Valida")
    db_session.add(etapa)
    db_session.commit()

    with patch("sqlalchemy.orm.Session.commit", side_effect=OperationalError("connection error", {}, None)):
        res_turma = client.post("/turmas", json={"nome": "Turma Nao Gravada", "id_etapa": etapa.id}, headers=headers)
        assert res_turma.status_code == 503
        assert "Não foi possível conectar ao servidor" in res_turma.json()["detail"]

    assert db_session.query(Turma).filter(Turma.nome == "Turma Nao Gravada").first() is None
