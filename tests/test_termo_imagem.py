"""Testes do Termo de autorização de uso de imagem (UC04 / issue #92)."""
import logging
import time
from datetime import timedelta
from unittest.mock import patch

import pytest
from sqlalchemy.exc import OperationalError, SQLAlchemyError

from app.core.tempo import hoje_sao_paulo
from app.models.ops import Operacao, Tipo
from app.models.termo_imagem import TermoImagem
from tests.fixtures_termos import (  # noqa: F401  (fixtures importadas de propósito)
    CPF_VALIDO,
    ENDERECO_DO_ALUNO,
    OUTRO_CPF_VALIDO,
    auth_real,
    auth_termos,
    cabecalhos,
    client_real,
    criar_matricula,
    db_real,
    matricula_real,
    matricula_termos,
    normalizar,
    pular_sem_pdf,
    sem_espacos,
    texto_do_pdf,
)

ONTEM = (hoje_sao_paulo() - timedelta(days=1)).isoformat()
DEPOIS_DE_AMANHA = (hoje_sao_paulo() + timedelta(days=2)).isoformat()

ROTAS_DO_TERMO = [
    ("get", "/matriculas/1/termo-imagem"),
    ("put", "/matriculas/1/termo-imagem"),
    ("get", "/matriculas/1/termo-imagem/pdf"),
    ("get", "/termos/uso-imagem/texto"),
]


def _url(matricula, sufixo: str = "") -> str:
    return f"/matriculas/{matricula.id}/termo-imagem{sufixo}"


def corpo(responsavel: dict | None = None, autorizacao: dict | None = None) -> dict:
    """Corpo completo e válido do PUT. Os argumentos trocam campos de cada bloco."""
    dados = {
        "responsavel": {
            "nome": "Maria das Graças Souza",
            "nacionalidade": "Brasileira",
            "estado_civil": "Solteira",
            "rg": "1234567 SSP/GO",
            "cpf": CPF_VALIDO,
            "residente_em": ENDERECO_DO_ALUNO,
        },
        "autorizacao": {"autoriza": True, "local": "Águas Lindas de Goiás", "data": ONTEM},
    }
    dados["responsavel"].update(responsavel or {})
    dados["autorizacao"].update(autorizacao or {})
    return dados


def _campos_com_erro(resposta) -> set[tuple]:
    """Posição de cada campo recusado no corpo (sem o prefixo "body")."""
    return {tuple(erro["loc"][1:]) for erro in resposta.json()["detail"]}


# GET

def test_get_sem_termo_devolve_aluno_sugestao_e_completa_falso(client, db_session, matricula_termos, auth_termos):
    res = client.get(_url(matricula_termos), headers=auth_termos)

    assert res.status_code == 200
    dados = res.json()
    assert dados["aluno"] == {
        "nome": "Ana Beatriz de Souza",
        "data_nascimento": "2022-05-10",
        "etapa": "Maternal I",
        "ano_letivo": 2026,
    }
    # "Residente em" sugerido com o endereço montado do aluno; o resto vazio.
    assert dados["responsavel"] == {
        "nome": None,
        "nacionalidade": None,
        "estado_civil": None,
        "rg": None,
        "cpf": None,
        "residente_em": ENDERECO_DO_ALUNO,
    }
    assert dados["autorizacao"] == {"autoriza": None, "local": None, "data": None}
    assert dados["completa"] is False
    assert dados["created_at"] is None and dados["updated_at"] is None
    # Consultar não grava nada.
    assert db_session.query(TermoImagem).count() == 0
    assert db_session.query(Operacao).count() == 0


def test_endereco_sugerido_omite_as_partes_vazias(client, db_session, auth_termos):
    matricula = criar_matricula(db_session, numero=None, bairro=None, cep="", uf_residencia=None)

    res = client.get(_url(matricula), headers=auth_termos)

    assert res.json()["responsavel"]["residente_em"] == "Rua das Flores, Águas Lindas de Goiás"


def test_get_devolve_o_termo_salvo(client, matricula_termos, auth_termos):
    client.put(_url(matricula_termos), json=corpo(), headers=auth_termos)

    res = client.get(_url(matricula_termos), headers=auth_termos)

    assert res.status_code == 200
    dados = res.json()
    assert dados["responsavel"]["nome"] == "Maria das Graças Souza"
    assert dados["responsavel"]["cpf"] == CPF_VALIDO
    assert dados["autorizacao"] == {"autoriza": True, "local": "Águas Lindas de Goiás", "data": ONTEM}
    assert dados["completa"] is True
    assert dados["created_at"] is not None


# PUT – criação, atualização e obrigatórios (FE01)

def test_put_cria_o_termo(client, db_session, matricula_termos, auth_termos):
    res = client.put(_url(matricula_termos), json=corpo(), headers=auth_termos)

    assert res.status_code == 200
    dados = res.json()
    assert dados["completa"] is True
    assert dados["aluno"]["nome"] == "Ana Beatriz de Souza"
    assert dados["created_at"] is not None and dados["updated_at"] is not None

    termo = db_session.query(TermoImagem).one()
    assert termo.id_matricula == matricula_termos.id
    assert termo.resp_nome == "Maria das Graças Souza"
    assert termo.resp_cpf == CPF_VALIDO
    assert termo.residente_em == ENDERECO_DO_ALUNO
    assert termo.autorizacao is True


def test_segundo_put_atualiza_o_mesmo_termo(client, db_session, matricula_termos, auth_termos):
    client.put(_url(matricula_termos), json=corpo(), headers=auth_termos)

    res = client.put(
        _url(matricula_termos),
        json=corpo(responsavel={"nome": "Joana Souza", "cpf": OUTRO_CPF_VALIDO}),
        headers=auth_termos,
    )

    assert res.status_code == 200
    assert res.json()["responsavel"]["nome"] == "Joana Souza"
    termo = db_session.query(TermoImagem).one()  # continua um só
    assert termo.resp_nome == "Joana Souza"
    assert termo.resp_cpf == OUTRO_CPF_VALIDO


def test_put_sem_residente_em_retorna_422(client, db_session, matricula_termos, auth_termos):
    dados = corpo()
    del dados["responsavel"]["residente_em"]

    res = client.put(_url(matricula_termos), json=dados, headers=auth_termos)

    assert res.status_code == 422
    assert _campos_com_erro(res) == {("responsavel", "residente_em")}
    assert "Responsável legal – residente em" in res.json()["detail"][0]["msg"]
    assert db_session.query(TermoImagem).count() == 0  # nunca salvo sem "residente em"


def test_residente_em_so_com_espacos_retorna_422(client, matricula_termos, auth_termos):
    res = client.put(_url(matricula_termos), json=corpo(responsavel={"residente_em": "   "}), headers=auth_termos)

    assert res.status_code == 422
    assert _campos_com_erro(res) == {("responsavel", "residente_em")}


def test_put_vazio_lista_todos_os_campos_faltantes(client, matricula_termos, auth_termos):
    res = client.put(_url(matricula_termos), json={}, headers=auth_termos)

    assert res.status_code == 422
    erros = res.json()["detail"]
    assert _campos_com_erro(res) == {
        ("responsavel", "nome"),
        ("responsavel", "cpf"),
        ("responsavel", "residente_em"),
        ("autorizacao", "local"),
        ("autorizacao", "data"),
    }
    assert all(erro["type"] == "campo_obrigatorio" for erro in erros)
    mensagens = " | ".join(erro["msg"] for erro in erros)
    for nome_do_campo in (
        "Responsável legal – nome",
        "Responsável legal – CPF",
        "Responsável legal – residente em",
        "Local",
        "Data",
    ):
        assert nome_do_campo in mensagens


def test_autorizacao_vazia_e_aceita_e_completa_fica_falso(client, db_session, matricula_termos, auth_termos):
    res = client.put(_url(matricula_termos), json=corpo(autorizacao={"autoriza": None}), headers=auth_termos)

    assert res.status_code == 200
    assert res.json()["autorizacao"]["autoriza"] is None
    assert res.json()["completa"] is False
    assert db_session.query(TermoImagem).one().autorizacao is None  # "não respondido"


def test_autorizacao_ausente_do_corpo_tambem_e_aceita(client, matricula_termos, auth_termos):
    dados = corpo()
    del dados["autorizacao"]["autoriza"]

    res = client.put(_url(matricula_termos), json=dados, headers=auth_termos)

    assert res.status_code == 200
    assert res.json()["completa"] is False


@pytest.mark.parametrize("autoriza", [True, False])
def test_sim_e_nao_autoriza_sao_aceitos_e_completam_o_termo(client, db_session, matricula_termos, auth_termos, autoriza):
    res = client.put(_url(matricula_termos), json=corpo(autorizacao={"autoriza": autoriza}), headers=auth_termos)

    assert res.status_code == 200
    assert res.json()["autorizacao"]["autoriza"] is autoriza
    assert res.json()["completa"] is True
    assert db_session.query(TermoImagem).one().autorizacao is autoriza


def test_opcionais_vazios_sao_aceitos(client, matricula_termos, auth_termos):
    res = client.put(
        _url(matricula_termos),
        json=corpo(responsavel={"nacionalidade": None, "estado_civil": "  ", "rg": ""}),
        headers=auth_termos,
    )

    assert res.status_code == 200
    responsavel = res.json()["responsavel"]
    assert responsavel["nacionalidade"] is None
    assert responsavel["estado_civil"] is None  # só espaços = não preenchido
    assert responsavel["rg"] is None
    assert res.json()["completa"] is True


@pytest.mark.parametrize(
    "cpf",
    [
        "52998224724",  # dígito verificador errado
        "529.982.247-25",  # com pontuação: o backend só recebe dígitos
        "5299822472",  # 10 dígitos
        "529982247255",  # 12 dígitos
        "11111111111",  # sequência repetida
        "abcdefghijk",
    ],
)
def test_cpf_invalido_retorna_422(client, db_session, matricula_termos, auth_termos, cpf):
    res = client.put(_url(matricula_termos), json=corpo(responsavel={"cpf": cpf}), headers=auth_termos)

    assert res.status_code == 422
    assert _campos_com_erro(res) == {("responsavel", "cpf")}
    assert db_session.query(TermoImagem).count() == 0


def test_cpf_nao_tem_verificacao_de_unicidade(client, db_session, auth_termos):
    primeira = criar_matricula(db_session)
    segunda = criar_matricula(db_session)

    assert client.put(_url(primeira), json=corpo(), headers=auth_termos).status_code == 200
    assert client.put(_url(segunda), json=corpo(), headers=auth_termos).status_code == 200  # mesmo CPF


def test_data_futura_retorna_422(client, matricula_termos, auth_termos):
    res = client.put(
        _url(matricula_termos), json=corpo(autorizacao={"data": DEPOIS_DE_AMANHA}), headers=auth_termos
    )

    assert res.status_code == 422
    assert _campos_com_erro(res) == {("autorizacao", "data")}
    assert "não pode ser futura" in res.json()["detail"][0]["msg"]


def test_data_de_hoje_e_aceita(client, matricula_termos, auth_termos):
    hoje = hoje_sao_paulo().isoformat()

    res = client.put(_url(matricula_termos), json=corpo(autorizacao={"data": hoje}), headers=auth_termos)

    assert res.status_code == 200


@pytest.mark.parametrize("data", ["20/11/2026", "2026-13-45", "ontem", "2026-1-5"])
def test_data_fora_do_formato_iso_retorna_422(client, matricula_termos, auth_termos, data):
    res = client.put(_url(matricula_termos), json=corpo(autorizacao={"data": data}), headers=auth_termos)

    assert res.status_code == 422
    assert _campos_com_erro(res) == {("autorizacao", "data")}


def test_texto_maior_que_a_coluna_retorna_422(client, matricula_termos, auth_termos):
    res = client.put(
        _url(matricula_termos), json=corpo(responsavel={"residente_em": "x" * 301}), headers=auth_termos
    )

    assert res.status_code == 422
    assert _campos_com_erro(res) == {("responsavel", "residente_em")}
    assert "no máximo 300" in res.json()["detail"][0]["msg"]


def test_dados_do_aluno_sao_somente_leitura(client, db_session, matricula_termos, auth_termos):
    dados = corpo()
    dados["aluno"] = {"nome": "Nome Trocado", "data_nascimento": "2000-01-01"}

    res = client.put(_url(matricula_termos), json=dados, headers=auth_termos)

    assert res.status_code == 200
    assert res.json()["aluno"]["nome"] == "Ana Beatriz de Souza"
    db_session.refresh(matricula_termos.aluno)
    assert matricula_termos.aluno.nome == "Ana Beatriz de Souza"


def test_put_nao_altera_o_termo_de_outra_matricula_do_mesmo_aluno(client, db_session, auth_termos):
    matricula_2025 = criar_matricula(db_session, ano=2025)
    matricula_2026 = criar_matricula(db_session, aluno=matricula_2025.aluno, ano=2026)
    client.put(_url(matricula_2025), json=corpo(responsavel={"nome": "Responsável de 2025"}), headers=auth_termos)

    res = client.put(_url(matricula_2026), json=corpo(responsavel={"nome": "Responsável de 2026"}), headers=auth_termos)

    assert res.status_code == 200
    de_2025 = client.get(_url(matricula_2025), headers=auth_termos).json()
    de_2026 = client.get(_url(matricula_2026), headers=auth_termos).json()
    assert de_2025["responsavel"]["nome"] == "Responsável de 2025"
    assert de_2026["responsavel"]["nome"] == "Responsável de 2026"
    assert de_2025["aluno"]["ano_letivo"] == 2025 and de_2026["aluno"]["ano_letivo"] == 2026
    assert db_session.query(TermoImagem).count() == 2


def test_put_responde_em_menos_de_5_segundos(client, matricula_termos, auth_termos):
    inicio = time.perf_counter()
    res = client.put(_url(matricula_termos), json=corpo(), headers=auth_termos)
    duracao = time.perf_counter() - inicio

    assert res.status_code == 200
    assert duracao < 5


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
        f"/matriculas/999999/termo-imagem{sufixo}",
        json=corpo() if metodo == "put" else None,
        headers=auth_termos,
    )

    assert res.status_code == 404
    assert res.json()["detail"] == "Matrícula não encontrada."


# Histórico de edições (Operacao)

def _operacoes(db, tipo: Tipo) -> list[Operacao]:
    return db.query(Operacao).filter(Operacao.tipo == tipo).order_by(Operacao.id).all()


def test_primeiro_put_registra_preenchimento(client, db_session, test_user, matricula_termos, auth_termos):
    client.put(_url(matricula_termos), json=corpo(), headers=auth_termos)

    preenchimentos = _operacoes(db_session, Tipo.PREENCHIMENTO_TERMO_IMAGEM)
    assert len(preenchimentos) == 1
    operacao = preenchimentos[0]
    assert operacao.id_user == test_user.id
    assert operacao.id_aluno == matricula_termos.id_aluno
    assert operacao.data_op is not None
    assert "ano letivo 2026" in operacao.descricao
    assert _operacoes(db_session, Tipo.EDICAO_TERMO_IMAGEM) == []


def test_salvar_duas_vezes_o_mesmo_termo_gera_so_um_preenchimento(client, db_session, matricula_termos, auth_termos):
    primeira = client.put(_url(matricula_termos), json=corpo(), headers=auth_termos)
    segunda = client.put(_url(matricula_termos), json=corpo(), headers=auth_termos)

    assert segunda.status_code == 200
    assert len(_operacoes(db_session, Tipo.PREENCHIMENTO_TERMO_IMAGEM)) == 1
    assert _operacoes(db_session, Tipo.EDICAO_TERMO_IMAGEM) == []  # nada mudou
    assert segunda.json()["updated_at"] == primeira.json()["updated_at"]  # nem tocou na linha


def test_edicao_registra_os_nomes_dos_campos_sem_os_valores(client, db_session, test_user, matricula_termos, auth_termos):
    client.put(_url(matricula_termos), json=corpo(), headers=auth_termos)

    client.put(
        _url(matricula_termos),
        json=corpo(
            responsavel={"cpf": OUTRO_CPF_VALIDO, "nome": "Joana Pereira Lima", "rg": "7654321 SSP/DF"},
            autorizacao={"autoriza": False},
        ),
        headers=auth_termos,
    )

    edicoes = _operacoes(db_session, Tipo.EDICAO_TERMO_IMAGEM)
    assert len(edicoes) == 1
    descricao = edicoes[0].descricao
    assert edicoes[0].id_user == test_user.id
    assert edicoes[0].id_aluno == matricula_termos.id_aluno
    assert "ano letivo 2026" in descricao
    for campo_alterado in (
        "Responsável legal – nome",
        "Responsável legal – RG",
        "Responsável legal – CPF",
        "Autorização de uso de imagem",
    ):
        assert campo_alterado in descricao
    # O que não mudou não entra.
    assert "nacionalidade" not in descricao and "Local" not in descricao
    # LGPD: nenhum valor, só nomes de campos.
    for valor in (OUTRO_CPF_VALIDO, CPF_VALIDO, "Joana", "Pereira", "7654321", "Maria", "Rua das Flores"):
        assert valor not in descricao


def test_historico_nunca_guarda_dados_pessoais(client, db_session, matricula_termos, auth_termos):
    client.put(_url(matricula_termos), json=corpo(), headers=auth_termos)
    client.put(_url(matricula_termos), json=corpo(responsavel={"residente_em": "Quadra 5, Lote 7"}), headers=auth_termos)
    client.get(_url(matricula_termos, "/pdf"), headers=auth_termos)

    for operacao in db_session.query(Operacao).all():
        for dado in (CPF_VALIDO, "Maria", "Graças", "1234567", "Rua das Flores", "Quadra 5", "Ana Beatriz"):
            assert dado not in operacao.descricao


# Falhas: nada fica gravado pela metade (FE04)


@pytest.fixture
def historico_com_falha(monkeypatch):
    """Faz a gravação do histórico falhar DEPOIS de o termo já ter sido escrito na sessão."""

    def operacao_com_falha(*args, **kwargs):
        raise SQLAlchemyError("falha simulada no histórico")

    monkeypatch.setattr("app.services.service_historico.Operacao", operacao_com_falha)


def test_falha_no_primeiro_salvamento_nao_deixa_nada_gravado(
    client_real, db_real, matricula_real, auth_real, historico_com_falha
):
    res = client_real.put(_url(matricula_real), json=corpo(), headers=auth_real)

    assert res.status_code == 503
    assert res.json()["detail"] == "Não foi possível salvar. Tente novamente."
    db_real.expire_all()
    assert db_real.query(TermoImagem).count() == 0
    assert db_real.query(Operacao).count() == 0


def test_falha_na_edicao_mantem_o_termo_como_estava(client_real, db_real, matricula_real, auth_real, monkeypatch):
    assert client_real.put(_url(matricula_real), json=corpo(), headers=auth_real).status_code == 200
    operacoes_antes = db_real.query(Operacao).count()

    def operacao_com_falha(*args, **kwargs):
        raise SQLAlchemyError("falha simulada no histórico")

    monkeypatch.setattr("app.services.service_historico.Operacao", operacao_com_falha)
    res = client_real.put(
        _url(matricula_real),
        json=corpo(responsavel={"nome": "Outro Nome"}, autorizacao={"autoriza": False}),
        headers=auth_real,
    )

    assert res.status_code == 503
    db_real.expire_all()
    termo = db_real.query(TermoImagem).one()
    assert termo.resp_nome == "Maria das Graças Souza"
    assert termo.autorizacao is True
    assert db_real.query(Operacao).count() == operacoes_antes


def test_falha_de_banco_no_commit_retorna_503_e_nao_grava(client_real, db_real, matricula_real, auth_real):
    with patch("sqlalchemy.orm.Session.commit", side_effect=OperationalError("connection error", {}, None)):
        res = client_real.put(_url(matricula_real), json=corpo(), headers=auth_real)

    assert res.status_code == 503
    assert res.json()["detail"] == "Não foi possível salvar. Tente novamente."
    db_real.expire_all()
    assert db_real.query(TermoImagem).count() == 0
    assert db_real.query(Operacao).count() == 0


def test_falha_ao_consultar_retorna_503(client, matricula_termos, auth_termos):
    def falha(*args, **kwargs):
        raise OperationalError("connection error", {}, None)

    with patch("app.repository.repository_termos.buscar_matricula_com_termo_imagem", side_effect=falha):
        res = client.get(_url(matricula_termos), headers=auth_termos)

    assert res.status_code == 503


def test_falha_nao_registra_dados_pessoais_no_log(client_real, matricula_real, auth_real, historico_com_falha, caplog):
    with caplog.at_level(logging.DEBUG):
        res = client_real.put(_url(matricula_real), json=corpo(), headers=auth_real)

    assert res.status_code == 503
    for dado in (CPF_VALIDO, "Maria das Graças", "1234567", "Rua das Flores", "Águas Lindas"):
        assert dado not in caplog.text


# Texto integral e PDF

def test_rota_de_texto_devolve_o_texto_integral(client, auth_termos):
    res = client.get("/termos/uso-imagem/texto", headers=auth_termos)

    assert res.status_code == 200
    dados = res.json()
    assert dados["titulo"] == "Termo de Autorização de Uso de Imagem"
    texto = dados["texto"]
    assert "campanhas promocionais e institucionais" in texto
    for abrangencia in (
        "a título gratuito",
        "todo o território nacional e no exterior",
        "outdoor",
        "bus-door",
        "folhetos",
        "folder",
        "anúncios em revistas e jornais",
        "home page",
        "cartazes",
        "back-light",
        "mídia eletrônica",
    ):
        assert abrangencia in texto


@pular_sem_pdf
def test_pdf_baixa_com_cabecalhos_corretos_e_registra_a_exportacao(
    client, db_session, test_user, matricula_termos, auth_termos
):
    client.put(_url(matricula_termos), json=corpo(), headers=auth_termos)

    res = client.get(_url(matricula_termos, "/pdf"), headers=auth_termos)

    assert res.status_code == 200
    assert res.headers["content-type"] == "application/pdf"
    assert res.headers["cache-control"] == "no-store"
    assert res.headers["content-disposition"] == 'attachment; filename="termo-imagem-ana-beatriz-de-souza-2026.pdf"'
    assert res.content.startswith(b"%PDF")
    # A sessão continua renovando (RN17), mesmo a rota devolvendo a própria Response.
    assert res.headers.get("x-renewed-token")

    exportacoes = _operacoes(db_session, Tipo.EXPORTACAO_PDF)
    assert len(exportacoes) == 1
    assert exportacoes[0].id_user == test_user.id
    assert exportacoes[0].id_aluno == matricula_termos.id_aluno
    assert "ano letivo 2026" in exportacoes[0].descricao
    assert "uso de imagem" in exportacoes[0].descricao


@pular_sem_pdf
def test_texto_do_termo_e_o_mesmo_na_rota_e_no_pdf(client, matricula_termos, auth_termos):
    texto_da_rota = client.get("/termos/uso-imagem/texto", headers=auth_termos).json()["texto"]
    pdf = client.get(_url(matricula_termos, "/pdf"), headers=auth_termos).content

    texto_do_documento = texto_do_pdf(pdf)

    paragrafos = texto_da_rota.split("\n\n")
    assert len(paragrafos) >= 2
    for paragrafo in paragrafos:
        assert sem_espacos(paragrafo) in sem_espacos(texto_do_documento)


@pular_sem_pdf
def test_pdf_tem_todas_as_secoes_com_mascaras_e_opcao_marcada(client, matricula_termos, auth_termos):
    client.put(_url(matricula_termos), json=corpo(autorizacao={"autoriza": True, "data": "2026-03-09"}), headers=auth_termos)

    pdf = client.get(_url(matricula_termos, "/pdf"), headers=auth_termos).content
    texto = texto_do_pdf(pdf)

    for trecho in (
        "Termo de Autorização de Uso de Imagem",
        "Ano letivo 2026",
        "RESPONSÁVEL LEGAL",  # títulos de seção saem em caixa alta
        "ALUNO(A)",
        "AUTORIZAÇÃO",
        "Maria das Graças Souza",
        "Brasileira",
        "Solteira",
        "1234567 SSP/GO",
        "529.982.247-25",  # CPF com máscara
        ENDERECO_DO_ALUNO,
        "Ana Beatriz de Souza",
        "10/05/2022",  # nascimento em dd/mm/aaaa
        "Maternal I",
        "☒ Autorizo",
        "☐ Não autorizo",
        "Águas Lindas de Goiás",
        "09/03/2026",
        "Assinatura do responsável legal",
        "Página 1 de 1",
        "Gerado em",
    ):
        assert normalizar(trecho) in texto, trecho  # o texto extraído já vem normalizado (NFKC)


@pular_sem_pdf
def test_pdf_do_nao_autorizo_e_do_nao_respondido(client, matricula_termos, auth_termos):
    client.put(_url(matricula_termos), json=corpo(autorizacao={"autoriza": False}), headers=auth_termos)
    nao_autoriza = texto_do_pdf(client.get(_url(matricula_termos, "/pdf"), headers=auth_termos).content)
    assert "☐ Autorizo" in nao_autoriza and "☒ Não autorizo" in nao_autoriza

    client.put(_url(matricula_termos), json=corpo(autorizacao={"autoriza": None}), headers=auth_termos)
    sem_resposta = texto_do_pdf(client.get(_url(matricula_termos, "/pdf"), headers=auth_termos).content)
    assert "☐ Autorizo" in sem_resposta and "☐ Não autorizo" in sem_resposta
    assert "☒" not in sem_resposta  # as duas desmarcadas


@pular_sem_pdf
def test_pdf_sem_termo_salvo_sai_em_branco_com_a_sugestao_de_endereco(client, matricula_termos, auth_termos):
    res = client.get(_url(matricula_termos, "/pdf"), headers=auth_termos)

    assert res.status_code == 200
    texto = texto_do_pdf(res.content)
    assert "Ana Beatriz de Souza" in texto
    assert normalizar(ENDERECO_DO_ALUNO) in texto
    assert "☐ Autorizo" in texto and "☐ Não autorizo" in texto
    assert "Assinatura do responsável legal" in texto


@pytest.mark.parametrize("id_matricula", [0, -1, 2_147_483_648, 10**20])
def test_id_fora_do_intervalo_do_banco_retorna_404_e_nao_erro_de_banco(client, auth_termos, id_matricula):
    res = client.get(f"/matriculas/{id_matricula}/termo-imagem", headers=auth_termos)

    assert res.status_code == 404
    assert res.json()["detail"] == "Matrícula não encontrada."


def test_edicao_guarda_os_valores_no_historico_e_so_os_sensiveis_ficam_vazios(client, db_session, matricula_termos, auth_termos):
    client.put(_url(matricula_termos), json=corpo(), headers=auth_termos)
    client.put(
        _url(matricula_termos),
        json=corpo(
            responsavel={"cpf": OUTRO_CPF_VALIDO, "nome": "Joana Pereira Lima", "rg": "7654321 SSP/DF"},
            autorizacao={"autoriza": False},
        ),
        headers=auth_termos,
    )

    (edicao,) = _operacoes(db_session, Tipo.EDICAO_TERMO_IMAGEM)
    por_campo = {item["campo"]: item for item in edicao.alteracoes}
    assert por_campo["Responsável legal – nome"]["valor_novo"] == "Joana Pereira Lima"
    assert por_campo["Autorização de uso de imagem"]["valor_novo"] == "Não autoriza"
    assert por_campo["Responsável legal – CPF"] == {
        "ficha": por_campo["Responsável legal – CPF"]["ficha"],
        "campo": "Responsável legal – CPF",
        "valor_anterior": "",
        "valor_novo": "",
        "sensivel": True,
    }
    assert "Joana" not in edicao.descricao  # o resumo continua só com os nomes

