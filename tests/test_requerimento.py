"""Testes do Requerimento de matrícula (UC04 / issue #90)."""
import copy
import logging
import time
from datetime import timedelta
from unittest.mock import patch

import pytest
from sqlalchemy.exc import OperationalError, SQLAlchemyError

from app.core.tempo import hoje_sao_paulo
from app.models.aluno import Aluno, Raca, Sexo
from app.models.documentacao_civil import DocumentacaoCivil
from app.models.matricula import Matricula
from app.models.ops import Operacao, Tipo
from app.models.requerimento_matricula import RequerimentoMatricula
from app.models.saude import Saude
from app.schemas.requerimento import RequerimentoResponse
from app.services import service_pdf, service_requerimento
from tests.fixtures_termos import (  # noqa: F401  (fixtures importadas de propósito)
    CPF_VALIDO,
    OUTRO_CPF_VALIDO,
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

TERCEIRO_CPF_VALIDO = "12345678909"
NIS = "12345678901"
OUTRO_NIS = "10987654321"
ONTEM = (hoje_sao_paulo() - timedelta(days=1)).isoformat()
DEPOIS_DE_AMANHA = (hoje_sao_paulo() + timedelta(days=2)).isoformat()

ROTAS = [
    ("get", "/matriculas/1/requerimento"),
    ("put", "/matriculas/1/requerimento"),
    ("get", "/matriculas/1/requerimento/pdf"),
]


def _url(matricula, sufixo: str = "") -> str:
    return f"/matriculas/{matricula.id}/requerimento{sufixo}"


def minimo(**secoes) -> dict:
    """Só os obrigatórios, válidos. `secoes` troca campos de cada seção."""
    dados = {
        "dados_pessoais": {
            "nome": "Ana Beatriz de Souza",
            "data_nascimento": "2022-05-10",
            "sexo": "FEMININO",
            "cpf": CPF_VALIDO,
            "naturalidade": "Brasília",
            "uf": "DF",
            "nacionalidade": "Brasileira",
            "raca": "PARDO",
        },
        "matricula": {"ano_letivo": 2026, "data_matricula": "2026-02-02"},
        "endereco_contato": {"logradouro": "Rua das Flores", "cidade": "Águas Lindas de Goiás", "cep": "72910000"},
    }
    for secao, campos in secoes.items():
        dados.setdefault(secao, {})
        dados[secao].update(campos)
    return dados


def completo(**secoes) -> dict:
    """Ficha com todas as seções preenchidas."""
    dados = minimo()
    dados["dados_pessoais"]["nis"] = NIS
    dados["endereco_contato"].update(numero="10", bairro="Centro", uf="GO", telefone="61999998888")
    dados["documentacao_civil"] = {
        "rg": "1234567",
        "orgao_emissor": "SSP",
        "uf_rg": "GO",
        "data_expedicao": "2023-01-15",
        "tipo_certidao": "NASCIMENTO",
        "num_termo": "000123",
        "folha": "045",
        "livro": "A-12",
        "data_emissao_certidao": "2022-05-20",
        "nome_cartorio": "Cartório do 1º Ofício",
        "uf_cartorio": "DF",
        "documento_estrangeiro": None,
    }
    dados["filiacao"] = {
        "pai": {"nome": "João Carlos de Souza", "escolaridade": "Ensino médio completo", "local_trabalho": "Mercado Central", "telefone_trabalho": "6133334444"},
        "mae": {"nome": "Maria das Graças Souza", "escolaridade": "Superior completo", "local_trabalho": "Escola Estadual", "telefone_trabalho": "61988887777"},
    }
    dados["saude"] = {
        "problemas": ["ALERGIA", "OUTROS"],
        "observacao_problemas": "Intolerância a lactose",
        "acompanhamentos": ["FONOAUDIOLOGICO"],
        "observacao_acompanhamentos": None,
    }
    dados["termo_compromisso"] = {"nome_responsavel": "Maria das Graças Souza", "documentos_entregues": ["FOTO_3X4", "CARTAO_VACINA"]}
    dados["transferencia"] = {"data_pedido": "2026-01-10", "data_entrega": "2026-01-20", "nome_responsavel": "Maria das Graças Souza"}
    for secao, campos in secoes.items():
        dados.setdefault(secao, {})
        dados[secao].update(campos)
    return dados


def _campos_com_erro(resposta) -> set[tuple]:
    return {tuple(erro["loc"][1:]) for erro in resposta.json()["detail"]}


def _operacoes(db, tipo: Tipo) -> list[Operacao]:
    return db.query(Operacao).filter(Operacao.tipo == tipo).order_by(Operacao.id).all()


# GET


def test_get_sem_requerimento_devolve_dados_do_aluno_e_secoes_vazias(client, db_session, matricula_termos, auth_termos):
    res = client.get(_url(matricula_termos), headers=auth_termos)

    assert res.status_code == 200
    dados = res.json()
    aluno = matricula_termos.aluno
    assert dados["dados_pessoais"] == {
        "nome": "Ana Beatriz de Souza",
        "data_nascimento": "2022-05-10",
        "sexo": "FEMININO",
        "nis": None,
        "cpf": aluno.cpf,
        "naturalidade": None,
        "uf": "GO",
        "nacionalidade": "Brasileira",
        "raca": "PARDO",
    }
    assert dados["matricula"]["ano_letivo"] == 2026
    assert dados["matricula"]["ano_escolaridade"] == "Maternal I"  # somente leitura, vem da etapa
    assert dados["matricula"]["turma"] == aluno.turma.nome
    assert dados["endereco_contato"] == {
        "logradouro": "Rua das Flores",
        "numero": "10",
        "bairro": "Centro",
        "cidade": "Águas Lindas de Goiás",
        "uf": "GO",
        "cep": "72910000",  # gravado com hífen, devolvido só com dígitos
        "telefone": None,
    }
    assert dados["filiacao"]["pai"] == {"nome": None, "escolaridade": None, "local_trabalho": None, "telefone_trabalho": None}
    assert dados["saude"] == {"problemas": [], "observacao_problemas": None, "acompanhamentos": [], "observacao_acompanhamentos": None}
    assert dados["termo_compromisso"] == {"nome_responsavel": None, "documentos_entregues": []}
    assert dados["transferencia"] == {"data_pedido": None, "data_entrega": None, "nome_responsavel": None}
    assert all(v is None for v in dados["documentacao_civil"].values())
    assert dados["completa"] is False
    assert dados["created_at"] is None and dados["updated_at"] is None
    # Consultar não grava nada.
    assert db_session.query(RequerimentoMatricula).count() == 0
    assert db_session.query(Operacao).count() == 0


def test_get_traz_a_documentacao_civil_ja_cadastrada_do_aluno(client, db_session, auth_termos):
    matricula_2025 = criar_matricula(db_session, ano=2025)
    matricula_2026 = criar_matricula(db_session, aluno=matricula_2025.aluno, ano=2026)
    client.put(_url(matricula_2025), json=completo(matricula={"ano_letivo": 2025}), headers=auth_termos)

    dados = client.get(_url(matricula_2026), headers=auth_termos).json()

    assert dados["documentacao_civil"]["rg"] == "1234567"  # é do aluno, não da matrícula
    assert dados["filiacao"]["pai"]["nome"] is None  # o requerimento é por matrícula
    assert dados["completa"] is False


# PUT: criação, atualização, obrigatórios


def test_put_cria_a_ficha_e_segundo_put_atualiza_a_mesma(client, db_session, matricula_termos, auth_termos):
    res = client.put(_url(matricula_termos), json=completo(), headers=auth_termos)

    assert res.status_code == 200
    assert res.json()["completa"] is True
    assert res.json()["created_at"] is not None

    res = client.put(_url(matricula_termos), json=completo(filiacao={"pai": {"nome": "Outro Pai"}}), headers=auth_termos)

    assert res.status_code == 200
    assert res.json()["filiacao"]["pai"]["nome"] == "Outro Pai"
    assert db_session.query(RequerimentoMatricula).count() == 1
    assert db_session.query(Saude).count() == 1
    assert db_session.query(DocumentacaoCivil).count() == 1


def test_put_completo_devolve_todas_as_secoes(client, matricula_termos, auth_termos):
    dados = client.put(_url(matricula_termos), json=completo(), headers=auth_termos).json()

    assert dados["documentacao_civil"]["num_termo"] == "000123"  # zeros à esquerda mantidos
    assert dados["documentacao_civil"]["tipo_certidao"] == "NASCIMENTO"
    assert dados["filiacao"]["mae"]["telefone_trabalho"] == "61988887777"
    assert dados["endereco_contato"]["telefone"] == "61999998888"
    assert dados["saude"]["problemas"] == ["ALERGIA", "OUTROS"]
    assert dados["termo_compromisso"]["documentos_entregues"] == ["FOTO_3X4", "CARTAO_VACINA"]
    assert dados["transferencia"]["data_entrega"] == "2026-01-20"


def test_obrigatorios_preenchidos_e_opcionais_vazios_e_aceito(client, matricula_termos, auth_termos):
    res = client.put(_url(matricula_termos), json=minimo(), headers=auth_termos)

    assert res.status_code == 200
    assert res.json()["completa"] is True


def test_put_vazio_lista_todos_os_obrigatorios(client, db_session, matricula_termos, auth_termos):
    res = client.put(_url(matricula_termos), json={}, headers=auth_termos)

    assert res.status_code == 422
    assert _campos_com_erro(res) == {
        ("dados_pessoais", "nome"),
        ("dados_pessoais", "data_nascimento"),
        ("dados_pessoais", "sexo"),
        ("dados_pessoais", "cpf"),
        ("dados_pessoais", "naturalidade"),
        ("dados_pessoais", "uf"),
        ("dados_pessoais", "nacionalidade"),
        ("dados_pessoais", "raca"),
        ("matricula", "ano_letivo"),
        ("matricula", "data_matricula"),
        ("endereco_contato", "logradouro"),
        ("endereco_contato", "cidade"),
        ("endereco_contato", "cep"),
    }
    mensagens = " | ".join(e["msg"] for e in res.json()["detail"])
    for nome in ("Nome do aluno", "Data de nascimento", "Cor/raça", "Ano letivo", "Endereço – CEP"):
        assert nome in mensagens
    assert db_session.query(RequerimentoMatricula).count() == 0


def test_opcao_invalida_e_obrigatorios_vazios_vem_juntos(client, matricula_termos, auth_termos):
    res = client.put(
        _url(matricula_termos),
        json={"dados_pessoais": {"nome": "Ana", "sexo": "F"}, "matricula": {"ano_letivo": "dois mil"}},
        headers=auth_termos,
    )

    assert res.status_code == 422
    campos = _campos_com_erro(res)
    assert ("dados_pessoais", "sexo") in campos  # opção inválida
    assert ("matricula", "ano_letivo") in campos  # não é número
    assert ("dados_pessoais", "cpf") in campos and ("endereco_contato", "cep") in campos  # faltantes, juntos
    assert ("dados_pessoais", "nome") not in campos
    assert all(e["msg"].isascii() is False or "Input" not in e["msg"] for e in res.json()["detail"])  # tudo em português


def test_alterar_dados_pessoais_e_endereco_grava_no_aluno_e_na_matricula(client, db_session, matricula_termos, auth_termos):
    res = client.put(
        _url(matricula_termos),
        json=completo(
            dados_pessoais={"nome": "Ana Clara Souza", "sexo": "NAO_DECLARADO", "raca": "INDIGENA", "naturalidade": "Goiânia", "uf": "GO"},
            endereco_contato={"logradouro": "Quadra 5", "cep": "72915123", "uf": "DF"},
            matricula={"ano_letivo": 2027 if hoje_sao_paulo().year >= 2026 else 2026, "data_matricula": "2026-03-01"},
        ),
        headers=auth_termos,
    )

    assert res.status_code == 200
    aluno = db_session.get(Aluno, matricula_termos.id_aluno)
    db_session.refresh(aluno)
    assert aluno.nome == "Ana Clara Souza"
    assert aluno.sexo == Sexo.NAO_DECLARADO and aluno.raca == Raca.INDIGENA
    assert aluno.naturalidade == "Goiânia" and aluno.uf == "GO"
    assert aluno.cpf == CPF_VALIDO and aluno.nis == NIS
    assert aluno.logradouro == "Quadra 5" and aluno.cep == "72915123" and aluno.uf_residencia == "DF"
    matricula = db_session.get(Matricula, matricula_termos.id)
    db_session.refresh(matricula)
    assert matricula.data_matricula.isoformat() == "2026-03-01"
    # O termo de imagem passa a sugerir o endereço novo, com o CEP formatado.
    termo = client.get(f"/matriculas/{matricula_termos.id}/termo-imagem", headers=auth_termos).json()
    assert termo["responsavel"]["residente_em"] == "Quadra 5, nº 10, Centro, Águas Lindas de Goiás/DF, CEP 72915-123"


def test_ano_de_escolaridade_e_turma_sao_somente_leitura(client, db_session, matricula_termos, auth_termos):
    turma_antes = matricula_termos.aluno.turma_id
    dados = completo(matricula={"ano_escolaridade": "Outra etapa", "turma": "Outra turma"})

    res = client.put(_url(matricula_termos), json=dados, headers=auth_termos)

    assert res.status_code == 200
    assert res.json()["matricula"]["ano_escolaridade"] == "Maternal I"
    db_session.refresh(matricula_termos.aluno)
    assert matricula_termos.aluno.turma_id == turma_antes


def test_listas_sao_gravadas_com_os_valores_do_enum(client, db_session, matricula_termos, auth_termos):
    client.put(_url(matricula_termos), json=completo(), headers=auth_termos)

    rm = db_session.query(RequerimentoMatricula).one()
    assert rm.documentos_entregues == ["2 fotos 3x4", "cartão vacina"]  # valores de TipoDocumento
    assert rm.saude.tipo == ["ALERGIA", "OUTROS"]
    assert rm.saude.acomp == ["FONOAUDIOLOGICO"]


def test_salvar_nao_altera_o_requerimento_de_outra_matricula(client, db_session, auth_termos):
    matricula_2025 = criar_matricula(db_session, ano=2025)
    matricula_2026 = criar_matricula(db_session, aluno=matricula_2025.aluno, ano=2026)
    client.put(_url(matricula_2025), json=completo(matricula={"ano_letivo": 2025}, filiacao={"pai": {"nome": "Pai de 2025"}}), headers=auth_termos)

    client.put(_url(matricula_2026), json=completo(filiacao={"pai": {"nome": "Pai de 2026"}}), headers=auth_termos)

    assert client.get(_url(matricula_2025), headers=auth_termos).json()["filiacao"]["pai"]["nome"] == "Pai de 2025"
    assert client.get(_url(matricula_2026), headers=auth_termos).json()["filiacao"]["pai"]["nome"] == "Pai de 2026"
    assert db_session.query(RequerimentoMatricula).count() == 2
    assert db_session.query(DocumentacaoCivil).count() == 1  # a documentação é uma só, do aluno


def test_put_responde_em_menos_de_5_segundos(client, matricula_termos, auth_termos):
    inicio = time.perf_counter()
    res = client.put(_url(matricula_termos), json=completo(), headers=auth_termos)
    duracao = time.perf_counter() - inicio

    assert res.status_code == 200
    assert duracao < 5


# Duplicidade (409)


def test_cpf_de_outro_aluno_retorna_409(client, db_session, matricula_termos, auth_termos):
    outro = criar_aluno(db_session, nome="Outro Aluno", cpf=OUTRO_CPF_VALIDO)
    db_session.commit()

    res = client.put(_url(matricula_termos), json=minimo(dados_pessoais={"cpf": outro.cpf}), headers=auth_termos)

    assert res.status_code == 409
    assert res.json()["detail"] == "Já existe um aluno cadastrado com este CPF."
    assert db_session.query(RequerimentoMatricula).count() == 0


def test_nis_de_outro_aluno_retorna_409(client, db_session, matricula_termos, auth_termos):
    criar_aluno(db_session, nome="Outro Aluno", nis=OUTRO_NIS)
    db_session.commit()

    res = client.put(_url(matricula_termos), json=minimo(dados_pessoais={"nis": OUTRO_NIS}), headers=auth_termos)

    assert res.status_code == 409
    assert res.json()["detail"] == "Já existe um aluno cadastrado com este NIS."


def test_rg_de_outro_aluno_na_mesma_uf_retorna_409_e_em_outra_uf_e_aceito(client, db_session, auth_termos):
    primeira = criar_matricula(db_session)
    segunda = criar_matricula(db_session)
    client.put(_url(primeira), json=completo(), headers=auth_termos)
    doc = {"rg": "1234567", "uf_rg": "GO", "data_emissao_certidao": None}

    res = client.put(_url(segunda), json=minimo(dados_pessoais={"cpf": OUTRO_CPF_VALIDO}, documentacao_civil=doc), headers=auth_termos)
    assert res.status_code == 409
    assert res.json()["detail"] == "Já existe um aluno cadastrado com este RG nesta UF."

    doc["uf_rg"] = "DF"
    res = client.put(_url(segunda), json=minimo(dados_pessoais={"cpf": OUTRO_CPF_VALIDO}, documentacao_civil=doc), headers=auth_termos)
    assert res.status_code == 200


def test_salvar_de_novo_com_o_proprio_cpf_nis_e_rg_nao_e_duplicidade(client, matricula_termos, auth_termos):
    assert client.put(_url(matricula_termos), json=completo(), headers=auth_termos).status_code == 200
    assert client.put(_url(matricula_termos), json=completo(), headers=auth_termos).status_code == 200


def test_conflito_pego_pelo_banco_tambem_vira_409(client_real, db_real, matricula_real, auth_real):
    """Dois salvamentos ao mesmo tempo: a conferência passa, mas o banco recusa no commit."""
    outro = criar_aluno(db_real, nome="Outro Aluno", cpf=OUTRO_CPF_VALIDO)
    db_real.commit()

    with patch("app.repository.repository_matricula.existe_outro_aluno_com_cpf", return_value=False):
        res = client_real.put(_url(matricula_real), json=minimo(dados_pessoais={"cpf": outro.cpf}), headers=auth_real)

    assert res.status_code == 409
    assert res.json()["detail"] == "Já existe um aluno cadastrado com este CPF."
    db_real.expire_all()
    assert db_real.query(RequerimentoMatricula).count() == 0


# Validações (422)


@pytest.mark.parametrize(
    "secoes,campo",
    [
        ({"dados_pessoais": {"cpf": "52998224724"}}, ("dados_pessoais", "cpf")),  # dígito verificador
        ({"dados_pessoais": {"cpf": "529.982.247-25"}}, ("dados_pessoais", "cpf")),  # com pontuação
        ({"dados_pessoais": {"nis": "1234567890"}}, ("dados_pessoais", "nis")),
        ({"dados_pessoais": {"uf": "XX"}}, ("dados_pessoais", "uf")),
        ({"dados_pessoais": {"uf": "go"}}, ("dados_pessoais", "uf")),
        ({"dados_pessoais": {"data_nascimento": DEPOIS_DE_AMANHA}}, ("dados_pessoais", "data_nascimento")),
        ({"dados_pessoais": {"data_nascimento": "10/05/2022"}}, ("dados_pessoais", "data_nascimento")),
        ({"dados_pessoais": {"raca": "Parda"}}, ("dados_pessoais", "raca")),
        ({"matricula": {"ano_letivo": 1999}}, ("matricula", "ano_letivo")),
        ({"endereco_contato": {"cep": "72910-000"}}, ("endereco_contato", "cep")),
        ({"endereco_contato": {"telefone": "(61)99999-8888"}}, ("endereco_contato", "telefone")),
        ({"endereco_contato": {"uf": "XX"}}, ("endereco_contato", "uf")),
        ({"filiacao": {"pai": {"telefone_trabalho": "999"}}}, ("filiacao", "pai", "telefone_trabalho")),
        ({"documentacao_civil": {"uf_cartorio": "ZZ"}}, ("documentacao_civil", "uf_cartorio")),
        ({"documentacao_civil": {"data_emissao_certidao": "2022-05-09"}}, ("documentacao_civil", "data_emissao_certidao")),
        ({"documentacao_civil": {"tipo_certidao": "OBITO"}}, ("documentacao_civil", "tipo_certidao")),
        ({"transferencia": {"data_entrega": "2026-01-20"}}, ("transferencia", "data_pedido")),
        ({"transferencia": {"data_pedido": "2026-02-01", "data_entrega": "2026-01-20"}}, ("transferencia", "data_entrega")),
        ({"saude": {"problemas": ["OUTROS"]}}, ("saude", "observacao_problemas")),
        ({"saude": {"acompanhamentos": ["OUTROS"], "observacao_acompanhamentos": "  "}}, ("saude", "observacao_acompanhamentos")),
        ({"saude": {"problemas": ["CABECA"]}}, ("saude", "problemas", 0)),
        ({"saude": {"problemas": ["FALA", "FALA"]}}, ("saude", "problemas", 1)),
        ({"termo_compromisso": {"documentos_entregues": ["2 fotos 3x4"]}}, ("termo_compromisso", "documentos_entregues", 0)),
        ({"dados_pessoais": {"nome": "x" * 101}}, ("dados_pessoais", "nome")),
    ],
)
def test_dados_invalidos_retornam_422_no_campo_certo(client, db_session, matricula_termos, auth_termos, secoes, campo):
    dados = minimo()
    for secao, campos in secoes.items():
        if secao == "filiacao":
            dados["filiacao"] = copy.deepcopy(campos)
        else:
            dados.setdefault(secao, {}).update(campos)

    res = client.put(_url(matricula_termos), json=dados, headers=auth_termos)

    assert res.status_code == 422
    assert campo in _campos_com_erro(res)
    assert db_session.query(RequerimentoMatricula).count() == 0


def test_data_futura_e_aceita_na_matricula_e_na_transferencia(client, matricula_termos, auth_termos):
    res = client.put(
        _url(matricula_termos),
        json=minimo(matricula={"data_matricula": DEPOIS_DE_AMANHA}, transferencia={"data_pedido": DEPOIS_DE_AMANHA}),
        headers=auth_termos,
    )

    assert res.status_code == 200


# Autenticação e matrícula inexistente


@pytest.mark.parametrize("metodo,caminho", ROTAS)
def test_rotas_sem_token_retornam_401(client, metodo, caminho):
    assert client.request(metodo, caminho, json=minimo() if metodo == "put" else None).status_code == 401


@pytest.mark.parametrize("metodo,caminho", ROTAS)
def test_usuario_inativo_e_recusado(client, inactive_user, metodo, caminho):
    res = client.request(metodo, caminho, json=minimo() if metodo == "put" else None, headers=cabecalhos(inactive_user))

    assert res.status_code == 403


@pytest.mark.parametrize("metodo,sufixo", [("get", ""), ("put", ""), ("get", "/pdf")])
@pytest.mark.parametrize("id_matricula", [999999, 0, 2_147_483_648])
def test_matricula_inexistente_retorna_404(client, auth_termos, metodo, sufixo, id_matricula):
    res = client.request(
        metodo, f"/matriculas/{id_matricula}/requerimento{sufixo}", json=minimo() if metodo == "put" else None, headers=auth_termos
    )

    assert res.status_code == 404
    assert res.json()["detail"] == "Matrícula não encontrada."


# Histórico (Operacao)


def test_primeiro_salvamento_registra_preenchimento(client, db_session, test_user, matricula_termos, auth_termos):
    client.put(_url(matricula_termos), json=completo(), headers=auth_termos)

    operacoes = _operacoes(db_session, Tipo.PREENCHIMENTO_REQUERIMENTO)
    assert len(operacoes) == 1
    assert operacoes[0].id_user == test_user.id
    assert operacoes[0].id_aluno == matricula_termos.id_aluno
    assert operacoes[0].data_op is not None
    assert operacoes[0].descricao == "Requerimento de matrícula preenchido (ano letivo 2026)."
    assert _operacoes(db_session, Tipo.EDICAO_REQUERIMENTO) == []


def test_salvar_sem_mudancas_nao_registra_edicao(client, db_session, matricula_termos, auth_termos):
    primeira = client.put(_url(matricula_termos), json=completo(), headers=auth_termos)
    # Listas em outra ordem também não são mudança.
    segunda = client.put(
        _url(matricula_termos), json=completo(saude={"problemas": ["OUTROS", "ALERGIA"]}), headers=auth_termos
    )

    assert segunda.status_code == 200
    assert _operacoes(db_session, Tipo.EDICAO_REQUERIMENTO) == []
    assert segunda.json()["updated_at"] == primeira.json()["updated_at"]


def test_edicao_registra_os_nomes_dos_campos_sem_os_valores(client, db_session, test_user, matricula_termos, auth_termos):
    client.put(_url(matricula_termos), json=completo(), headers=auth_termos)

    client.put(
        _url(matricula_termos),
        json=completo(
            dados_pessoais={"nome": "Ana Clara Mendes", "cpf": TERCEIRO_CPF_VALIDO, "raca": "PRETO"},
            saude={"problemas": ["VISAO"], "observacao_problemas": None},
            documentacao_civil={"rg": "7654321"},
        ),
        headers=auth_termos,
    )

    edicoes = _operacoes(db_session, Tipo.EDICAO_REQUERIMENTO)
    assert len(edicoes) == 1
    descricao = edicoes[0].descricao
    assert edicoes[0].id_user == test_user.id and edicoes[0].id_aluno == matricula_termos.id_aluno
    for campo in (
        "Nome do aluno",
        "CPF",
        "Cor/raça",
        "Documentação civil – nº do RG",
        "Saúde – problemas de saúde",
        "Saúde – observação dos problemas de saúde",
    ):
        assert campo in descricao
    assert "Filiação" not in descricao and "Transferência" not in descricao
    # LGPD: nenhum valor (nem os novos, nem os antigos).
    for valor in ("Ana", "Mendes", TERCEIRO_CPF_VALIDO, CPF_VALIDO, "Preta", "PRETO", "Parda", "7654321", "1234567", "VISAO", "Visão", "lactose"):
        assert valor not in descricao


def test_edicao_so_de_dados_do_aluno_atualiza_updated_at(client, matricula_termos, auth_termos):
    primeira = client.put(_url(matricula_termos), json=completo(), headers=auth_termos)
    time.sleep(1.1)

    segunda = client.put(_url(matricula_termos), json=completo(dados_pessoais={"nome": "Outro Nome"}), headers=auth_termos)

    assert segunda.json()["updated_at"] > primeira.json()["updated_at"]


def test_historico_nunca_guarda_dados_pessoais(client, db_session, matricula_termos, auth_termos):
    client.put(_url(matricula_termos), json=completo(), headers=auth_termos)
    client.put(_url(matricula_termos), json=completo(endereco_contato={"logradouro": "Quadra 9"}), headers=auth_termos)
    client.get(_url(matricula_termos, "/pdf"), headers=auth_termos)

    for operacao in db_session.query(Operacao).all():
        for dado in (CPF_VALIDO, NIS, "Ana Beatriz", "Maria das Graças", "Rua das Flores", "Quadra 9", "lactose", "1234567", "Parda"):
            assert dado not in operacao.descricao


# Falhas: nada fica gravado pela metade (FE04)


@pytest.fixture
def historico_com_falha(monkeypatch):
    """Faz a gravação do histórico falhar DEPOIS de aluno, matrícula e ficha já estarem na sessão."""

    def operacao_com_falha(*args, **kwargs):
        raise SQLAlchemyError("falha simulada no histórico")

    monkeypatch.setattr("app.services.service_historico.Operacao", operacao_com_falha)


def test_falha_no_primeiro_salvamento_nao_deixa_nada_gravado(client_real, db_real, matricula_real, auth_real, historico_com_falha):
    nome_antes = matricula_real.aluno.nome

    res = client_real.put(
        _url(matricula_real), json=completo(dados_pessoais={"nome": "Nome Novo"}, matricula={"data_matricula": "2026-03-03"}), headers=auth_real
    )

    assert res.status_code == 503
    assert res.json()["detail"] == "Não foi possível salvar. Tente novamente."
    db_real.expire_all()
    assert db_real.get(Aluno, matricula_real.id_aluno).nome == nome_antes
    assert db_real.get(Matricula, matricula_real.id).data_matricula.isoformat() != "2026-03-03"
    assert db_real.query(RequerimentoMatricula).count() == 0
    assert db_real.query(Saude).count() == 0
    assert db_real.query(DocumentacaoCivil).count() == 0
    assert db_real.query(Operacao).count() == 0


def test_falha_na_edicao_mantem_a_ficha_como_estava(client_real, db_real, matricula_real, auth_real, monkeypatch):
    assert client_real.put(_url(matricula_real), json=completo(), headers=auth_real).status_code == 200
    operacoes_antes = db_real.query(Operacao).count()

    def operacao_com_falha(*args, **kwargs):
        raise SQLAlchemyError("falha simulada no histórico")

    monkeypatch.setattr("app.services.service_historico.Operacao", operacao_com_falha)
    res = client_real.put(
        _url(matricula_real),
        json=completo(dados_pessoais={"nome": "Nome Novo"}, documentacao_civil={"rg": "999"}, saude={"problemas": ["FALA"], "observacao_problemas": None}),
        headers=auth_real,
    )

    assert res.status_code == 503
    db_real.expire_all()
    assert db_real.get(Aluno, matricula_real.id_aluno).nome == "Ana Beatriz de Souza"
    assert db_real.query(DocumentacaoCivil).one().rg == "1234567"
    assert db_real.query(Saude).one().tipo == ["ALERGIA", "OUTROS"]
    assert db_real.query(Operacao).count() == operacoes_antes


def test_falha_de_banco_no_commit_retorna_503_e_nao_grava(client_real, db_real, matricula_real, auth_real):
    with patch("sqlalchemy.orm.Session.commit", side_effect=OperationalError("connection error", {}, None)):
        res = client_real.put(_url(matricula_real), json=completo(), headers=auth_real)

    assert res.status_code == 503
    db_real.expire_all()
    assert db_real.query(RequerimentoMatricula).count() == 0
    assert db_real.query(Operacao).count() == 0


def test_falha_ao_consultar_retorna_503(client, matricula_termos, auth_termos):
    with patch(
        "app.repository.repository_matricula.buscar_matricula_com_requerimento",
        side_effect=OperationalError("connection error", {}, None),
    ):
        res = client.get(_url(matricula_termos), headers=auth_termos)

    assert res.status_code == 503


def test_falha_nao_registra_dados_pessoais_no_log(client_real, matricula_real, auth_real, historico_com_falha, caplog):
    with caplog.at_level(logging.DEBUG):
        res = client_real.put(_url(matricula_real), json=completo(), headers=auth_real)

    assert res.status_code == 503
    for dado in (CPF_VALIDO, NIS, "Maria das Graças", "lactose", "1234567", "Rua das Flores"):
        assert dado not in caplog.text


# PDF


def _ficha(client, matricula, auth) -> RequerimentoResponse:
    return RequerimentoResponse.model_validate(client.get(_url(matricula), headers=auth).json())


def test_contexto_do_pdf_lista_todas_as_opcoes_com_as_escolhidas_marcadas(client, matricula_termos, auth_termos):
    client.put(_url(matricula_termos), json=completo(), headers=auth_termos)

    contexto = service_requerimento.montar_contexto_pdf(_ficha(client, matricula_termos, auth_termos))

    problemas = {item["rotulo"]: item["marcada"] for item in contexto["saude"]["problemas"]}
    assert len(problemas) == 8 and problemas["Alergia"] and problemas["Outros"] and not problemas["Visão"]
    documentos = {item["rotulo"]: item["marcada"] for item in contexto["compromisso"]["documentos"]}
    assert documentos == {
        "2 fotos 3x4": True,
        "Comprovante de residência": False,
        "Certidão de nascimento": False,
        "Histórico escolar": False,
        "Cartão de vacina": True,
    }
    assert contexto["pessoais"]["sexo"] == "Feminino" and contexto["pessoais"]["raca"] == "Parda"
    assert contexto["documentacao"]["tipo_certidao"] == "Certidão de nascimento"


def test_html_digitado_no_formulario_aparece_como_texto(client, matricula_termos, auth_termos):
    nome_com_html = '<script>alert("x")</script><b>Ana</b>'
    client.put(_url(matricula_termos), json=completo(dados_pessoais={"nome": nome_com_html}), headers=auth_termos)

    contexto = service_requerimento.montar_contexto_pdf(_ficha(client, matricula_termos, auth_termos))
    html = service_pdf.renderizar_html(service_requerimento.TEMPLATE_PDF, contexto)

    assert "<script>" not in html and "<b>Ana</b>" not in html
    assert "&lt;script&gt;" in html and "&lt;b&gt;Ana&lt;/b&gt;" in html


@pular_sem_pdf
def test_pdf_baixa_com_cabecalhos_corretos_e_registra_a_exportacao(client, db_session, test_user, matricula_termos, auth_termos):
    client.put(_url(matricula_termos), json=completo(), headers=auth_termos)

    res = client.get(_url(matricula_termos, "/pdf"), headers=auth_termos)

    assert res.status_code == 200
    assert res.headers["content-type"] == "application/pdf"
    assert res.headers["cache-control"] == "no-store"
    assert res.headers["content-disposition"] == 'attachment; filename="requerimento-ana-beatriz-de-souza-2026.pdf"'
    assert res.content.startswith(b"%PDF")
    assert res.headers.get("x-renewed-token")  # RN17: a sessão continua renovando

    exportacoes = _operacoes(db_session, Tipo.EXPORTACAO_PDF)
    assert len(exportacoes) == 1
    assert exportacoes[0].id_user == test_user.id and exportacoes[0].id_aluno == matricula_termos.id_aluno
    assert exportacoes[0].descricao == "Requerimento de matrícula exportado em PDF (ano letivo 2026)."


@pular_sem_pdf
def test_pdf_tem_todas_as_secoes_mascaras_e_opcoes_marcadas(client, matricula_termos, auth_termos):
    client.put(_url(matricula_termos), json=completo(), headers=auth_termos)

    texto = texto_do_pdf(client.get(_url(matricula_termos, "/pdf"), headers=auth_termos).content)

    for trecho in (
        "SECRETARIA MUNICIPAL DE EDUCAÇÃO",
        "Requerimento de Matrícula",
        "Escola municipal: Centro de Educação Infantil Sociedade Estação Vida",
        "INEP",
        "02/02/2026",  # data da matrícula
        "DADOS PESSOAIS DO ALUNO",
        "DOCUMENTAÇÃO CIVIL",
        "FILIAÇÃO",
        "ENDEREÇO E CONTATO",
        "SAÚDE",
        "TERMO DE COMPROMISSO",
        "TRANSFERÊNCIA",
        "Ana Beatriz de Souza",
        "529.982.247-25",  # CPF
        "123.45678.90-1",  # NIS
        "(61) 99999-8888",  # telefone
        "(61) 3333-4444",
        "72910-000",  # CEP
        "10/05/2022",
        "Maternal I",
        "Feminino",
        "Parda",
        "Certidão de nascimento",
        "000123",
        "João Carlos de Souza",
        "☒ Alergia",
        "☐ Visão",
        "☒ Outros",
        "Intolerância a lactose",
        "☒ Fonoaudiológico",
        "☒ 2 fotos 3x4",
        "☐ Histórico escolar",
        "20/01/2026",
        "Ass. do responsável pela matrícula",
        "RENOVAÇÕES DE MATRÍCULA",
        "prazo de 30 (trinta) dias",
        "Eu, Maria das Graças Souza, estou ciente",
        "Secretário(a) Escolar",
        "Diretor(a)",
        "Gerado em",
    ):
        assert normalizar(trecho) in texto, trecho


@pular_sem_pdf
def test_pdf_sem_requerimento_sai_com_os_dados_do_aluno_e_o_resto_em_branco(client, matricula_termos, auth_termos):
    res = client.get(_url(matricula_termos, "/pdf"), headers=auth_termos)

    assert res.status_code == 200
    texto = texto_do_pdf(res.content)
    assert "Ana Beatriz de Souza" in texto
    assert "TRANSFERÊNCIA" in texto  # exibida mesmo vazia
    assert "☒" not in texto
