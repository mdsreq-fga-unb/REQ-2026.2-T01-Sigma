"""Testes do cadastro do card do aluno, visão geral e ativação da matrícula (UC04 / issue #108)."""
from datetime import date, timedelta
from decimal import Decimal
from unittest.mock import patch

import pytest
from sqlalchemy.exc import OperationalError

from app.core.tempo import agora_utc, hoje_sao_paulo
from app.models.aluno import Aluno, Raca, Sexo, StatusAluno
from app.models.documento import TipoDocumento
from app.models.etapa import Etapa
from app.models.familiar import Familiar
from app.models.ficha_socioeco import FichaSocioeconomica, MeioTransporte, SituacaoMoradia
from app.models.matricula import Matricula
from app.models.ops import Operacao, Tipo
from app.models.pessoa import Pessoa
from app.models.requerimento_matricula import RequerimentoMatricula
from app.models.responsavel import Responsavel
from app.models.termo_comp import ModalidadeEnsino, RegimeAtendimento, TermoCompromisso
from app.models.termo_imagem import TermoImagem
from app.models.termo_saida import FormaSaida, TermoSaida
from app.models.turma import StatusTurma, Turma, Turno
from tests.fixtures_termos import (  # noqa: F401
    CPF_VALIDO,
    OUTRO_CPF_VALIDO,
    auth_real,
    auth_termos,
    cabecalhos,
    client_real,
    db_real,
)

TERCEIRO_CPF_VALIDO = "12345678909"
QUARTO_CPF_VALIDO = "98765432100"
NIS_VALIDO = "12345678901"
OUTRO_NIS = "10987654321"
AMANHA = (hoje_sao_paulo() + timedelta(days=1)).isoformat()


def _criar_etapa(db, nome: str = "Maternal I") -> Etapa:
    etapa = Etapa(nome=nome)
    db.add(etapa)
    db.commit()
    db.refresh(etapa)
    return etapa


def _payload_minimo(id_etapa: int) -> dict:
    return {
        "aluno": {
            "nome": "Ana Beatriz de Souza",
            "data_nasc": "2022-05-10",
            "sexo": "FEMININO",
            "cpf": CPF_VALIDO,
            "uf": "DF",
            "nacionalidade": "Brasileira",
        },
        "responsavel": {
            "nome": "Maria das Graças Souza",
            "parentesco": "Mãe",
        },
        "matricula": {
            "id_etapa": id_etapa,
            "ano": 2026,
            "data_matricula": "2026-02-02",
        },
    }


def _payload_completo(id_etapa: int) -> dict:
    dados = _payload_minimo(id_etapa)
    dados["aluno"].update({
        "nis": NIS_VALIDO,
        "naturalidade": "Brasília",
        "raca": "PARDO",
    })
    dados["responsavel"].update({
        "cpf": OUTRO_CPF_VALIDO,
        "telefone": "61999998888",
    })
    return dados


def _preencher_todas_fichas(db, matricula: Matricula) -> None:
    """Preenche as 5 fichas obrigatórias de forma completa para testar RN03."""
    aluno = matricula.aluno
    aluno.naturalidade = "Brasília"
    aluno.uf = "DF"
    aluno.nacionalidade = "Brasileira"
    aluno.raca = Raca.PARDO
    aluno.logradouro = "Rua das Flores"
    aluno.numero = "10"
    aluno.bairro = "Centro"
    aluno.cidade = "Águas Lindas de Goiás"
    aluno.uf_residencia = "GO"
    aluno.cep = "72910000"

    req = RequerimentoMatricula(
        id_matricula=matricula.id,
        telefone_requerimento="61988887777",
        documentos_entregues=[
            TipoDocumento.CERTIDAO_NASCIMENTO.value,
            TipoDocumento.FOTO_3X4.value,
        ],
    )
    socio = FichaSocioeconomica(
        id_matricula=matricula.id,
        moradia=SituacaoMoradia.PROPRIO,
        valor=Decimal("0.00"),
        transporte=MeioTransporte.A_PE if hasattr(MeioTransporte, "A_PE") else MeioTransporte.NENHUM_A_PE_BICICLETA,
        possui_outras_propriedades=False,
        telefone_contato="6133334444",
        celular="61999998888",
        declaracao_nome="Maria das Graças Souza",
        declaracao_local="Águas Lindas de Goiás",
        declaracao_data=date(2026, 2, 2),
    )
    imagem = TermoImagem(
        id_matricula=matricula.id,
        autorizacao=True,
        resp_nome="Maria das Graças Souza",
        resp_nacionalidade="Brasileira",
        resp_estado_civil="Solteira",
        resp_rg="1234567",
        resp_cpf=OUTRO_CPF_VALIDO,
        residente_em="Rua das Flores, nº 10",
        local="Águas Lindas de Goiás",
        data=date(2026, 2, 2),
    )
    saida = TermoSaida(
        id_matricula=matricula.id,
        tipo_saida=FormaSaida.RESPONSAVEIS,
        resp_nome="Maria das Graças Souza",
        periodo="Integral",
        data=date(2026, 2, 2),
    )
    comp = TermoCompromisso(
        id_matricula=matricula.id,
        nome_responsavel="Maria das Graças Souza",
        cpf_responsavel=OUTRO_CPF_VALIDO,
        modalidade=ModalidadeEnsino.CRECHE,
        regime=RegimeAtendimento.TEMPO_INTEGRAL,
        assinatura=True,
        data_assinatura=date(2026, 2, 2),
    )
    db.add_all([req, socio, imagem, saida, comp])
    db.flush()
    familiar = Familiar(
        id_fs=socio.id,
        tipo="Mãe",
        profissao="Autônoma",
        idade=32,
        estado_civil="Solteira",
        escolaridade="Ensino Médio",
        renda_mensal=Decimal("1500.00"),
    )
    db.add(familiar)
    db.commit()


# ---------------------------------------------------------------------------
# Autenticação (RNF02)
# ---------------------------------------------------------------------------


@pytest.mark.parametrize("metodo,url", [("post", "/alunos"), ("get", "/alunos/1")])
def test_rotas_exigem_autenticacao(client, metodo, url):
    resposta = getattr(client, metodo)(url)
    assert resposta.status_code == 401


def test_usuario_inativo_recebe_403(client, inactive_user):
    etapa = _criar_etapa(client.app.dependency_overrides[list(client.app.dependency_overrides)[0]] if False else None) if False else None
    resposta = client.get("/alunos/1", headers=cabecalhos(inactive_user))
    assert resposta.status_code == 403


# ---------------------------------------------------------------------------
# Cadastro do card (POST /alunos)
# ---------------------------------------------------------------------------


def test_criar_card_minimo_retorna_201_e_pendente(client, db_session, test_user):
    etapa = _criar_etapa(db_session)
    resposta = client.post(
        "/alunos",
        json=_payload_minimo(etapa.id),
        headers=cabecalhos(test_user),
    )
    assert resposta.status_code == 201
    corpo = resposta.json()
    assert corpo["id_aluno"] > 0
    assert corpo["id_matricula"] > 0
    assert corpo["nome"] == "Ana Beatriz de Souza"
    assert corpo["status"] == "PENDENTE"
    assert corpo["etapa"] == {"id": etapa.id, "nome": "Maternal I"}
    assert corpo["turma"] is None
    assert corpo["ano_letivo"] == 2026
    assert corpo["fichas"] == {
        "requerimento": {"completa": False},
        "socioeconomica": {"completa": False},
        "termo_imagem": {"completa": False},
        "termo_saida": {"completa": False},
        "termo_compromisso": {"completa": False},
    }
    assert corpo["resumo"]["responsavel"]["nome"] == "Maria das Graças Souza"
    assert corpo["resumo"]["responsavel"]["parentesco"] == "Mãe"
    assert corpo["documentos"]["entregues"] == 0
    assert corpo["documentos"]["total"] == 5
    assert corpo["ultima_edicao"]["autor"] == test_user.nome

    # Verifica registros no banco e LGPD no histórico (RNF01)
    op = db_session.query(Operacao).filter(Operacao.id_aluno == corpo["id_aluno"]).one()
    assert op.tipo == Tipo.MATRICULA
    por_campo = {a["campo"]: a for a in op.alteracoes}
    assert por_campo["CPF do aluno"]["sensivel"] is True
    assert por_campo["CPF do aluno"]["valor_novo"] == ""
    assert por_campo["Cor/raça"]["sensivel"] is True
    assert por_campo["Cor/raça"]["valor_novo"] == ""


def test_criar_card_completo_e_reaproveitar_responsavel_por_cpf(client, db_session, test_user):
    etapa = _criar_etapa(db_session)
    resp1 = client.post("/alunos", json=_payload_completo(etapa.id), headers=cabecalhos(test_user))
    assert resp1.status_code == 201

    # Segundo aluno (irmão) com mesmo CPF do responsável -> reaproveita responsável
    segundo = _payload_minimo(etapa.id)
    segundo["aluno"]["nome"] = "Pedro Lucas de Souza"
    segundo["aluno"]["sexo"] = "MASCULINO"
    segundo["aluno"]["cpf"] = TERCEIRO_CPF_VALIDO
    segundo["responsavel"]["cpf"] = OUTRO_CPF_VALIDO
    resp2 = client.post("/alunos", json=segundo, headers=cabecalhos(test_user))
    assert resp2.status_code == 201

    alunos = db_session.query(Aluno).order_by(Aluno.id).all()
    assert len(alunos) == 2
    assert alunos[0].responsavel_id == alunos[1].responsavel_id
    assert db_session.query(Responsavel).count() == 1


def test_criar_card_recusa_id_na_entrada(client, db_session, test_user):
    etapa = _criar_etapa(db_session)
    payload = _payload_minimo(etapa.id)
    payload["aluno"]["id"] = 999
    resp = client.post("/alunos", json=payload, headers=cabecalhos(test_user))
    assert resp.status_code == 422


def test_criar_card_lista_todos_campos_faltantes_e_invalidos(client, db_session, test_user):
    resp = client.post(
        "/alunos",
        json={
            "aluno": {"cpf": "11111111111", "data_nasc": AMANHA, "nis": "123", "uf": "XX"},
            "responsavel": {"cpf": "00000000000", "telefone": "123"},
            "matricula": {"ano": 1990},
        },
        headers=cabecalhos(test_user),
    )
    assert resp.status_code == 422
    locs = {tuple(e["loc"]) for e in resp.json()["detail"]}
    assert ("body", "aluno", "nome") in locs
    assert ("body", "aluno", "sexo") in locs
    assert ("body", "aluno", "cpf") in locs
    assert ("body", "aluno", "data_nasc") in locs
    assert ("body", "aluno", "nis") in locs
    assert ("body", "aluno", "uf") in locs
    assert ("body", "aluno", "nacionalidade") in locs
    assert ("body", "responsavel", "nome") in locs
    assert ("body", "responsavel", "parentesco") in locs
    assert ("body", "responsavel", "cpf") in locs
    assert ("body", "responsavel", "telefone") in locs
    assert ("body", "matricula", "id_etapa") in locs
    assert ("body", "matricula", "ano") in locs
    assert ("body", "matricula", "data_matricula") in locs


def test_criar_card_duplicidade_cpf_e_nis_retorna_409(client_real, db_real, auth_real):
    etapa_id = _criar_etapa(db_real).id
    assert client_real.post("/alunos", json=_payload_completo(etapa_id), headers=auth_real).status_code == 201

    # Mesmo CPF de aluno
    dup_cpf = _payload_minimo(etapa_id)
    resp_cpf = client_real.post("/alunos", json=dup_cpf, headers=auth_real)
    assert resp_cpf.status_code == 409
    assert "CPF" in resp_cpf.json()["detail"]

    # Mesmo NIS de aluno
    dup_nis = _payload_minimo(etapa_id)
    dup_nis["aluno"]["cpf"] = TERCEIRO_CPF_VALIDO
    dup_nis["aluno"]["nis"] = NIS_VALIDO
    resp_nis = client_real.post("/alunos", json=dup_nis, headers=auth_real)
    assert resp_nis.status_code == 409
    assert "NIS" in resp_nis.json()["detail"]


def test_criar_card_etapa_inexistente_retorna_404(client, test_user):
    resp = client.post("/alunos", json=_payload_minimo(999999), headers=cabecalhos(test_user))
    assert resp.status_code == 404


# ---------------------------------------------------------------------------
# Visão geral e regra de ativação (GET /alunos/{id_aluno}, RN02, RN03, RN10)
# ---------------------------------------------------------------------------


def test_visao_geral_aluno_inexistente_retorna_404(client, test_user):
    resp = client.get("/alunos/999999", headers=cabecalhos(test_user))
    assert resp.status_code == 404


def test_ativacao_matricula_exige_5_fichas_e_turma_ativa_mesma_etapa(client, db_session, test_user):
    etapa1 = _criar_etapa(db_session, "Maternal I")
    etapa2 = _criar_etapa(db_session, "Maternal II")

    resp = client.post("/alunos", json=_payload_minimo(etapa1.id), headers=cabecalhos(test_user))
    assert resp.status_code == 201
    id_aluno = resp.json()["id_aluno"]
    id_matricula = resp.json()["id_matricula"]

    matricula = db_session.get(Matricula, id_matricula)
    _preencher_todas_fichas(db_session, matricula)

    # Todas as 5 fichas completas, mas sem turma -> ainda PENDENTE
    vg_sem_turma = client.get(f"/alunos/{id_aluno}", headers=cabecalhos(test_user)).json()
    assert all(f["completa"] for f in vg_sem_turma["fichas"].values())
    assert vg_sem_turma["status"] == "PENDENTE"
    assert vg_sem_turma["documentos"]["entregues"] == 2
    assert vg_sem_turma["documentos"]["total"] == 5

    # Turma de outra etapa -> continua PENDENTE (RN02)
    turma_outra = Turma(nome="Turma B", turno=Turno.MANHA, status=StatusTurma.ATIVO, id_etapa=etapa2.id)
    db_session.add(turma_outra)
    db_session.flush()
    matricula.aluno.turma_id = turma_outra.id
    db_session.commit()
    assert client.get(f"/alunos/{id_aluno}", headers=cabecalhos(test_user)).json()["status"] == "PENDENTE"

    # Turma da mesma etapa, porém INATIVA -> continua PENDENTE (RN02)
    turma_inativa = Turma(nome="Turma C", turno=Turno.TARDE, status=StatusTurma.INATIVO, id_etapa=etapa1.id)
    db_session.add(turma_inativa)
    db_session.flush()
    matricula.aluno.turma_id = turma_inativa.id
    db_session.commit()
    assert client.get(f"/alunos/{id_aluno}", headers=cabecalhos(test_user)).json()["status"] == "PENDENTE"

    # Turma ATIVA da mesma etapa -> ATIVO (RN03)
    turma_ok = Turma(nome="Turma A", turno=Turno.INTEGRAL, status=StatusTurma.ATIVO, id_etapa=etapa1.id)
    db_session.add(turma_ok)
    db_session.flush()
    matricula.aluno.turma_id = turma_ok.id
    db_session.commit()

    vg_ativo = client.get(f"/alunos/{id_aluno}", headers=cabecalhos(test_user)).json()
    assert vg_ativo["status"] == "ATIVO"
    assert vg_ativo["turma"]["nome"] == "Turma A"
    assert vg_ativo["resumo"]["turma_etapa"] == {"etapa": "Maternal I", "turma": "Turma A"}
    assert vg_ativo["resumo"]["telefone"] == "61988887777"
    assert "Rua das Flores" in vg_ativo["resumo"]["endereco"]


def test_ultima_edicao_ignora_exportacao_pdf(client, db_session, test_user):
    etapa = _criar_etapa(db_session)
    resp = client.post("/alunos", json=_payload_minimo(etapa.id), headers=cabecalhos(test_user))
    id_aluno = resp.json()["id_aluno"]

    op_pdf = Operacao(
        id_user=test_user.id,
        id_aluno=id_aluno,
        tipo=Tipo.EXPORTACAO_PDF,
        data_op=agora_utc() + timedelta(minutes=5),
        descricao="Exportou PDF",
    )
    db_session.add(op_pdf)
    db_session.commit()

    vg = client.get(f"/alunos/{id_aluno}", headers=cabecalhos(test_user)).json()
    assert vg["ultima_edicao"]["autor"] == test_user.nome


def test_card_inativo_consultavel_e_bloqueia_edicao_fichas(client, db_session, test_user):
    etapa = _criar_etapa(db_session)
    resp = client.post("/alunos", json=_payload_minimo(etapa.id), headers=cabecalhos(test_user))
    id_aluno = resp.json()["id_aluno"]
    id_matricula = resp.json()["id_matricula"]

    aluno = db_session.get(Aluno, id_aluno)
    aluno.status = StatusAluno.INATIVO
    db_session.commit()

    # GET continua acessível (RN10 / FE03)
    vg = client.get(f"/alunos/{id_aluno}", headers=cabecalhos(test_user))
    assert vg.status_code == 200
    assert vg.json()["status"] == "INATIVO"

    # Edição de ficha é bloqueada (409)
    resp_edit = client.put(
        f"/matriculas/{id_matricula}/termo-imagem",
        json={
            "responsavel": {
                "nome": "Maria das Graças Souza",
                "nacionalidade": "Brasileira",
                "estado_civil": "Solteira",
                "rg": "1234567",
                "cpf": OUTRO_CPF_VALIDO,
                "residente_em": "Rua das Flores, 10",
            },
            "autorizacao": {
                "autoriza": True,
                "local": "Águas Lindas de Goiás",
                "data": "2026-02-02",
            },
        },
        headers=cabecalhos(test_user),
    )
    assert resp_edit.status_code == 409


# ---------------------------------------------------------------------------
# Transação atômica e falha de banco (FE04)
# ---------------------------------------------------------------------------


def test_falha_no_meio_do_salvamento_faz_rollback_e_retorna_503(client_real, db_real, auth_real):
    etapa = _criar_etapa(db_real)
    with patch("app.services.service_historico.registrar", side_effect=OperationalError("stmt", {}, Exception("queda"))):
        resp = client_real.post(
            "/alunos",
            json=_payload_minimo(etapa.id),
            headers=auth_real,
        )
    assert resp.status_code == 503
    assert db_real.query(Aluno).count() == 0
    assert db_real.query(Matricula).count() == 0
    assert db_real.query(Responsavel).count() == 0
    assert db_real.query(Pessoa).count() == 0
