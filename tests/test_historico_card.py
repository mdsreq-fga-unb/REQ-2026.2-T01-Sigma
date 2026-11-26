"""Testes da consulta do histórico de edições do card do aluno (UC04 / FA04 / issue #109)."""
import logging
from datetime import timedelta
from unittest.mock import patch

import pytest
from sqlalchemy.exc import OperationalError

from app.core.tempo import agora_utc
from app.models.aluno import StatusAluno
from app.models.ops import Operacao, Tipo
from tests.fixtures_termos import CPF_VALIDO, cabecalhos, criar_aluno, criar_matricula, criar_usuario

FICHA_REQ = "Requerimento de matrícula"


def _url(id_aluno, **params) -> str:
    consulta = "&".join(f"{chave}={valor}" for chave, valor in params.items())
    return f"/alunos/{id_aluno}/historico" + (f"?{consulta}" if consulta else "")


def _item(campo: str, anterior="", novo="", *, ficha: str = FICHA_REQ, sensivel: bool = False) -> dict:
    return {"ficha": ficha, "campo": campo, "valor_anterior": anterior, "valor_novo": novo, "sensivel": sensivel}


def _operacao(db, aluno, usuario, tipo: Tipo, *, dias_atras: float = 0, alteracoes=None, descricao: str = "Resumo.") -> Operacao:
    operacao = Operacao(
        id_user=usuario.id,
        id_aluno=aluno.id,
        tipo=tipo,
        data_op=agora_utc() - timedelta(days=dias_atras),
        descricao=descricao,
        alteracoes=alteracoes or [],
    )
    db.add(operacao)
    db.commit()
    return operacao


def _linhas(resposta) -> list[tuple]:
    return [(i["ficha"], i["campo"], i["valor_anterior"], i["valor_novo"]) for i in resposta.json()["items"]]


@pytest.fixture
def aluno(db_session):
    return criar_aluno(db_session)


@pytest.fixture
def auth(test_user):
    return cabecalhos(test_user)


# Ordem e expansão (FA04 / RF17)

def test_uma_linha_por_campo_da_mais_recente_para_a_mais_antiga(client, db_session, test_user, aluno, auth):
    _operacao(db_session, aluno, test_user, Tipo.EDICAO_REQUERIMENTO, dias_atras=2,
              alteracoes=[_item("Telefone", "(61) 99999-0000", "(61) 98888-1111")])
    _operacao(db_session, aluno, test_user, Tipo.EDICAO_REQUERIMENTO, dias_atras=1,
              alteracoes=[_item("Nome do pai", "João", "José"), _item("Naturalidade", "", "Brasília")])

    res = client.get(_url(aluno.id), headers=auth)

    assert res.status_code == 200
    assert _linhas(res) == [
        (FICHA_REQ, "Nome do pai", "João", "José"),  # mesmo salvamento: ordem da tela
        (FICHA_REQ, "Naturalidade", "", "Brasília"),
        (FICHA_REQ, "Telefone", "(61) 99999-0000", "(61) 98888-1111"),
    ]
    itens = res.json()["items"]
    assert itens[0]["data_hora"] == itens[1]["data_hora"] != itens[2]["data_hora"]
    assert {(i["usuario_id"], i["usuario_nome"]) for i in itens} == {(test_user.id, test_user.nome)}
    assert res.json()["total"] == 3


def test_mesma_data_desempata_pela_operacao_mais_nova(client, db_session, test_user, aluno, auth):
    momento = agora_utc()
    # Gravadas fora da ordem dos ids, para o banco não acertar a ordem por acaso.
    for id_operacao, campo in ((9002, "Mais nova"), (9001, "Mais antiga")):
        db_session.add(Operacao(id=id_operacao, id_user=test_user.id, id_aluno=aluno.id, tipo=Tipo.EDICAO_REQUERIMENTO,
                                data_op=momento, descricao="x", alteracoes=[_item(campo)]))
        db_session.commit()

    assert [linha[1] for linha in _linhas(client.get(_url(aluno.id), headers=auth))] == ["Mais nova", "Mais antiga"]


def test_operacao_sem_itens_vira_uma_linha_com_o_resumo(client, db_session, test_user, aluno, auth):
    _operacao(db_session, aluno, test_user, Tipo.PREENCHIMENTO_TERMO_SAIDA,
              descricao="Termo de autorização de saída do aluno preenchido (ano letivo 2026).")

    [item] = client.get(_url(aluno.id), headers=auth).json()["items"]

    assert item["ficha"] == "Termo de autorização de saída do aluno"
    assert item["campo"] == "Termo de autorização de saída do aluno preenchido (ano letivo 2026)."
    assert (item["valor_anterior"], item["valor_novo"], item["sensivel"]) == (None, None, False)


def test_exportacao_de_pdf_e_consulta_nunca_aparecem(client, db_session, test_user, aluno, auth):
    _operacao(db_session, aluno, test_user, Tipo.EDICAO_REQUERIMENTO, dias_atras=1, alteracoes=[_item("Telefone", "1", "2")])
    _operacao(db_session, aluno, test_user, Tipo.EXPORTACAO_PDF, descricao="Requerimento exportado em PDF.")
    _operacao(db_session, aluno, test_user, Tipo.CONSULTA, descricao="Consulta.")

    res = client.get(_url(aluno.id), headers=auth)

    assert [linha[1] for linha in _linhas(res)] == ["Telefone"]
    assert res.json()["total"] == 1


def test_so_traz_o_historico_do_proprio_aluno(client, db_session, test_user, aluno, auth):
    outro = criar_aluno(db_session, nome="Outro Aluno")
    _operacao(db_session, outro, test_user, Tipo.EDICAO_REQUERIMENTO, alteracoes=[_item("Telefone", "1", "2")])

    res = client.get(_url(aluno.id), headers=auth)

    assert res.json()["items"] == [] and res.json()["usuarios"] == []


# LGPD (RNF01)

def test_campo_sensivel_sempre_sai_sem_valores(client, db_session, test_user, aluno, auth):
    _operacao(db_session, aluno, test_user, Tipo.EDICAO_REQUERIMENTO, alteracoes=[
        _item("Telefone", "(61) 99999-0000", "(61) 98888-1111"),
        _item("Saúde – alergias", sensivel=True),
        # Valor gravado por engano em campo sensível: a resposta não o devolve.
        _item("Responsável – CPF", CPF_VALIDO, "11144477735", sensivel=True),
    ])

    res = client.get(_url(aluno.id), headers=auth)

    assert _linhas(res) == [
        (FICHA_REQ, "Telefone", "(61) 99999-0000", "(61) 98888-1111"),
        (FICHA_REQ, "Saúde – alergias", None, None),
        (FICHA_REQ, "Responsável – CPF", None, None),
    ]
    assert [i["sensivel"] for i in res.json()["items"]] == [False, True, True]
    assert CPF_VALIDO not in res.text and "11144477735" not in res.text


def test_consulta_nao_registra_dados_no_log(client, db_session, test_user, aluno, auth, caplog):
    _operacao(db_session, aluno, test_user, Tipo.EDICAO_REQUERIMENTO, alteracoes=[_item("Telefone", "61999990000", "61988881111")])

    with caplog.at_level(logging.DEBUG):
        client.get(_url(aluno.id), headers=auth)

    assert "61999990000" not in caplog.text and "61988881111" not in caplog.text


# Filtros

@pytest.fixture
def historico_variado(db_session, test_user, aluno):
    """Operações de dois autores, em fichas e datas diferentes."""
    outra = criar_usuario(db_session, email="joana@estacaovida.org.br")
    outra.nome = "Joana Lima"
    db_session.commit()
    _operacao(db_session, aluno, test_user, Tipo.EDICAO_REQUERIMENTO, dias_atras=1, alteracoes=[_item("Req recente")])
    _operacao(db_session, aluno, outra, Tipo.EDICAO_TERMO_IMAGEM, dias_atras=10,
              alteracoes=[_item("Imagem", ficha="Termo de autorização de uso de imagem")])
    _operacao(db_session, aluno, test_user, Tipo.EDICAO_TERMO_COMPROMISSO, dias_atras=45,
              alteracoes=[_item("Compromisso", ficha="Termo de compromisso escolar")])
    _operacao(db_session, aluno, outra, Tipo.EDICAO_REQUERIMENTO, dias_atras=120, alteracoes=[_item("Req antigo")])
    _operacao(db_session, aluno, test_user, Tipo.MATRICULA, dias_atras=200,
              alteracoes=[_item("Aluno – nome", "", "Ana", ficha="Card do aluno")])
    return outra


@pytest.mark.parametrize(
    "params,campos",
    [
        ({}, ["Req recente", "Imagem"]),  # padrão: 30 dias
        ({"periodo": "7d"}, ["Req recente"]),
        ({"periodo": "30d"}, ["Req recente", "Imagem"]),
        ({"periodo": "90d"}, ["Req recente", "Imagem", "Compromisso"]),
        ({"periodo": "todos"}, ["Req recente", "Imagem", "Compromisso", "Req antigo", "Aluno – nome"]),
        ({"periodo": "todos", "ficha": "requerimento"}, ["Req recente", "Req antigo"]),
        ({"periodo": "todos", "ficha": "termo_compromisso"}, ["Compromisso"]),
        ({"periodo": "todos", "ficha": "card"}, ["Aluno – nome"]),
        ({"periodo": "todos", "ficha": "socioeconomica"}, []),
        ({"periodo": "todos", "ficha": "documentos"}, []),  # documentos ainda não gravam histórico
        ({"ficha": "requerimento"}, ["Req recente"]),  # combinado com o padrão de 30 dias
    ],
)
def test_filtros_de_periodo_e_ficha(client, aluno, auth, historico_variado, params, campos):
    res = client.get(_url(aluno.id, **params), headers=auth)

    assert res.status_code == 200
    assert [linha[1] for linha in _linhas(res)] == campos


def test_filtro_de_usuario_isolado_e_combinado(client, test_user, aluno, auth, historico_variado):
    da_joana = client.get(_url(aluno.id, usuario_id=historico_variado.id, periodo="todos"), headers=auth)
    da_joana_req = client.get(_url(aluno.id, usuario_id=historico_variado.id, periodo="todos", ficha="requerimento"), headers=auth)
    minhas_30d = client.get(_url(aluno.id, usuario_id=test_user.id), headers=auth)

    assert [linha[1] for linha in _linhas(da_joana)] == ["Imagem", "Req antigo"]
    assert [linha[1] for linha in _linhas(da_joana_req)] == ["Req antigo"]
    assert [linha[1] for linha in _linhas(minhas_30d)] == ["Req recente"]


def test_lista_de_usuarios_traz_todos_os_autores_mesmo_com_filtros(client, test_user, aluno, auth, historico_variado):
    esperado = sorted([{"id": test_user.id, "nome": test_user.nome}, {"id": historico_variado.id, "nome": "Joana Lima"}],
                      key=lambda u: u["nome"])

    for params in ({}, {"usuario_id": test_user.id, "periodo": "7d", "ficha": "requerimento"}):
        assert client.get(_url(aluno.id, **params), headers=auth).json()["usuarios"] == esperado


def test_autor_so_de_exportacao_nao_entra_na_lista(client, db_session, test_user, aluno, auth):
    so_exporta = criar_usuario(db_session, email="exporta@estacaovida.org.br")
    _operacao(db_session, aluno, so_exporta, Tipo.EXPORTACAO_PDF)
    _operacao(db_session, aluno, test_user, Tipo.EDICAO_REQUERIMENTO, alteracoes=[_item("Telefone")])

    assert client.get(_url(aluno.id), headers=auth).json()["usuarios"] == [{"id": test_user.id, "nome": test_user.nome}]


def test_usuario_sem_registros_devolve_lista_vazia(client, aluno, auth, historico_variado):
    res = client.get(_url(aluno.id, usuario_id=999999), headers=auth)

    assert res.status_code == 200 and res.json()["items"] == [] and res.json()["total"] == 0


# Paginação

def test_paginacao_conta_linhas_e_nao_salvamentos(client, db_session, test_user, aluno, auth):
    for n in range(5):  # 5 salvamentos de 5 campos = 25 linhas
        _operacao(db_session, aluno, test_user, Tipo.EDICAO_REQUERIMENTO, dias_atras=5 - n,
                  alteracoes=[_item(f"S{n}-C{c}") for c in range(5)])

    primeira = client.get(_url(aluno.id), headers=auth).json()
    terceira = client.get(_url(aluno.id, page=3), headers=auth).json()
    unica = client.get(_url(aluno.id, page_size=100), headers=auth).json()
    alem = client.get(_url(aluno.id, page=4), headers=auth).json()

    assert (primeira["total"], primeira["page"], primeira["page_size"], primeira["total_pages"]) == (25, 1, 10, 3)
    assert [i["campo"] for i in primeira["items"]] == [f"S4-C{c}" for c in range(5)] + [f"S3-C{c}" for c in range(5)]
    assert [i["campo"] for i in terceira["items"]] == [f"S0-C{c}" for c in range(5)]
    assert (len(unica["items"]), unica["total_pages"]) == (25, 1)
    assert alem["items"] == [] and alem["total"] == 25


def test_historico_vazio(client, aluno, auth):
    res = client.get(_url(aluno.id), headers=auth)

    assert res.status_code == 200
    assert res.json() == {"items": [], "total": 0, "page": 1, "page_size": 10, "total_pages": 0, "usuarios": []}


@pytest.mark.parametrize(
    "params",
    [
        {"page": 0}, {"page": "a"}, {"page_size": 0}, {"page_size": 101},
        {"periodo": "15d"}, {"periodo": "TODOS"}, {"ficha": "termo"}, {"ficha": "Requerimento"},
        {"usuario_id": 0}, {"usuario_id": "maria"},
    ],
)
def test_parametros_invalidos_retornam_422(client, aluno, auth, params):
    assert client.get(_url(aluno.id, **params), headers=auth).status_code == 422


# Card inativo, 404, autenticação, somente leitura

@pytest.mark.parametrize("status_aluno", list(StatusAluno))
def test_historico_disponivel_em_qualquer_status_do_card(client, db_session, test_user, aluno, auth, status_aluno):
    aluno.status = status_aluno
    db_session.commit()
    _operacao(db_session, aluno, test_user, Tipo.EDICAO_REQUERIMENTO, alteracoes=[_item("Telefone")])

    res = client.get(_url(aluno.id), headers=auth)

    assert res.status_code == 200 and res.json()["total"] == 1


@pytest.mark.parametrize("id_aluno", [999999, 2**31, 0])
def test_aluno_inexistente_retorna_404(client, auth, id_aluno):
    res = client.get(_url(id_aluno), headers=auth)

    assert res.status_code == 404 and res.json()["detail"] == "Aluno não encontrado."


def test_exige_token_e_conta_ativa(client, inactive_user, aluno):
    assert client.get(_url(aluno.id)).status_code == 401
    assert client.get(_url(aluno.id), headers=cabecalhos(inactive_user)).status_code == 403


@pytest.mark.parametrize("metodo", ["post", "put", "patch", "delete"])
def test_historico_e_somente_leitura(client, aluno, auth, metodo):
    assert client.request(metodo, _url(aluno.id), headers=auth).status_code == 405


def test_falha_de_banco_retorna_503(client, aluno, auth):
    with patch("app.repository.repository_historico.buscar_operacoes",
               side_effect=OperationalError("connection error", {}, None)):
        assert client.get(_url(aluno.id), headers=auth).status_code == 503


# Integração com as fichas e com a visão geral

def test_edicao_real_de_termo_aparece_e_bate_com_a_ultima_edicao(client, db_session, test_user, auth):
    matricula = criar_matricula(db_session)
    corpo = {"nome_responsavel": "Maria Souza", "cpf_responsavel": CPF_VALIDO, "modalidade": "CRECHE",
             "regime": "TEMPO_INTEGRAL", "assinatura": False}
    url_termo = f"/matriculas/{matricula.id}/termo-compromisso"
    assert client.put(url_termo, json=corpo, headers=auth).status_code == 200
    assert client.put(url_termo, json=corpo | {"nome_responsavel": "Joana Souza", "cpf_responsavel": "11144477735"},
                      headers=auth).status_code == 200
    client.get(url_termo + "/pdf", headers=auth)  # exportação (ou falha sem Pango): nunca entra no histórico

    res = client.get(_url(matricula.id_aluno), headers=auth)

    ficha = "Termo de compromisso escolar"
    assert _linhas(res) == [
        (ficha, "Responsável – nome", "Maria Souza", "Joana Souza"),
        (ficha, "Responsável – CPF", None, None),
        (ficha, "Termo de compromisso escolar preenchido (ano letivo 2026).", None, None),
    ]
    assert CPF_VALIDO not in res.text and "11144477735" not in res.text
    # "Última edição" da visão geral = primeira linha do histórico.
    visao_geral = client.get(f"/alunos/{matricula.id_aluno}", headers=auth)
    assert visao_geral.status_code == 200  # com o termo preenchido (modalidade e regime em enum)
    ultima = visao_geral.json()["ultima_edicao"]
    primeira = res.json()["items"][0]
    assert (ultima["data"], ultima["autor"]) == (primeira["data_hora"], primeira["usuario_nome"])


def test_ultima_edicao_ignora_consulta(client, db_session, test_user, aluno, auth):
    from app.repository import repository_aluno

    _operacao(db_session, aluno, test_user, Tipo.EDICAO_REQUERIMENTO, dias_atras=1, alteracoes=[_item("Telefone")])
    _operacao(db_session, aluno, test_user, Tipo.CONSULTA)

    operacao, _ = repository_aluno.buscar_ultima_edicao(db_session, aluno.id)

    assert operacao.tipo == Tipo.EDICAO_REQUERIMENTO
