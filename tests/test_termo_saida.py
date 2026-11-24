"""Testes do Termo de autorização de saída do aluno (UC04 / issue #92)."""
import logging
import time
from datetime import timedelta
from unittest.mock import patch

import pytest
from sqlalchemy.exc import OperationalError, SQLAlchemyError

from app.core.config import settings
from app.core.tempo import hoje_sao_paulo
from app.models.ops import Operacao, Tipo
from app.models.pessoas_a import PessoaAutorizada
from app.models.termo_saida import FormaSaida, TermoSaida
from app.schemas.termo_saida import TermoSaidaResponse
from app.services import service_termo_saida
from tests.fixtures_termos import (  # noqa: F401  (fixtures importadas de propósito)
    auth_real,
    auth_termos,
    cabecalhos,
    client_real,
    criar_aluno,
    criar_matricula,
    db_real,
    matricula_real,
    matricula_termos,
    normalizar,
    pular_sem_pdf,
    texto_do_pdf,
)

ONTEM = (hoje_sao_paulo() - timedelta(days=1)).isoformat()
DEPOIS_DE_AMANHA = (hoje_sao_paulo() + timedelta(days=2)).isoformat()

ROTAS_DO_TERMO = [
    ("get", "/matriculas/1/termo-saida"),
    ("put", "/matriculas/1/termo-saida"),
    ("get", "/matriculas/1/termo-saida/pdf"),
]


def _url(matricula, sufixo: str = "") -> str:
    return f"/matriculas/{matricula.id}/termo-saida{sufixo}"


def pessoa(nome: str = "João Carlos de Souza", parentesco: str = "Avô", id: int | None = None) -> dict:
    dados = {"nome": nome, "parentesco": parentesco}
    if id is not None:
        dados["id"] = id
    return dados


def corpo(
    responsavel: dict | None = None,
    saida: dict | None = None,
    pessoas: list[dict] | None = None,
    **raiz,
) -> dict:
    """Corpo completo e válido do PUT (saída com os responsáveis, sem pessoas autorizadas)."""
    dados = {
        "responsavel": {"nome": "Maria das Graças Souza"},
        "periodo": "Integral",
        "saida": {"forma_saida": "RESPONSAVEIS", "descricao_outros": None},
        "pessoas_autorizadas": pessoas if pessoas is not None else [],
        "data": ONTEM,
    }
    dados["responsavel"].update(responsavel or {})
    dados["saida"].update(saida or {})
    dados.update(raiz)
    return dados


def _campos_com_erro(resposta) -> set[tuple]:
    """Posição de cada campo recusado no corpo (sem o prefixo "body")."""
    return {tuple(erro["loc"][1:]) for erro in resposta.json()["detail"]}


def _pessoas_do_banco(db, termo_id: int | None = None) -> list[PessoaAutorizada]:
    consulta = db.query(PessoaAutorizada)
    if termo_id is not None:
        consulta = consulta.filter(PessoaAutorizada.id_termo_saida == termo_id)
    return consulta.order_by(PessoaAutorizada.id).all()


def _operacoes(db, tipo: Tipo) -> list[Operacao]:
    return db.query(Operacao).filter(Operacao.tipo == tipo).order_by(Operacao.id).all()


# GET

def test_get_sem_termo_devolve_aluno_local_da_configuracao_e_completa_falso(
    client, db_session, matricula_termos, auth_termos
):
    res = client.get(_url(matricula_termos), headers=auth_termos)

    assert res.status_code == 200
    dados = res.json()
    assert dados["aluno"] == {
        "nome": "Ana Beatriz de Souza",
        "data_nascimento": "2022-05-10",
        "etapa": "Maternal I",
        "ano_letivo": 2026,
    }
    assert dados["local"] == settings.local_termo_saida == "Águas Lindas de Goiás"
    assert dados["responsavel"] == {"nome": None}
    assert dados["periodo"] is None
    assert dados["saida"] == {"forma_saida": None, "descricao_outros": None}
    assert dados["pessoas_autorizadas"] == []
    assert dados["data"] is None
    assert dados["completa"] is False
    assert dados["created_at"] is None and dados["updated_at"] is None
    # Consultar não grava nada.
    assert db_session.query(TermoSaida).count() == 0
    assert db_session.query(Operacao).count() == 0


def test_local_vem_da_configuracao_a_cada_requisicao(client, matricula_termos, auth_termos, monkeypatch):
    monkeypatch.setattr(settings, "local_termo_saida", "Brasília")

    res = client.get(_url(matricula_termos), headers=auth_termos)

    assert res.json()["local"] == "Brasília"


def test_get_devolve_o_termo_salvo_com_as_pessoas(client, matricula_termos, auth_termos):
    client.put(
        _url(matricula_termos),
        json=corpo(saida={"forma_saida": "TRANSPORTE_ESCOLAR"}, pessoas=[pessoa(), pessoa("Luiza Pereira", "Tia")]),
        headers=auth_termos,
    )

    dados = client.get(_url(matricula_termos), headers=auth_termos).json()

    assert dados["responsavel"]["nome"] == "Maria das Graças Souza"
    assert dados["periodo"] == "Integral"
    assert dados["saida"]["forma_saida"] == "TRANSPORTE_ESCOLAR"
    assert [(p["nome"], p["parentesco"]) for p in dados["pessoas_autorizadas"]] == [
        ("João Carlos de Souza", "Avô"),
        ("Luiza Pereira", "Tia"),
    ]
    assert all(isinstance(p["id"], int) for p in dados["pessoas_autorizadas"])
    assert dados["completa"] is True


# PUT – criação, atualização e obrigatórios (FE01)

def test_put_cria_o_termo(client, db_session, matricula_termos, auth_termos):
    res = client.put(_url(matricula_termos), json=corpo(), headers=auth_termos)

    assert res.status_code == 200
    dados = res.json()
    assert dados["completa"] is True
    assert dados["created_at"] is not None and dados["updated_at"] is not None
    termo = db_session.query(TermoSaida).one()
    assert termo.id_matricula == matricula_termos.id
    assert termo.resp_nome == "Maria das Graças Souza"
    assert termo.tipo_saida == FormaSaida.RESPONSAVEIS
    assert termo.periodo == "Integral"
    assert termo.data.isoformat() == ONTEM


def test_segundo_put_atualiza_o_mesmo_termo(client, db_session, matricula_termos, auth_termos):
    client.put(_url(matricula_termos), json=corpo(), headers=auth_termos)

    res = client.put(
        _url(matricula_termos),
        json=corpo(responsavel={"nome": "Joana Souza"}, periodo="Manhã"),
        headers=auth_termos,
    )

    assert res.status_code == 200
    assert res.json()["responsavel"]["nome"] == "Joana Souza"
    termo = db_session.query(TermoSaida).one()  # continua um só
    assert termo.resp_nome == "Joana Souza" and termo.periodo == "Manhã"


def test_put_nao_altera_o_local_mesmo_que_o_frontend_envie_um_valor(client, matricula_termos, auth_termos):
    res = client.put(_url(matricula_termos), json=corpo(local="Outro lugar qualquer"), headers=auth_termos)

    assert res.status_code == 200
    assert res.json()["local"] == "Águas Lindas de Goiás"
    assert client.get(_url(matricula_termos), headers=auth_termos).json()["local"] == "Águas Lindas de Goiás"


def test_put_vazio_lista_todos_os_campos_faltantes(client, matricula_termos, auth_termos):
    res = client.put(_url(matricula_termos), json={}, headers=auth_termos)

    assert res.status_code == 422
    erros = res.json()["detail"]
    assert _campos_com_erro(res) == {("responsavel", "nome"), ("saida", "forma_saida"), ("data",)}
    assert all(erro["type"] == "campo_obrigatorio" for erro in erros)
    mensagens = " | ".join(erro["msg"] for erro in erros)
    for nome_do_campo in ("Responsável legal – nome", "Forma de saída", "Data"):
        assert nome_do_campo in mensagens


def test_periodo_nao_e_obrigatorio(client, matricula_termos, auth_termos):
    res = client.put(_url(matricula_termos), json=corpo(periodo=None), headers=auth_termos)

    assert res.status_code == 200
    assert res.json()["periodo"] is None
    assert res.json()["completa"] is True


def test_forma_de_saida_invalida_retorna_422(client, matricula_termos, auth_termos):
    res = client.put(_url(matricula_termos), json=corpo(saida={"forma_saida": "VOANDO"}), headers=auth_termos)

    assert res.status_code == 422
    assert _campos_com_erro(res) == {("saida", "forma_saida")}
    assert "RESPONSAVEIS, TRANSPORTE_ESCOLAR, OUTROS" in res.json()["detail"][0]["msg"]


@pytest.mark.parametrize("forma", ["TRANSPORTE_ESCOLAR", "OUTROS"])
def test_transporte_escolar_e_outros_sem_pessoas_retornam_422(client, db_session, matricula_termos, auth_termos, forma):
    res = client.put(
        _url(matricula_termos),
        json=corpo(saida={"forma_saida": forma, "descricao_outros": "Vizinha"}, pessoas=[]),
        headers=auth_termos,
    )

    assert res.status_code == 422
    assert _campos_com_erro(res) == {("pessoas_autorizadas",)}
    assert "ao menos uma pessoa" in res.json()["detail"][0]["msg"]
    assert db_session.query(TermoSaida).count() == 0


def test_responsaveis_sem_pessoas_e_aceito(client, matricula_termos, auth_termos):
    res = client.put(_url(matricula_termos), json=corpo(saida={"forma_saida": "RESPONSAVEIS"}), headers=auth_termos)

    assert res.status_code == 200
    assert res.json()["pessoas_autorizadas"] == []
    assert res.json()["completa"] is True


def test_outros_sem_descricao_retorna_422(client, matricula_termos, auth_termos):
    res = client.put(
        _url(matricula_termos),
        json=corpo(saida={"forma_saida": "OUTROS", "descricao_outros": "   "}, pessoas=[pessoa()]),
        headers=auth_termos,
    )

    assert res.status_code == 422
    assert _campos_com_erro(res) == {("saida", "descricao_outros")}
    assert "descrição de “Outros”" in res.json()["detail"][0]["msg"]


def test_outros_com_descricao_e_salvo(client, db_session, matricula_termos, auth_termos):
    res = client.put(
        _url(matricula_termos),
        json=corpo(saida={"forma_saida": "OUTROS", "descricao_outros": "Vizinha, quando o transporte atrasar"}, pessoas=[pessoa()]),
        headers=auth_termos,
    )

    assert res.status_code == 200
    assert res.json()["saida"] == {
        "forma_saida": "OUTROS",
        "descricao_outros": "Vizinha, quando o transporte atrasar",
    }
    assert db_session.query(TermoSaida).one().descricao_outros == "Vizinha, quando o transporte atrasar"


@pytest.mark.parametrize("forma,pessoas", [("RESPONSAVEIS", []), ("TRANSPORTE_ESCOLAR", [pessoa()])])
def test_descricao_de_outros_e_descartada_nas_outras_formas(client, db_session, matricula_termos, auth_termos, forma, pessoas):
    # Mesmo uma descrição acima do limite é descartada, porque não vale para esta forma.
    res = client.put(
        _url(matricula_termos),
        json=corpo(saida={"forma_saida": forma, "descricao_outros": "x" * 500}, pessoas=pessoas),
        headers=auth_termos,
    )

    assert res.status_code == 200
    assert res.json()["saida"]["descricao_outros"] is None
    assert db_session.query(TermoSaida).one().descricao_outros is None


def test_trocar_de_outros_para_outra_forma_limpa_a_descricao(client, db_session, matricula_termos, auth_termos):
    client.put(
        _url(matricula_termos),
        json=corpo(saida={"forma_saida": "OUTROS", "descricao_outros": "Vizinha"}, pessoas=[pessoa()]),
        headers=auth_termos,
    )

    res = client.put(
        _url(matricula_termos),
        json=corpo(saida={"forma_saida": "RESPONSAVEIS", "descricao_outros": "Vizinha"}),
        headers=auth_termos,
    )

    assert res.status_code == 200
    assert res.json()["saida"] == {"forma_saida": "RESPONSAVEIS", "descricao_outros": None}
    assert db_session.query(TermoSaida).one().descricao_outros is None


def test_descricao_de_outros_maior_que_a_coluna_retorna_422(client, matricula_termos, auth_termos):
    res = client.put(
        _url(matricula_termos),
        json=corpo(saida={"forma_saida": "OUTROS", "descricao_outros": "x" * 301}, pessoas=[pessoa()]),
        headers=auth_termos,
    )

    assert res.status_code == 422
    assert _campos_com_erro(res) == {("saida", "descricao_outros")}


def test_periodo_aceita_texto_livre_ate_o_limite(client, matricula_termos, auth_termos):
    texto_livre = "Integral, com saída às 15h nas sextas-feiras"
    assert client.put(_url(matricula_termos), json=corpo(periodo=texto_livre), headers=auth_termos).status_code == 200

    no_limite = "p" * 50
    res = client.put(_url(matricula_termos), json=corpo(periodo=no_limite), headers=auth_termos)
    assert res.status_code == 200 and res.json()["periodo"] == no_limite

    res = client.put(_url(matricula_termos), json=corpo(periodo="p" * 51), headers=auth_termos)
    assert res.status_code == 422
    assert _campos_com_erro(res) == {("periodo",)}


def test_data_futura_retorna_422(client, matricula_termos, auth_termos):
    res = client.put(_url(matricula_termos), json=corpo(data=DEPOIS_DE_AMANHA), headers=auth_termos)

    assert res.status_code == 422
    assert _campos_com_erro(res) == {("data",)}
    assert "não pode ser futura" in res.json()["detail"][0]["msg"]


def test_data_fora_do_formato_iso_retorna_422(client, matricula_termos, auth_termos):
    res = client.put(_url(matricula_termos), json=corpo(data="20/11/2026"), headers=auth_termos)

    assert res.status_code == 422
    assert _campos_com_erro(res) == {("data",)}


def test_dados_do_aluno_enviados_sao_ignorados(client, db_session, matricula_termos, auth_termos):
    dados = corpo()
    dados["aluno"] = {"nome": "Nome Trocado"}

    res = client.put(_url(matricula_termos), json=dados, headers=auth_termos)

    assert res.status_code == 200
    assert res.json()["aluno"]["nome"] == "Ana Beatriz de Souza"


def test_put_responde_em_menos_de_5_segundos(client, matricula_termos, auth_termos):
    corpo_completo = corpo(
        saida={"forma_saida": "TRANSPORTE_ESCOLAR"},
        pessoas=[pessoa(f"Pessoa {n}", "Tio") for n in range(1, 5)],
    )

    inicio = time.perf_counter()
    res = client.put(_url(matricula_termos), json=corpo_completo, headers=auth_termos)
    duracao = time.perf_counter() - inicio

    assert res.status_code == 200
    assert duracao < 5


# Pessoas autorizadas

def test_quinta_pessoa_retorna_422(client, db_session, matricula_termos, auth_termos):
    cinco = [pessoa(f"Pessoa {n}", "Tio") for n in range(1, 6)]

    res = client.put(_url(matricula_termos), json=corpo(pessoas=cinco), headers=auth_termos)

    assert res.status_code == 422
    assert _campos_com_erro(res) == {("pessoas_autorizadas",)}
    assert "no máximo 4" in res.json()["detail"][0]["msg"]
    assert db_session.query(TermoSaida).count() == 0


def test_quatro_pessoas_sao_aceitas(client, matricula_termos, auth_termos):
    quatro = [pessoa(f"Pessoa {n}", "Tio") for n in range(1, 5)]

    res = client.put(_url(matricula_termos), json=corpo(pessoas=quatro), headers=auth_termos)

    assert res.status_code == 200
    assert len(res.json()["pessoas_autorizadas"]) == 4


def test_pessoa_sem_nome_ou_parentesco_lista_a_posicao_de_cada_campo(client, matricula_termos, auth_termos):
    res = client.put(
        _url(matricula_termos),
        json=corpo(pessoas=[{"nome": "Ana"}, {"parentesco": "Tio"}, pessoa()]),
        headers=auth_termos,
    )

    assert res.status_code == 422
    assert _campos_com_erro(res) == {
        ("pessoas_autorizadas", 0, "parentesco"),
        ("pessoas_autorizadas", 1, "nome"),
    }
    mensagens = " | ".join(erro["msg"] for erro in res.json()["detail"])
    assert "Pessoas autorizadas – pessoa 1 – parentesco" in mensagens
    assert "Pessoas autorizadas – pessoa 2 – nome" in mensagens


def test_pessoas_sao_criadas_atualizadas_pelo_id_e_removidas_por_ausencia(
    client, db_session, matricula_termos, auth_termos
):
    forma = {"forma_saida": "TRANSPORTE_ESCOLAR"}
    criado = client.put(
        _url(matricula_termos),
        json=corpo(saida=forma, pessoas=[pessoa("Ana", "Tia"), pessoa("Bruno", "Tio"), pessoa("Carla", "Prima")]),
        headers=auth_termos,
    )
    ana, bruno, carla = criado.json()["pessoas_autorizadas"]
    assert [p["nome"] for p in criado.json()["pessoas_autorizadas"]] == ["Ana", "Bruno", "Carla"]

    # Ana: atualizada pelo id. Bruno: mantido. Carla: ausente, logo removida. Davi: sem id, logo criado.
    res = client.put(
        _url(matricula_termos),
        json=corpo(
            saida=forma,
            pessoas=[
                pessoa("Ana Maria", "Madrinha", id=ana["id"]),
                pessoa("Bruno", "Tio", id=bruno["id"]),
                pessoa("Davi", "Primo"),
            ],
        ),
        headers=auth_termos,
    )

    assert res.status_code == 200
    atuais = res.json()["pessoas_autorizadas"]
    assert [(p["nome"], p["parentesco"]) for p in atuais] == [("Ana Maria", "Madrinha"), ("Bruno", "Tio"), ("Davi", "Primo")]
    assert atuais[0]["id"] == ana["id"] and atuais[1]["id"] == bruno["id"]  # as mesmas linhas
    assert carla["id"] not in {p["id"] for p in atuais}
    # No banco: a removida foi apagada de verdade, sem sobras.
    assert [p.nome for p in _pessoas_do_banco(db_session)] == ["Ana Maria", "Bruno", "Davi"]


def test_remover_todas_as_pessoas_com_a_lista_vazia(client, db_session, matricula_termos, auth_termos):
    client.put(_url(matricula_termos), json=corpo(pessoas=[pessoa(), pessoa("Luiza", "Tia")]), headers=auth_termos)

    res = client.put(_url(matricula_termos), json=corpo(pessoas=[]), headers=auth_termos)

    assert res.status_code == 200
    assert res.json()["pessoas_autorizadas"] == []
    assert _pessoas_do_banco(db_session) == []


def test_pessoas_voltam_na_ordem_de_cadastro_e_nao_na_ordem_enviada(client, matricula_termos, auth_termos):
    criado = client.put(_url(matricula_termos), json=corpo(pessoas=[pessoa("Ana", "Tia"), pessoa("Bruno", "Tio")]), headers=auth_termos)
    ana, bruno = criado.json()["pessoas_autorizadas"]

    res = client.put(
        _url(matricula_termos),
        json=corpo(pessoas=[pessoa("Bruno", "Tio", id=bruno["id"]), pessoa("Ana", "Tia", id=ana["id"])]),
        headers=auth_termos,
    )

    assert [p["nome"] for p in res.json()["pessoas_autorizadas"]] == ["Ana", "Bruno"]


def test_reenviar_o_mesmo_termo_com_os_ids_nao_duplica_pessoas(client, db_session, matricula_termos, auth_termos):
    forma = {"forma_saida": "TRANSPORTE_ESCOLAR"}
    primeira = client.put(_url(matricula_termos), json=corpo(saida=forma, pessoas=[pessoa(), pessoa("Luiza", "Tia")]), headers=auth_termos)
    com_ids = [pessoa(p["nome"], p["parentesco"], id=p["id"]) for p in primeira.json()["pessoas_autorizadas"]]

    # O frontend cancelou por demora e o usuário tentou de novo.
    for _ in range(2):
        res = client.put(_url(matricula_termos), json=corpo(saida=forma, pessoas=com_ids), headers=auth_termos)
        assert res.status_code == 200

    assert len(_pessoas_do_banco(db_session)) == 2
    assert res.json()["pessoas_autorizadas"] == primeira.json()["pessoas_autorizadas"]


def test_id_de_pessoa_de_outro_termo_do_mesmo_aluno_retorna_422(client, db_session, auth_termos):
    matricula_2025 = criar_matricula(db_session, ano=2025)
    matricula_2026 = criar_matricula(db_session, aluno=matricula_2025.aluno, ano=2026)
    de_2025 = client.put(_url(matricula_2025), json=corpo(pessoas=[pessoa("Pessoa de 2025", "Tia")]), headers=auth_termos)
    id_de_2025 = de_2025.json()["pessoas_autorizadas"][0]["id"]
    client.put(_url(matricula_2026), json=corpo(pessoas=[pessoa("Pessoa de 2026", "Tio")]), headers=auth_termos)

    res = client.put(
        _url(matricula_2026), json=corpo(pessoas=[pessoa("Invasora", "Tia", id=id_de_2025)]), headers=auth_termos
    )

    assert res.status_code == 422
    erro = res.json()["detail"][0]
    assert erro["loc"] == ["body", "pessoas_autorizadas", 0, "id"]
    assert "não pertence ao termo desta matrícula" in erro["msg"]
    # Nenhum dos dois termos mudou.
    assert [p["nome"] for p in client.get(_url(matricula_2025), headers=auth_termos).json()["pessoas_autorizadas"]] == ["Pessoa de 2025"]
    assert [p["nome"] for p in client.get(_url(matricula_2026), headers=auth_termos).json()["pessoas_autorizadas"]] == ["Pessoa de 2026"]


def test_id_de_pessoa_sem_termo_existente_ou_inexistente_retorna_422(client, db_session, matricula_termos, auth_termos):
    res = client.put(_url(matricula_termos), json=corpo(pessoas=[pessoa(id=12345)]), headers=auth_termos)
    assert res.status_code == 422
    assert db_session.query(TermoSaida).count() == 0  # nem o termo foi criado

    client.put(_url(matricula_termos), json=corpo(pessoas=[pessoa()]), headers=auth_termos)
    res = client.put(_url(matricula_termos), json=corpo(pessoas=[pessoa(id=12345)]), headers=auth_termos)
    assert res.status_code == 422
    assert len(_pessoas_do_banco(db_session)) == 1  # a pessoa original continua


def test_mesma_pessoa_enviada_duas_vezes_retorna_422(client, matricula_termos, auth_termos):
    criado = client.put(_url(matricula_termos), json=corpo(pessoas=[pessoa()]), headers=auth_termos)
    id_pessoa = criado.json()["pessoas_autorizadas"][0]["id"]

    res = client.put(
        _url(matricula_termos),
        json=corpo(pessoas=[pessoa(id=id_pessoa), pessoa("Outro nome", "Tio", id=id_pessoa)]),
        headers=auth_termos,
    )

    assert res.status_code == 422
    assert _campos_com_erro(res) == {("pessoas_autorizadas", 1, "id")}


def test_put_nao_altera_o_termo_de_outra_matricula_do_mesmo_aluno(client, db_session, auth_termos):
    matricula_2025 = criar_matricula(db_session, ano=2025)
    matricula_2026 = criar_matricula(db_session, aluno=matricula_2025.aluno, ano=2026)
    client.put(_url(matricula_2025), json=corpo(responsavel={"nome": "Responsável de 2025"}, pessoas=[pessoa("Tia de 2025", "Tia")]), headers=auth_termos)

    res = client.put(_url(matricula_2026), json=corpo(responsavel={"nome": "Responsável de 2026"}), headers=auth_termos)

    assert res.status_code == 200
    de_2025 = client.get(_url(matricula_2025), headers=auth_termos).json()
    assert de_2025["responsavel"]["nome"] == "Responsável de 2025"
    assert [p["nome"] for p in de_2025["pessoas_autorizadas"]] == ["Tia de 2025"]
    assert client.get(_url(matricula_2026), headers=auth_termos).json()["pessoas_autorizadas"] == []
    assert db_session.query(TermoSaida).count() == 2


# Autenticação e matrícula inexistente

@pytest.mark.parametrize("metodo,caminho", ROTAS_DO_TERMO)
def test_rotas_sem_token_retornam_401(client, metodo, caminho):
    res = client.request(metodo, caminho, json=corpo() if metodo == "put" else None)

    assert res.status_code == 401


@pytest.mark.parametrize("metodo,caminho", ROTAS_DO_TERMO)
def test_usuario_inativo_e_recusado(client, inactive_user, metodo, caminho):
    res = client.request(metodo, caminho, json=corpo() if metodo == "put" else None, headers=cabecalhos(inactive_user))

    assert res.status_code == 403


@pytest.mark.parametrize("metodo,sufixo", [("get", ""), ("put", ""), ("get", "/pdf")])
def test_matricula_inexistente_retorna_404(client, auth_termos, metodo, sufixo):
    res = client.request(
        metodo,
        f"/matriculas/999999/termo-saida{sufixo}",
        json=corpo() if metodo == "put" else None,
        headers=auth_termos,
    )

    assert res.status_code == 404
    assert res.json()["detail"] == "Matrícula não encontrada."


# Histórico de edições (Operacao)

def test_primeiro_put_registra_preenchimento(client, db_session, test_user, matricula_termos, auth_termos):
    client.put(_url(matricula_termos), json=corpo(), headers=auth_termos)

    preenchimentos = _operacoes(db_session, Tipo.PREENCHIMENTO_TERMO_SAIDA)
    assert len(preenchimentos) == 1
    operacao = preenchimentos[0]
    assert operacao.id_user == test_user.id
    assert operacao.id_aluno == matricula_termos.id_aluno
    assert operacao.data_op is not None
    assert "ano letivo 2026" in operacao.descricao
    assert _operacoes(db_session, Tipo.EDICAO_TERMO_SAIDA) == []


def test_salvar_duas_vezes_o_mesmo_termo_gera_so_um_preenchimento(client, db_session, matricula_termos, auth_termos):
    forma = {"forma_saida": "TRANSPORTE_ESCOLAR"}
    primeira = client.put(_url(matricula_termos), json=corpo(saida=forma, pessoas=[pessoa()]), headers=auth_termos)
    id_pessoa = primeira.json()["pessoas_autorizadas"][0]["id"]

    segunda = client.put(_url(matricula_termos), json=corpo(saida=forma, pessoas=[pessoa(id=id_pessoa)]), headers=auth_termos)

    assert segunda.status_code == 200
    assert len(_operacoes(db_session, Tipo.PREENCHIMENTO_TERMO_SAIDA)) == 1
    assert _operacoes(db_session, Tipo.EDICAO_TERMO_SAIDA) == []  # nada mudou
    assert segunda.json()["updated_at"] == primeira.json()["updated_at"]


def test_edicao_registra_os_nomes_dos_campos_sem_os_valores(client, db_session, test_user, matricula_termos, auth_termos):
    client.put(_url(matricula_termos), json=corpo(), headers=auth_termos)

    client.put(
        _url(matricula_termos),
        json=corpo(responsavel={"nome": "Joana Pereira Lima"}, periodo="Meio período", saida={"forma_saida": "TRANSPORTE_ESCOLAR"}, pessoas=[pessoa("Carlos Eduardo", "Cunhado")]),
        headers=auth_termos,
    )

    edicoes = _operacoes(db_session, Tipo.EDICAO_TERMO_SAIDA)
    assert len(edicoes) == 1
    descricao = edicoes[0].descricao
    assert edicoes[0].id_user == test_user.id
    assert edicoes[0].id_aluno == matricula_termos.id_aluno
    assert "ano letivo 2026" in descricao
    for campo_alterado in (
        "Responsável legal – nome",
        "Período",
        "Forma de saída",
        "Pessoas autorizadas – pessoa adicionada",
    ):
        assert campo_alterado in descricao
    assert "Data" not in descricao  # a data não mudou
    # LGPD: nenhum valor, só nomes de campos.
    for valor in ("Joana", "Pereira", "Meio período", "Carlos", "Cunhado", "Maria", "Integral"):
        assert valor not in descricao


def test_remover_pessoa_gera_edicao_com_pessoa_removida(client, db_session, matricula_termos, auth_termos):
    forma = {"forma_saida": "TRANSPORTE_ESCOLAR"}
    criado = client.put(_url(matricula_termos), json=corpo(saida=forma, pessoas=[pessoa("Ana", "Tia"), pessoa("Bruno", "Tio")]), headers=auth_termos)
    ana = criado.json()["pessoas_autorizadas"][0]

    client.put(_url(matricula_termos), json=corpo(saida=forma, pessoas=[pessoa("Ana", "Tia", id=ana["id"])]), headers=auth_termos)

    edicoes = _operacoes(db_session, Tipo.EDICAO_TERMO_SAIDA)
    assert len(edicoes) == 1
    assert "Pessoas autorizadas – pessoa removida" in edicoes[0].descricao
    assert "pessoa adicionada" not in edicoes[0].descricao
    assert "Bruno" not in edicoes[0].descricao and "Ana" not in edicoes[0].descricao


def test_alterar_dados_de_uma_pessoa_registra_a_posicao_do_campo(client, db_session, matricula_termos, auth_termos):
    forma = {"forma_saida": "TRANSPORTE_ESCOLAR"}
    criado = client.put(_url(matricula_termos), json=corpo(saida=forma, pessoas=[pessoa("Ana", "Tia"), pessoa("Bruno", "Tio")]), headers=auth_termos)
    ana, bruno = criado.json()["pessoas_autorizadas"]

    client.put(
        _url(matricula_termos),
        json=corpo(saida=forma, pessoas=[pessoa("Ana", "Tia", id=ana["id"]), pessoa("Bruno", "Padrinho", id=bruno["id"])]),
        headers=auth_termos,
    )

    descricao = _operacoes(db_session, Tipo.EDICAO_TERMO_SAIDA)[0].descricao
    assert "Pessoas autorizadas – pessoa 2 – parentesco" in descricao
    assert "pessoa 1" not in descricao
    assert "Padrinho" not in descricao  # o valor novo não vai para o histórico


def test_historico_nunca_guarda_nomes_nem_parentescos(client, db_session, matricula_termos, auth_termos):
    forma = {"forma_saida": "TRANSPORTE_ESCOLAR"}
    client.put(_url(matricula_termos), json=corpo(saida=forma, pessoas=[pessoa("Ana Clara Mendes", "Tia-avó")]), headers=auth_termos)
    client.put(_url(matricula_termos), json=corpo(saida=forma, pessoas=[pessoa("Bruno Mendes", "Tio")]), headers=auth_termos)
    client.get(_url(matricula_termos, "/pdf"), headers=auth_termos)

    for operacao in db_session.query(Operacao).all():
        for dado in ("Ana Clara", "Bruno", "Mendes", "Tia-avó", "Maria das Graças", "Ana Beatriz"):
            assert dado not in operacao.descricao


# Falhas: nada fica gravado pela metade (FE04)

@pytest.fixture
def historico_com_falha(monkeypatch):
    """Faz a gravação do histórico falhar DEPOIS de o termo e as pessoas já terem sido escritos."""

    def operacao_com_falha(*args, **kwargs):
        raise SQLAlchemyError("falha simulada no histórico")

    monkeypatch.setattr("app.services.service_historico.Operacao", operacao_com_falha)


def test_falha_no_primeiro_salvamento_nao_deixa_termo_nem_pessoas(
    client_real, db_real, matricula_real, auth_real, historico_com_falha
):
    corpo_completo = corpo(saida={"forma_saida": "TRANSPORTE_ESCOLAR"}, pessoas=[pessoa(), pessoa("Luiza", "Tia")])

    res = client_real.put(_url(matricula_real), json=corpo_completo, headers=auth_real)

    assert res.status_code == 503
    assert res.json()["detail"] == "Não foi possível salvar. Tente novamente."
    db_real.expire_all()
    assert db_real.query(TermoSaida).count() == 0
    assert db_real.query(PessoaAutorizada).count() == 0
    assert db_real.query(Operacao).count() == 0


def test_falha_na_edicao_nao_deixa_pessoas_pela_metade(client_real, db_real, matricula_real, auth_real, monkeypatch):
    forma = {"forma_saida": "TRANSPORTE_ESCOLAR"}
    criado = client_real.put(_url(matricula_real), json=corpo(saida=forma, pessoas=[pessoa("Ana", "Tia"), pessoa("Bruno", "Tio")]), headers=auth_real)
    assert criado.status_code == 200
    ana = criado.json()["pessoas_autorizadas"][0]
    operacoes_antes = db_real.query(Operacao).count()

    def operacao_com_falha(*args, **kwargs):
        raise SQLAlchemyError("falha simulada no histórico")

    monkeypatch.setattr("app.services.service_historico.Operacao", operacao_com_falha)
    # Troca o responsável, atualiza Ana, remove Bruno e cria Carla: nada disso pode ficar.
    res = client_real.put(
        _url(matricula_real),
        json=corpo(
            responsavel={"nome": "Outro Responsável"},
            saida=forma,
            pessoas=[pessoa("Ana Maria", "Madrinha", id=ana["id"]), pessoa("Carla", "Prima")],
        ),
        headers=auth_real,
    )

    assert res.status_code == 503
    db_real.expire_all()
    assert db_real.query(TermoSaida).one().resp_nome == "Maria das Graças Souza"
    assert [(p.nome, p.parentesco) for p in _pessoas_do_banco(db_real)] == [("Ana", "Tia"), ("Bruno", "Tio")]
    assert db_real.query(Operacao).count() == operacoes_antes


def test_falha_de_banco_no_commit_retorna_503_e_nao_grava(client_real, db_real, matricula_real, auth_real):
    with patch("sqlalchemy.orm.Session.commit", side_effect=OperationalError("connection error", {}, None)):
        res = client_real.put(_url(matricula_real), json=corpo(pessoas=[pessoa()]), headers=auth_real)

    assert res.status_code == 503
    assert res.json()["detail"] == "Não foi possível salvar. Tente novamente."
    db_real.expire_all()
    assert db_real.query(TermoSaida).count() == 0
    assert db_real.query(PessoaAutorizada).count() == 0
    assert db_real.query(Operacao).count() == 0


def test_falha_nao_registra_dados_pessoais_no_log(client_real, matricula_real, auth_real, historico_com_falha, caplog):
    with caplog.at_level(logging.DEBUG):
        res = client_real.put(_url(matricula_real), json=corpo(pessoas=[pessoa("Ana Clara Mendes", "Tia-avó")]), headers=auth_real)

    assert res.status_code == 503
    for dado in ("Ana Clara", "Mendes", "Tia-avó", "Maria das Graças"):
        assert dado not in caplog.text


# PDF


def _resposta_do_get(client, matricula, auth) -> TermoSaidaResponse:
    return TermoSaidaResponse.model_validate(client.get(_url(matricula), headers=auth).json())


@pytest.mark.parametrize("quantidade", [0, 2, 4])
def test_contexto_do_pdf_tem_sempre_4_linhas_de_pessoas(client, matricula_termos, auth_termos, quantidade):
    pessoas = [pessoa(f"Pessoa {n}", "Tio") for n in range(1, quantidade + 1)]
    client.put(_url(matricula_termos), json=corpo(saida={"forma_saida": "TRANSPORTE_ESCOLAR"} if pessoas else {}, pessoas=pessoas), headers=auth_termos)

    contexto = service_termo_saida.montar_contexto_pdf(_resposta_do_get(client, matricula_termos, auth_termos))

    linhas = contexto["pessoas"]
    assert [linha["numero"] for linha in linhas] == [1, 2, 3, 4]
    assert [linha["nome"] for linha in linhas[:quantidade]] == [f"Pessoa {n}" for n in range(1, quantidade + 1)]
    assert all(linha["nome"] == "" and linha["parentesco"] == "" for linha in linhas[quantidade:])


def test_contexto_do_pdf_lista_todas_as_formas_com_a_escolhida_marcada(client, matricula_termos, auth_termos):
    client.put(
        _url(matricula_termos),
        json=corpo(saida={"forma_saida": "OUTROS", "descricao_outros": "Vizinha"}, pessoas=[pessoa()]),
        headers=auth_termos,
    )

    contexto = service_termo_saida.montar_contexto_pdf(_resposta_do_get(client, matricula_termos, auth_termos))

    assert [(f["rotulo"], f["marcada"]) for f in contexto["formas_saida"]] == [
        ("Responsáveis (pai/mãe)", False),
        ("Transporte escolar", False),
        ("Outros", True),
    ]
    assert contexto["formas_saida"][2]["descricao"] == "Vizinha"
    assert isinstance(contexto, dict) and all(not hasattr(valor, "__table__") for valor in contexto.values())  # nada de ORM


@pular_sem_pdf
def test_pdf_baixa_com_cabecalhos_corretos_e_registra_a_exportacao(
    client, db_session, test_user, matricula_termos, auth_termos
):
    client.put(_url(matricula_termos), json=corpo(), headers=auth_termos)

    res = client.get(_url(matricula_termos, "/pdf"), headers=auth_termos)

    assert res.status_code == 200
    assert res.headers["content-type"] == "application/pdf"
    assert res.headers["cache-control"] == "no-store"
    assert res.headers["content-disposition"] == 'attachment; filename="termo-saida-ana-beatriz-de-souza-2026.pdf"'
    assert res.content.startswith(b"%PDF")
    assert res.headers.get("x-renewed-token")  # RN17: a sessão continua renovando

    exportacoes = _operacoes(db_session, Tipo.EXPORTACAO_PDF)
    assert len(exportacoes) == 1
    assert exportacoes[0].id_user == test_user.id
    assert exportacoes[0].id_aluno == matricula_termos.id_aluno
    assert "ano letivo 2026" in exportacoes[0].descricao
    assert "saída" in exportacoes[0].descricao


@pular_sem_pdf
def test_pdf_tem_todas_as_secoes_e_a_forma_escolhida_marcada(client, matricula_termos, auth_termos):
    client.put(
        _url(matricula_termos),
        json=corpo(
            saida={"forma_saida": "OUTROS", "descricao_outros": "Vizinha, quando o transporte atrasar"},
            pessoas=[pessoa("João Carlos de Souza", "Avô"), pessoa("Luiza Pereira", "Tia")],
            data="2026-03-09",
        ),
        headers=auth_termos,
    )

    pdf = client.get(_url(matricula_termos, "/pdf"), headers=auth_termos).content
    texto = texto_do_pdf(pdf)

    for trecho in (
        "Termo de Autorização de Saída do Aluno",
        "Ano letivo 2026",
        "RESPONSÁVEL LEGAL",  # títulos de seção saem em caixa alta
        "ALUNO(A)",
        "SAÍDA DA ESCOLA",
        "PESSOAS AUTORIZADAS A BUSCAR O ALUNO",
        "Maria das Graças Souza",
        "Ana Beatriz de Souza",
        "10/05/2022",  # nascimento em dd/mm/aaaa
        "Maternal I",
        "Integral",  # período
        "☐ Responsáveis (pai/mãe)",
        "☐ Transporte escolar",
        "☒ Outros",
        "Vizinha, quando o transporte atrasar",
        "João Carlos de Souza",
        "Avô",
        "Luiza Pereira",
        "Tia",
        "Se outra pessoa for buscar a criança, a escola precisa ser avisada com antecedência.",
        "Águas Lindas de Goiás",  # local fixo, da configuração
        "09/03/2026",
        "Assinatura do responsável legal",
        "Página 1 de 1",
        "Gerado em",
    ):
        assert normalizar(trecho) in texto, trecho


@pular_sem_pdf
def test_pdf_usa_o_local_da_configuracao(client, matricula_termos, auth_termos, monkeypatch):
    monkeypatch.setattr(settings, "local_termo_saida", "Brasília")
    client.put(_url(matricula_termos), json=corpo(), headers=auth_termos)

    texto = texto_do_pdf(client.get(_url(matricula_termos, "/pdf"), headers=auth_termos).content)

    assert "Brasília" in texto
    assert "Águas Lindas de Goiás" not in texto.replace("Sociedade Estação Vida", "")


@pular_sem_pdf
def test_pdf_sem_termo_salvo_sai_em_branco_com_as_opcoes_desmarcadas(client, matricula_termos, auth_termos):
    res = client.get(_url(matricula_termos, "/pdf"), headers=auth_termos)

    assert res.status_code == 200
    texto = texto_do_pdf(res.content)
    assert "Ana Beatriz de Souza" in texto
    assert "☐ Responsáveis (pai/mãe)" in texto and "☐ Transporte escolar" in texto and "☐ Outros" in texto
    assert "☒" not in texto
    assert "Assinatura do responsável legal" in texto


@pytest.mark.parametrize("id_matricula", [0, -1, 2_147_483_648, 10**20])
def test_id_fora_do_intervalo_do_banco_retorna_404_e_nao_erro_de_banco(client, auth_termos, id_matricula):
    res = client.get(f"/matriculas/{id_matricula}/termo-saida", headers=auth_termos)

    assert res.status_code == 404
    assert res.json()["detail"] == "Matrícula não encontrada."
