"""Testes do Termo de compromisso escolar (UC04 / issue #107)."""
import logging
import re
import time
from datetime import date, timedelta
from unittest.mock import patch

import pytest
from sqlalchemy.exc import OperationalError, SQLAlchemyError

from app.core.exceptions import FalhaGeracaoPdfError
from app.core.tempo import hoje_sao_paulo
from app.models.aluno import StatusAluno
from app.models.ops import Operacao, Tipo
from app.models.termo_comp import ModalidadeEnsino, RegimeAtendimento, TermoCompromisso
from app.schemas.termo_comum import AlunoTermoResponse
from app.schemas.termo_compromisso import TermoCompromissoResponse
from app.services import service_pdf, service_termo_compromisso
from tests.fixtures_termos import (  # noqa: F401  (fixtures importadas de propósito)
    CPF_VALIDO,
    OUTRO_CPF_VALIDO,
    auth_real,
    auth_termos,
    cabecalhos,
    client_real,
    criar_matricula,
    db_real,
    matricula_real,
    matricula_termos,
    pular_sem_pdf,
    sem_espacos,
    texto_do_pdf,
)

ONTEM = (hoje_sao_paulo() - timedelta(days=1)).isoformat()
DEPOIS_DE_AMANHA = (hoje_sao_paulo() + timedelta(days=2)).isoformat()
OBRIGATORIOS = {("nome_responsavel",), ("cpf_responsavel",), ("modalidade",), ("regime",)}
ROTAS_DO_TERMO = [("get", ""), ("put", ""), ("get", "/pdf")]
MSG_FALHA_SALVAR = "Não foi possível salvar. Tente novamente."


def _url(matricula, sufixo: str = "") -> str:
    return f"/matriculas/{getattr(matricula, 'id', matricula)}/termo-compromisso{sufixo}"


def corpo(**trocas) -> dict:
    """Corpo completo e válido do PUT (termo assinado). Os argumentos trocam campos."""
    return {
        "nome_responsavel": "Maria das Graças Souza", "cpf_responsavel": CPF_VALIDO, "modalidade": "CRECHE",
        "regime": "TEMPO_INTEGRAL", "assinatura": True, "data_assinatura": ONTEM,
    } | trocas


def _campos_com_erro(resposta) -> set[tuple]:
    """Posição de cada campo recusado no corpo (sem o prefixo "body")."""
    return {tuple(erro["loc"][1:]) for erro in resposta.json()["detail"]}


def _inativar(db, matricula) -> None:
    matricula.aluno.status = StatusAluno.INATIVO
    db.commit()


def _operacoes(db, tipo: Tipo) -> list[Operacao]:
    return db.query(Operacao).filter(Operacao.tipo == tipo).order_by(Operacao.id).all()


def _falhar_historico(monkeypatch) -> None:
    """Faz a gravação do histórico falhar DEPOIS de o termo já ter sido escrito na sessão."""
    def operacao_com_falha(*args, **kwargs):
        raise SQLAlchemyError("falha simulada no histórico")
    monkeypatch.setattr("app.services.service_historico.Operacao", operacao_com_falha)


@pytest.fixture
def historico_com_falha(monkeypatch):
    _falhar_historico(monkeypatch)


# GET

def test_get_sem_termo_devolve_aluno_campos_vazios_e_completa_falso(client, db_session, matricula_termos, auth_termos):
    res = client.get(_url(matricula_termos), headers=auth_termos)

    assert res.status_code == 200
    assert res.json() == {
        "aluno": {"nome": "Ana Beatriz de Souza", "data_nascimento": "2022-05-10", "etapa": "Maternal I", "ano_letivo": 2026},
        "nome_responsavel": None, "cpf_responsavel": None, "modalidade": None, "regime": None,
        "assinatura": False, "data_assinatura": None, "completa": False, "created_at": None, "updated_at": None,
    }
    # Consultar não grava nada.
    assert db_session.query(TermoCompromisso).count() == 0 and db_session.query(Operacao).count() == 0


def test_get_devolve_o_termo_salvo(client, matricula_termos, auth_termos):
    client.put(_url(matricula_termos), json=corpo(), headers=auth_termos)

    dados = client.get(_url(matricula_termos), headers=auth_termos).json()

    assert {campo: dados[campo] for campo in corpo()} == corpo()
    assert dados["completa"] is True
    assert dados["created_at"] is not None and dados["updated_at"] is not None


# PUT – criação, atualização e regras (FE01 / RN06)

def test_put_cria_o_termo_e_o_segundo_put_atualiza_o_mesmo(client, db_session, matricula_termos, auth_termos):
    res = client.put(_url(matricula_termos), json=corpo(), headers=auth_termos)

    assert res.status_code == 200
    assert res.json()["completa"] is True and res.json()["aluno"]["nome"] == "Ana Beatriz de Souza"
    termo = db_session.query(TermoCompromisso).one()
    assert (termo.id_matricula, termo.nome_responsavel, termo.cpf_responsavel) == (
        matricula_termos.id, "Maria das Graças Souza", CPF_VALIDO)
    assert (termo.modalidade, termo.regime) == (ModalidadeEnsino.CRECHE, RegimeAtendimento.TEMPO_INTEGRAL)
    assert termo.assinatura is True and termo.data_assinatura == date.fromisoformat(ONTEM)

    novo = corpo(nome_responsavel="Joana Souza", modalidade="PRE_ESCOLA", regime="PARCIAL_MATUTINO")
    assert client.put(_url(matricula_termos), json=novo, headers=auth_termos).status_code == 200
    termo = db_session.query(TermoCompromisso).one()  # continua um só
    assert (termo.nome_responsavel, termo.modalidade, termo.regime) == (
        "Joana Souza", ModalidadeEnsino.PRE_ESCOLA, RegimeAtendimento.PARCIAL_MATUTINO)


@pytest.mark.parametrize(
    "trocas",
    [
        {"assinatura": False, "data_assinatura": None},
        {"assinatura": False, "data_assinatura": ONTEM},  # a data enviada é limpa
        {"assinatura": False, "data_assinatura": DEPOIS_DE_AMANHA},  # nem chega a ser validada
        {"assinatura": None, "data_assinatura": None},  # nulo vale "não assinado"
        {"assinatura": "ausente", "data_assinatura": None},
    ],
)
def test_termo_nao_assinado_e_salvo_sem_data_e_nao_fica_completo(client, db_session, matricula_termos, auth_termos, trocas):
    dados = corpo(**trocas)
    if dados["assinatura"] == "ausente":
        del dados["assinatura"]

    res = client.put(_url(matricula_termos), json=dados, headers=auth_termos)

    assert res.status_code == 200
    assert (res.json()["assinatura"], res.json()["data_assinatura"], res.json()["completa"]) == (False, None, False)
    termo = db_session.query(TermoCompromisso).one()
    assert termo.assinatura is False and termo.data_assinatura is None


def test_desmarcar_a_assinatura_limpa_a_data_salva(client, db_session, matricula_termos, auth_termos):
    client.put(_url(matricula_termos), json=corpo(), headers=auth_termos)

    res = client.put(_url(matricula_termos), json=corpo(assinatura=False), headers=auth_termos)

    assert res.status_code == 200 and res.json()["completa"] is False
    termo = db_session.query(TermoCompromisso).one()
    assert termo.assinatura is False and termo.data_assinatura is None


@pytest.mark.parametrize(
    "dados,campos,trechos",
    [
        ({}, OBRIGATORIOS, ("Campo obrigatório", "Responsável – nome", "Responsável – CPF", "Modalidade", "Regime")),
        ({"assinatura": True}, OBRIGATORIOS | {("data_assinatura",)}, ()),
        (corpo(data_assinatura=None), {("data_assinatura",)}, ("Data da assinatura",)),
        (corpo(data_assinatura=DEPOIS_DE_AMANHA), {("data_assinatura",)}, ("não pode ser futura",)),
        *[(corpo(data_assinatura=d), {("data_assinatura",)}, ()) for d in ("20/11/2026", "2026-13-45", "ontem", "2026-1-5")],
        (corpo(nome_responsavel="   ", modalidade=" "), {("nome_responsavel",), ("modalidade",)}, ()),  # só espaços = vazio
        (corpo(nome_responsavel="x" * 151), {("nome_responsavel",)}, ("no máximo 150",)),
        # CPF: dígito errado, com pontuação, 10 dígitos, sequência repetida e letras. Sem unicidade (outro teste).
        *[(corpo(cpf_responsavel=c), {("cpf_responsavel",)}, ("CPF inválido",))
          for c in ("52998224724", "529.982.247-25", "5299822472", "11111111111", "abcdefghijk")],
        # Opções: inexistente, minúscula, regime sem o turno e número.
        *[(corpo(**{c: v}), {(c,)}, ("opção inválida",))
          for c, v in (("modalidade", "BERCARIO"), ("modalidade", "creche"), ("regime", "NOITE"),
                       ("regime", "PARCIAL"), ("regime", 1))],
        *[(corpo(assinatura=v), {("assinatura",)}, ("informe true",)) for v in ("sim", 1, "true")],
        # FE01: tudo de uma vez, mesmo quando um campo nem chega a ser convertido.
        ({"modalidade": "BERCARIO", "assinatura": True, "data_assinatura": "ontem"},
         OBRIGATORIOS | {("data_assinatura",)}, ()),
    ],
)
def test_put_invalido_retorna_422_listando_todos_os_campos(client, db_session, matricula_termos, auth_termos, dados, campos, trechos):
    res = client.put(_url(matricula_termos), json=dados, headers=auth_termos)

    assert res.status_code == 422
    assert _campos_com_erro(res) == campos
    mensagens = " | ".join(erro["msg"] for erro in res.json()["detail"])
    assert all(trecho in mensagens for trecho in trechos)
    assert all(erro.get("input") is None for erro in res.json()["detail"])  # o valor recebido não volta
    assert db_session.query(TermoCompromisso).count() == 0


def test_data_de_hoje_e_cpf_repetido_em_outra_matricula_sao_aceitos(client, db_session, auth_termos):
    hoje = corpo(data_assinatura=hoje_sao_paulo().isoformat())
    for matricula in (criar_matricula(db_session), criar_matricula(db_session)):  # mesmo CPF: sem unicidade
        assert client.put(_url(matricula), json=hoje, headers=auth_termos).status_code == 200


def test_dados_do_aluno_sao_somente_leitura(client, db_session, matricula_termos, auth_termos):
    dados = corpo() | {"aluno": {"nome": "Nome Trocado", "data_nascimento": "2000-01-01"}}

    res = client.put(_url(matricula_termos), json=dados, headers=auth_termos)

    assert res.status_code == 200 and res.json()["aluno"]["nome"] == "Ana Beatriz de Souza"
    db_session.refresh(matricula_termos.aluno)
    assert matricula_termos.aluno.nome == "Ana Beatriz de Souza"


def test_put_nao_altera_o_termo_de_outra_matricula_do_mesmo_aluno(client, db_session, auth_termos):
    matricula_2025 = criar_matricula(db_session, ano=2025)
    matricula_2026 = criar_matricula(db_session, aluno=matricula_2025.aluno, ano=2026)
    for matricula, ano in ((matricula_2025, 2025), (matricula_2026, 2026)):
        res = client.put(_url(matricula), json=corpo(nome_responsavel=f"Responsável de {ano}"), headers=auth_termos)
        assert res.status_code == 200

    for matricula, ano in ((matricula_2025, 2025), (matricula_2026, 2026)):
        dados = client.get(_url(matricula), headers=auth_termos).json()
        assert (dados["nome_responsavel"], dados["aluno"]["ano_letivo"]) == (f"Responsável de {ano}", ano)
    assert db_session.query(TermoCompromisso).count() == 2


def test_put_responde_em_menos_de_5_segundos(client, matricula_termos, auth_termos):
    inicio = time.perf_counter()
    res = client.put(_url(matricula_termos), json=corpo(), headers=auth_termos)

    assert res.status_code == 200 and time.perf_counter() - inicio < 5


# Matrícula inativa: só consulta (RN10 / FE03)

@pytest.mark.parametrize("ja_salvo", [False, True])
def test_matricula_inativa_recusa_o_put_com_409_e_libera_o_get(client, db_session, matricula_termos, auth_termos, ja_salvo):
    if ja_salvo:
        client.put(_url(matricula_termos), json=corpo(), headers=auth_termos)
    operacoes_antes = db_session.query(Operacao).count()
    _inativar(db_session, matricula_termos)

    res = client.put(_url(matricula_termos), json=corpo(nome_responsavel="Outro Nome"), headers=auth_termos)

    assert res.status_code == 409 and "inativa" in res.json()["detail"]
    db_session.expire_all()
    assert [t.nome_responsavel for t in db_session.query(TermoCompromisso)] == (["Maria das Graças Souza"] if ja_salvo else [])
    assert db_session.query(Operacao).count() == operacoes_antes
    consulta = client.get(_url(matricula_termos), headers=auth_termos)
    assert consulta.status_code == 200
    assert consulta.json()["nome_responsavel"] == ("Maria das Graças Souza" if ja_salvo else None)


# Autenticação e matrícula inexistente (RNF02)

@pytest.mark.parametrize("metodo,sufixo", ROTAS_DO_TERMO)
def test_rotas_exigem_token_e_conta_ativa(client, inactive_user, metodo, sufixo):
    json = corpo() if metodo == "put" else None

    assert client.request(metodo, _url(1, sufixo), json=json).status_code == 401
    assert client.request(metodo, _url(1, sufixo), json=json, headers=cabecalhos(inactive_user)).status_code == 403


@pytest.mark.parametrize("id_matricula", [999999, 2**31, 0])
@pytest.mark.parametrize("metodo,sufixo", ROTAS_DO_TERMO)
def test_matricula_inexistente_retorna_404(client, auth_termos, metodo, sufixo, id_matricula):
    res = client.request(metodo, _url(id_matricula, sufixo), json=corpo() if metodo == "put" else None, headers=auth_termos)

    assert res.status_code == 404 and res.json()["detail"] == "Matrícula não encontrada."


# Histórico de edições (FA01 / FA04 / RF17) e LGPD (RNF01)

def test_primeiro_put_registra_preenchimento_e_repetir_nao_registra_edicao(client, db_session, test_user, matricula_termos, auth_termos):
    primeira = client.put(_url(matricula_termos), json=corpo(), headers=auth_termos)
    segunda = client.put(_url(matricula_termos), json=corpo(), headers=auth_termos)

    [operacao] = _operacoes(db_session, Tipo.PREENCHIMENTO_TERMO_COMPROMISSO)
    assert (operacao.id_user, operacao.id_aluno) == (test_user.id, matricula_termos.id_aluno)
    assert operacao.data_op is not None
    assert "Termo de compromisso escolar preenchido (ano letivo 2026)" in operacao.descricao
    assert _operacoes(db_session, Tipo.EDICAO_TERMO_COMPROMISSO) == []  # nada mudou
    assert segunda.status_code == 200 and segunda.json()["updated_at"] == primeira.json()["updated_at"]


def test_edicao_registra_os_nomes_dos_campos_sem_os_valores(client, db_session, test_user, matricula_termos, auth_termos):
    client.put(_url(matricula_termos), json=corpo(), headers=auth_termos)
    edicao = corpo(cpf_responsavel=OUTRO_CPF_VALIDO, nome_responsavel="Joana Pereira Lima", regime="PARCIAL_VESPERTINO")

    client.put(_url(matricula_termos), json=edicao, headers=auth_termos)

    [operacao] = _operacoes(db_session, Tipo.EDICAO_TERMO_COMPROMISSO)
    descricao = operacao.descricao
    assert (operacao.id_user, operacao.id_aluno) == (test_user.id, matricula_termos.id_aluno)
    assert all(campo in descricao for campo in ("ano letivo 2026", "Responsável – nome", "Responsável – CPF", "Regime"))
    assert "Modalidade" not in descricao and "Data da assinatura" not in descricao  # não mudaram
    # O resumo só tem nomes; os valores ficam em `alteracoes`, na ordem da tela.
    for valor in (OUTRO_CPF_VALIDO, CPF_VALIDO, "Joana", "Maria", "PARCIAL", "TEMPO_INTEGRAL", "vespertino"):
        assert valor not in descricao
    ficha = service_termo_compromisso.NOME_TERMO
    assert operacao.alteracoes == [
        {"ficha": ficha, "campo": "Responsável – nome", "valor_anterior": "Maria das Graças Souza",
         "valor_novo": "Joana Pereira Lima", "sensivel": False},
        # LGPD: CPF é sensível (app/core/auditoria.py) e sai sem valores.
        {"ficha": ficha, "campo": "Responsável – CPF", "valor_anterior": "", "valor_novo": "", "sensivel": True},
        {"ficha": ficha, "campo": "Regime", "valor_anterior": "Tempo integral",
         "valor_novo": "Parcial – vespertino", "sensivel": False},
    ]


def test_retirar_a_assinatura_registra_assinatura_e_data(client, db_session, matricula_termos, auth_termos):
    client.put(_url(matricula_termos), json=corpo(), headers=auth_termos)
    client.put(_url(matricula_termos), json=corpo(assinatura=False), headers=auth_termos)

    [operacao] = _operacoes(db_session, Tipo.EDICAO_TERMO_COMPROMISSO)
    assert "Leitura e assinatura do termo" in operacao.descricao and "Data da assinatura" in operacao.descricao
    assert ONTEM not in operacao.descricao
    assert [(i["campo"], i["valor_anterior"], i["valor_novo"]) for i in operacao.alteracoes] == [
        ("Leitura e assinatura do termo", "Sim", "Não"),
        ("Data da assinatura", date.fromisoformat(ONTEM).strftime("%d/%m/%Y"), ""),
    ]


def test_preenchimento_nao_tem_alteracoes(client, db_session, matricula_termos, auth_termos):
    client.put(_url(matricula_termos), json=corpo(), headers=auth_termos)

    assert _operacoes(db_session, Tipo.PREENCHIMENTO_TERMO_COMPROMISSO)[0].alteracoes == []


def test_historico_nunca_guarda_o_cpf_nem_dados_no_resumo(client, db_session, matricula_termos, auth_termos):
    client.put(_url(matricula_termos), json=corpo(), headers=auth_termos)
    client.put(_url(matricula_termos), json=corpo(cpf_responsavel=OUTRO_CPF_VALIDO), headers=auth_termos)
    client.get(_url(matricula_termos, "/pdf"), headers=auth_termos)

    for operacao in db_session.query(Operacao).all():
        for dado in (CPF_VALIDO, OUTRO_CPF_VALIDO, "Maria", "Graças", "Ana Beatriz", ONTEM):
            assert dado not in operacao.descricao
        assert CPF_VALIDO not in str(operacao.alteracoes) and OUTRO_CPF_VALIDO not in str(operacao.alteracoes)


# Falhas: nada fica gravado pela metade (FE04)

def test_falha_no_primeiro_salvamento_nao_deixa_nada_gravado(client_real, db_real, matricula_real, auth_real, historico_com_falha):
    res = client_real.put(_url(matricula_real), json=corpo(), headers=auth_real)

    assert res.status_code == 503 and res.json()["detail"] == MSG_FALHA_SALVAR
    db_real.expire_all()
    assert db_real.query(TermoCompromisso).count() == 0 and db_real.query(Operacao).count() == 0


def test_falha_na_edicao_mantem_o_termo_como_estava(client_real, db_real, matricula_real, auth_real, monkeypatch):
    assert client_real.put(_url(matricula_real), json=corpo(), headers=auth_real).status_code == 200
    operacoes_antes = db_real.query(Operacao).count()
    _falhar_historico(monkeypatch)

    res = client_real.put(_url(matricula_real), json=corpo(nome_responsavel="Outro Nome", regime="PARCIAL_MATUTINO"), headers=auth_real)

    assert res.status_code == 503
    db_real.expire_all()
    termo = db_real.query(TermoCompromisso).one()
    assert (termo.nome_responsavel, termo.regime) == ("Maria das Graças Souza", RegimeAtendimento.TEMPO_INTEGRAL)
    assert db_real.query(Operacao).count() == operacoes_antes


def test_falha_de_banco_no_commit_retorna_503_e_nao_grava(client_real, db_real, matricula_real, auth_real):
    with patch("sqlalchemy.orm.Session.commit", side_effect=OperationalError("connection error", {}, None)):
        res = client_real.put(_url(matricula_real), json=corpo(), headers=auth_real)

    assert res.status_code == 503 and res.json()["detail"] == MSG_FALHA_SALVAR
    db_real.expire_all()
    assert db_real.query(TermoCompromisso).count() == 0 and db_real.query(Operacao).count() == 0


def test_falha_ao_consultar_retorna_503(client, matricula_termos, auth_termos):
    erro = OperationalError("connection error", {}, None)
    with patch("app.repository.repository_termos.buscar_matricula_com_termo_compromisso", side_effect=erro):
        assert client.get(_url(matricula_termos), headers=auth_termos).status_code == 503


def test_falha_nao_registra_dados_pessoais_no_log(client_real, matricula_real, auth_real, historico_com_falha, caplog):
    with caplog.at_level(logging.DEBUG):
        assert client_real.put(_url(matricula_real), json=corpo(), headers=auth_real).status_code == 503

    assert all(dado not in caplog.text for dado in (CPF_VALIDO, "Maria das Graças", "Ana Beatriz"))


# Contexto e HTML do PDF (não dependem do WeasyPrint)

def _termo_resposta(**trocas) -> TermoCompromissoResponse:
    aluno = AlunoTermoResponse(nome="Ana Beatriz de Souza", data_nascimento=date(2022, 5, 10), etapa="Maternal I", ano_letivo=2026)
    return TermoCompromissoResponse(**{
        "aluno": aluno, "nome_responsavel": "Maria das Graças Souza", "cpf_responsavel": CPF_VALIDO,
        "modalidade": ModalidadeEnsino.PRE_ESCOLA, "regime": RegimeAtendimento.TEMPO_INTEGRAL,
        "assinatura": True, "data_assinatura": date(2026, 3, 9), "completa": True,
    } | trocas)


def _html(termo: TermoCompromissoResponse) -> str:
    return service_pdf.renderizar_html(service_termo_compromisso.TEMPLATE_PDF, service_termo_compromisso.montar_contexto_pdf(termo))


def test_contexto_do_pdf_lista_todas_as_opcoes_com_a_escolhida_marcada():
    contexto = service_termo_compromisso.montar_contexto_pdf(_termo_resposta())

    assert contexto["modalidades"] == [{"rotulo": "Creche", "marcada": False}, {"rotulo": "Pré-escola", "marcada": True}]
    assert contexto["regimes"] == [
        {"rotulo": "Tempo integral", "marcada": True},
        {"rotulo": "Parcial – matutino", "marcada": False},
        {"rotulo": "Parcial – vespertino", "marcada": False},
    ]
    assert (contexto["modalidade"], contexto["regime"]) == ("Pré-escola", "tempo integral")


def test_html_do_termo_tem_os_dados_as_mascaras_e_as_normas():
    texto = " ".join(re.sub(r"<[^>]+>", " ", _html(_termo_resposta())).split())

    for trecho in (
        "Termo de Compromisso Escolar", "Eu, Maria das Graças Souza , na condição de responsável", "Ana Beatriz de Souza",
        "matriculado(a) no ano de 2026", "na modalidade de Pré-escola , em tempo integral", "529.982.247-25",
        "09/03/2026", "De acordo com o termo de compromisso", "LEMBRE-SE",
        *service_termo_compromisso.paragrafos_do_termo(),
    ):
        assert trecho in texto


def test_html_sem_termo_sai_com_linhas_para_preencher_a_mao():
    html = _html(_termo_resposta(nome_responsavel=None, cpf_responsavel=None, modalidade=None, regime=None,
                                 assinatura=False, data_assinatura=None, completa=False))

    assert html.count("______________________________") == 3  # nome, modalidade e regime
    assert "☒" not in html and "None" not in html  # nenhuma opção marcada


def test_html_digitado_no_formulario_aparece_como_texto():
    html = _html(_termo_resposta(nome_responsavel='<b>Maria</b> & "Cia"'))

    assert "<b>Maria</b>" not in html and "&lt;b&gt;Maria&lt;/b&gt; &amp;" in html


def test_normas_cobrem_os_itens_do_modelo_em_papel():
    texto = " ".join(service_termo_compromisso.paragrafos_do_termo())

    for trecho in (
        "Código Penal, em seu artigo 246", "Artigo 22 do Estatuto da Criança e do Adolescente", "Artigo 56 do ECA",
        "Entrada: 07h30min às 08h00min", "Saída: 16h00min às 17h00min", "2.1 –", "2.6 –", "2.12 –",
        "3.0 – O(a) aluno(a) só será matriculado(a)",
    ):
        assert trecho in texto


# PDF (dependem do WeasyPrint)

@pular_sem_pdf
def test_pdf_baixa_com_cabecalhos_corretos_e_registra_a_exportacao(client, db_session, test_user, matricula_termos, auth_termos):
    client.put(_url(matricula_termos), json=corpo(), headers=auth_termos)

    res = client.get(_url(matricula_termos, "/pdf"), headers=auth_termos)

    assert res.status_code == 200 and res.content.startswith(b"%PDF")
    assert res.headers["content-type"] == "application/pdf"
    assert res.headers["cache-control"] == "no-store"
    assert res.headers["content-disposition"] == 'attachment; filename="termo-compromisso-ana-beatriz-de-souza-2026.pdf"'
    assert res.headers.get("x-renewed-token")  # a sessão continua renovando (RN17)
    [exportacao] = _operacoes(db_session, Tipo.EXPORTACAO_PDF)
    assert (exportacao.id_user, exportacao.id_aluno) == (test_user.id, matricula_termos.id_aluno)
    assert "Termo de compromisso escolar exportado em PDF" in exportacao.descricao


@pular_sem_pdf
def test_pdf_tem_os_dados_preenchidos_e_todas_as_normas(client, matricula_termos, auth_termos):
    client.put(_url(matricula_termos), json=corpo(data_assinatura="2026-03-09"), headers=auth_termos)

    texto = sem_espacos(texto_do_pdf(client.get(_url(matricula_termos, "/pdf"), headers=auth_termos).content))

    for trecho in (
        "Termo de Compromisso Escolar", "Ano letivo 2026", "Maria das Graças Souza", "529.982.247-25",
        "Ana Beatriz de Souza", "10/05/2022", "Maternal I", "09/03/2026", "☒ Creche", "☒ Tempo integral",
        *service_termo_compromisso.paragrafos_do_termo(),
    ):
        assert sem_espacos(trecho) in texto


@pular_sem_pdf
@pytest.mark.parametrize("inativa", [False, True])  # exportar é consulta: liberado também para inativa
def test_pdf_sem_termo_salvo_sai_em_branco(client, db_session, matricula_termos, auth_termos, inativa):
    if inativa:
        _inativar(db_session, matricula_termos)

    res = client.get(_url(matricula_termos, "/pdf"), headers=auth_termos)

    assert res.status_code == 200
    texto = texto_do_pdf(res.content)
    assert "Ana Beatriz de Souza" in texto and "☒" not in texto


def test_falha_na_geracao_do_pdf_retorna_500_sem_registrar_exportacao(client, db_session, matricula_termos, auth_termos):
    with patch.object(service_pdf, "gerar_pdf", side_effect=FalhaGeracaoPdfError()):
        assert client.get(_url(matricula_termos, "/pdf"), headers=auth_termos).status_code == 500
    assert _operacoes(db_session, Tipo.EXPORTACAO_PDF) == []


def test_falha_ao_registrar_a_exportacao_retorna_503(client_real, matricula_real, auth_real, monkeypatch, historico_com_falha):
    monkeypatch.setattr(service_pdf, "gerar_pdf", lambda *args, **kwargs: b"%PDF-falso")

    res = client_real.get(_url(matricula_real, "/pdf"), headers=auth_real)

    assert res.status_code == 503
    assert res.json()["detail"] == "Não foi possível registrar a exportação. Tente novamente."
