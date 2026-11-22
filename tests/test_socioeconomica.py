import copy
import json
import time
from datetime import date, timedelta
from decimal import Decimal
from types import SimpleNamespace
from unittest.mock import patch

import pytest
from pydantic import ValidationError
from sqlalchemy.exc import OperationalError

from app.core.config import settings
from app.core.security import create_access_token
from app.core.validadores import (
    normalizar_cep,
    normalizar_telefone,
    validar_dinheiro,
    validar_uf,
)
from app.models.aluno import Aluno, Raca, Sexo, StatusAluno
from app.models.etapa import Etapa
from app.models.familiar import Familiar
from app.models.ficha_socioeco import FichaSocioeconomica, SituacaoMoradia as SituacaoMoradiaModelo
from app.models.matricula import Matricula
from app.models.ops import Operacao, Tipo
from app.models.pessoa import Pessoa
from app.models.requerimento_matricula import RequerimentoMatricula
from app.models.responsavel import Responsavel
from app.models.turma import StatusTurma, Turma
from app.schemas.schema_ficha_socioeconomica import (
    ContatosSchema,
    DeclaracaoSchema,
    EnderecoSchema,
    FichaSocioeconomicaEntrada,
    FichaSocioeconomicaResposta,
    MembroFamiliaSchema,
    MoradiaSchema,
    NucleoFamiliarSchema,
    OutrasPropriedadesSchema,
    campos_faltantes,
)
from app.services import service_pdf
from app.services import service_socioeconomica as service

# O PDF só é gerado se o WeasyPrint (e as bibliotecas do sistema, como o Pango) carregarem.
try:
    import weasyprint  # noqa: F401

    WEASYPRINT_OK = True
except (ImportError, OSError):
    WEASYPRINT_OK = False

requer_weasyprint = pytest.mark.skipif(
    not WEASYPRINT_OK, reason="WeasyPrint (ou Pango) não está disponível neste ambiente"
)


def get_auth_headers(user) -> dict:
    token = create_access_token(data={"sub": str(user.id)})
    return {"Authorization": f"Bearer {token}"}


def payload_valido() -> dict:
    """Corpo de um PUT com todos os campos obrigatórios preenchidos."""
    return {
        "endereco": {
            "logradouro": "Quadra 55 Conjunto A",
            "numero": "35",
            "bairro": "Setor 05",
            "cidade": "Águas Lindas de Goiás",
            "uf_residencia": "GO",
            "cep": "72910-565",
        },
        "contato": {
            "telefone_contato": "(61) 3333-4444",
            "celular": "(61) 99999-8888",
            "email": "responsavel@exemplo.com",
        },
        "moradia": {"situacao": "ALUGADO", "valor": "850.50"},
        "transporte": {"meio": "TRANSPORTE_COLETIVO"},
        "nucleo_familiar": {
            "membros": [
                {
                    "tipo": "Mãe",
                    "idade": 32,
                    "profissao": "Costureira",
                    "estado_civil": "Solteira",
                    "escolaridade": "Ensino médio",
                    "renda_mensal": "1500.00",
                },
                {"tipo": "Irmão", "idade": 9},
            ],
            "observacoes": "Pais separados há 3 anos",
        },
        "outras_propriedades": {"possui": False},
        "declaracao": {
            "nome": "Maria da Silva",
            "local": "Águas Lindas de Goiás",
            "data": "2026-03-09",
        },
    }


def url(id_matricula, sufixo="") -> str:
    return f"/matriculas/{id_matricula}/socioeconomica{sufixo}"


def _dec(valor) -> Decimal:
    return Decimal(str(valor))


def _sem_datas(corpo: dict) -> dict:
    corpo = copy.deepcopy(corpo)
    corpo.pop("created_at", None)
    corpo.pop("updated_at", None)
    return corpo


# ----------------- FIXTURES -----------------


@pytest.fixture
def aluno(db_session):
    """Aluno com turma, etapa e responsável, endereço antigo e telefone próprio."""
    etapa = Etapa(nome="Maternal II")
    db_session.add(etapa)
    db_session.commit()

    turma = Turma(nome="Turma Girassol", id_etapa=etapa.id, status=StatusTurma.ATIVO)
    db_session.add(turma)

    pessoa = Pessoa(nome="Maria da Silva", cpf="12345678901", data_nasc=date(1990, 1, 1))
    db_session.add(pessoa)
    db_session.flush()

    resp = Responsavel(id_pessoa=pessoa.id, telefone="61999998888", email="mae@exemplo.com")
    db_session.add(resp)
    db_session.flush()

    obj = Aluno(
        nome="Ana Clara de Sá",
        data_nasc=date(2022, 5, 10),
        cpf="11122233344",
        nis="12345678901",
        sexo=Sexo.FEMININO,
        raca=Raca.PARDO,
        nacionalidade="Brasileira",
        naturalidade="Brasília",
        uf="DF",
        logradouro="Rua Antiga",
        numero=None,
        bairro=None,
        cidade="Águas Lindas de Goiás",
        uf_residencia="GO",
        cep="72910-565",  # com hífen: dado legado não pode quebrar o GET
        telefone="61911112222",
        status=StatusAluno.ATIVO,
        responsavel_id=resp.id,
        turma_id=turma.id,
    )
    db_session.add(obj)
    db_session.commit()
    db_session.refresh(obj)
    return obj


@pytest.fixture
def matricula(db_session, aluno):
    """Matrícula de 2026 do aluno, ainda sem ficha."""
    obj = Matricula(ano=2026, id_aluno=aluno.id, data_matricula=date(2026, 1, 15))
    db_session.add(obj)
    db_session.commit()
    db_session.refresh(obj)
    return obj


@pytest.fixture
def matricula_outro_ano(db_session, aluno):
    """Matrícula de 2025 do mesmo aluno (cada ano letivo tem a sua ficha)."""
    obj = Matricula(ano=2025, id_aluno=aluno.id, data_matricula=date(2025, 1, 20))
    db_session.add(obj)
    db_session.commit()
    db_session.refresh(obj)
    return obj


@pytest.fixture
def requerimento(db_session, matricula):
    obj = RequerimentoMatricula(
        id_matricula=matricula.id, nome_mae="Maria Souza", nome_pai="João Souza"
    )
    db_session.add(obj)
    db_session.commit()
    return obj


def _salvar(client, headers, id_matricula, corpo=None):
    return client.put(url(id_matricula), json=corpo or payload_valido(), headers=headers)


# ----------------- TESTES UNITÁRIOS: VALIDADORES -----------------


@pytest.mark.parametrize("entrada,esperado", [
    ("70.000-000", "70000000"),
    ("72910565", "72910565"),
    (" 72910-565 ", "72910565"),
])
def test_normalizar_cep_aceita_formatos_e_devolve_so_digitos(entrada, esperado):
    """CEP com máscara ou espaços é normalizado para 8 dígitos."""
    assert normalizar_cep(entrada) == esperado


@pytest.mark.parametrize("entrada", ["123", "1234567890", "", None, "abcdefgh"])
def test_normalizar_cep_recusa_valores_invalidos(entrada):
    """CEP que não tem exatamente 8 dígitos é recusado."""
    with pytest.raises(ValueError):
        normalizar_cep(entrada)


@pytest.mark.parametrize("entrada,esperado", [
    ("(61) 99999-8888", "61999998888"),
    ("6133334444", "6133334444"),
])
def test_normalizar_telefone_aceita_10_ou_11_digitos(entrada, esperado):
    """Telefone fixo (10) e celular (11) são aceitos e normalizados."""
    assert normalizar_telefone(entrada) == esperado


@pytest.mark.parametrize("entrada", ["123456789", "123456789012", "", None])
def test_normalizar_telefone_recusa_tamanho_invalido(entrada):
    with pytest.raises(ValueError):
        normalizar_telefone(entrada)


def test_validar_uf_normaliza_e_recusa_sigla_inexistente():
    """UF aceita minúsculas e recusa siglas fora de UFS."""
    assert validar_uf(" df ") == "DF"
    for invalida in ("XX", "", None):
        with pytest.raises(ValueError):
            validar_uf(invalida)


@pytest.mark.parametrize("entrada,esperado", [
    (0, "0.00"),
    (10, "10.00"),
    ("10.5", "10.50"),
    (Decimal("10.500"), "10.50"),  # zero à direita não conta como casa decimal
    (0.1, "0.10"),                 # float é convertido via texto, sem erro de precisão
    ("1e2", "100.00"),
])
def test_validar_dinheiro_aceita_e_devolve_duas_casas(entrada, esperado):
    assert validar_dinheiro(entrada) == Decimal(esperado)


@pytest.mark.parametrize("entrada", [-1, "-0.01", "10.505", "abc", "NaN", "Infinity"])
def test_validar_dinheiro_recusa_invalidos(entrada):
    """Negativo, mais de 2 casas decimais, texto e valores não finitos são recusados."""
    with pytest.raises(ValueError):
        validar_dinheiro(entrada)


# ----------------- TESTES UNITÁRIOS: SCHEMAS -----------------


def test_endereco_normaliza_cep_e_uf_e_texto_vazio_vira_none():
    """CEP vira só dígitos, UF fica maiúscula e texto em branco vira None."""
    e = EnderecoSchema(cep="72910-565", uf_residencia="go", logradouro="  ", bairro="")
    assert e.cep == "72910565"
    assert e.uf_residencia == "GO"
    assert e.logradouro is None
    assert e.bairro is None


@pytest.mark.parametrize("campo,valor", [("cep", "123"), ("uf_residencia", "XX")])
def test_endereco_recusa_cep_e_uf_invalidos(campo, valor):
    with pytest.raises(ValidationError):
        EnderecoSchema(**{campo: valor})


def test_endereco_respeita_tamanho_das_colunas_do_banco():
    """Campos acima do tamanho da coluna do Aluno são recusados antes de gravar."""
    with pytest.raises(ValidationError):
        EnderecoSchema(logradouro="x" * 201)
    with pytest.raises(ValidationError):
        EnderecoSchema(numero="1" * 11)


def test_contato_normaliza_telefones_e_valida_email():
    c = ContatosSchema(telefone_contato="(61) 3333-4444", celular="61999998888", email="a@b.com")
    assert c.telefone_contato == "6133334444"
    assert c.celular == "61999998888"
    assert ContatosSchema().telefone_contato is None
    with pytest.raises(ValidationError):
        ContatosSchema(email="sem-arroba")
    with pytest.raises(ValidationError):
        ContatosSchema(celular="123")
    with pytest.raises(ValidationError):
        ContatosSchema(email="a" * 145 + "@exemplo.com")


@pytest.mark.parametrize("situacao,cedido_por,valor,esperado_cedido,esperado_valor", [
    ("PROPRIO", "Fulano", "500", None, None),
    ("OCUPACAO_IRREGULAR", "Fulano", "500", None, None),
    ("CEDIDO", "Fulano", "500", "Fulano", None),
    ("FINANCIADO", "Fulano", "500", None, Decimal("500.00")),
    ("ALUGADO", "Fulano", "500", None, Decimal("500.00")),
])
def test_moradia_descarta_campos_condicionais(situacao, cedido_por, valor, esperado_cedido, esperado_valor):
    """Campo que a opção escolhida não exige é descartado, mesmo que o front envie."""
    m = MoradiaSchema(situacao=situacao, cedido_por=cedido_por, valor=valor)
    assert m.cedido_por == esperado_cedido
    assert m.valor == esperado_valor


def test_moradia_recusa_situacao_inexistente_e_valor_invalido():
    with pytest.raises(ValidationError):
        MoradiaSchema(situacao="EMPRESTADO")
    with pytest.raises(ValidationError):
        MoradiaSchema(situacao="ALUGADO", valor="-1")
    with pytest.raises(ValidationError):
        MoradiaSchema(situacao="ALUGADO", valor="10.505")


def test_outras_propriedades_descarta_relacao_quando_nao_possui():
    assert OutrasPropriedadesSchema(possui=False, relacao="casa").relacao is None
    assert OutrasPropriedadesSchema(possui=True, relacao="casa").relacao == "casa"


def test_declaracao_recusa_data_futura():
    assert DeclaracaoSchema(data=date.today()).data == date.today()
    with pytest.raises(ValidationError):
        DeclaracaoSchema(data=date.today() + timedelta(days=1))


def test_membro_valida_idade_e_renda():
    assert MembroFamiliaSchema(tipo="Pai", idade=0).idade == 0
    assert MembroFamiliaSchema(tipo="Pai", idade=120).idade == 120
    assert MembroFamiliaSchema(tipo="Pai", renda_mensal="1500").renda_mensal == Decimal("1500.00")
    for invalido in ({"idade": 121}, {"idade": -1}, {"renda_mensal": "-5"}, {"renda_mensal": "10.505"}):
        with pytest.raises(ValidationError):
            MembroFamiliaSchema(tipo="Pai", **invalido)


def test_nucleo_familiar_aceita_ate_20_membros():
    membro = {"tipo": "Irmão", "idade": 5}
    assert len(NucleoFamiliarSchema(membros=[membro] * 20).membros) == 20
    with pytest.raises(ValidationError):
        NucleoFamiliarSchema(membros=[membro] * 21)


def test_entrada_valida_nao_tem_campos_faltantes():
    entrada = FichaSocioeconomicaEntrada(**payload_valido())
    assert campos_faltantes(entrada) == []


def test_entrada_vazia_lista_todos_os_campos_obrigatorios_de_uma_vez():
    """FE01: a recusa não para no primeiro erro, lista cada campo faltante."""
    with pytest.raises(ValidationError) as exc:
        FichaSocioeconomicaEntrada()
    erro = exc.value.errors()[0]
    assert erro["type"] == "campos_obrigatorios"
    campos = erro["ctx"]["campos"]
    for esperado in (
        "Endereço – logradouro", "Endereço – número", "Endereço – bairro", "Endereço – cidade",
        "Endereço – estado", "Endereço – CEP", "Contato – telefone ou celular",
        "Moradia – situação do imóvel", "Transporte – meio de transporte",
        "Núcleo familiar – pelo menos um membro", "Outras propriedades – resposta (sim ou não)",
        "Declaração – nome do responsável", "Declaração – local", "Declaração – data",
    ):
        assert esperado in campos
    assert len(campos) == 14


def test_entrada_indica_a_posicao_do_membro_com_campo_faltante():
    corpo = payload_valido()
    corpo["nucleo_familiar"]["membros"] = [
        {"tipo": "Mãe", "idade": 30},
        {"tipo": "Pai"},        # falta idade
        {"idade": 5},           # falta componente
    ]
    with pytest.raises(ValidationError) as exc:
        FichaSocioeconomicaEntrada(**corpo)
    assert exc.value.errors()[0]["ctx"]["campos"] == [
        "Núcleo familiar – membro 2 – idade",
        "Núcleo familiar – membro 3 – componente",
    ]


def test_entrada_exige_campos_condicionais_da_moradia_e_das_propriedades():
    casos = [
        ({"moradia": {"situacao": "CEDIDO"}}, "Moradia – quem cedeu"),
        ({"moradia": {"situacao": "ALUGADO"}}, "Moradia – valor mensal"),
        ({"moradia": {"situacao": "FINANCIADO", "valor": "0"}}, "Moradia – valor mensal"),
        ({"outras_propriedades": {"possui": True}}, "Outras propriedades – relação das propriedades"),
    ]
    for alteracao, esperado in casos:
        corpo = payload_valido()
        corpo.update(alteracao)
        with pytest.raises(ValidationError) as exc:
            FichaSocioeconomicaEntrada(**corpo)
        assert exc.value.errors()[0]["ctx"]["campos"] == [esperado]


def test_resposta_vazia_nao_recusa_mas_nao_esta_completa():
    """A resposta só informa o que falta; quem recusa é a entrada."""
    resposta = FichaSocioeconomicaResposta()
    assert resposta.completa is False
    assert len(campos_faltantes(resposta)) == 14


# ----------------- TESTES UNITÁRIOS: SERVICE (HISTÓRICO E TABELA DO PDF) -----------------


@pytest.mark.parametrize("tipo,esperado", [
    ("Pai", "pai"), (" MÃE ", "mae"), ("Irmã", "irmao"), ("Irmãos", "irmao"),
    ("Avó", "outro"), ("Tio", "outro"), (None, "outro"),
])
def test_tipo_de_componente_do_nucleo_familiar(tipo, esperado):
    assert service._tipo_componente(tipo) == esperado


def _membro(tipo, idade=10):
    return SimpleNamespace(
        tipo=tipo, idade=idade, estado_civil=None, escolaridade=None,
        profissao=None, renda_mensal=None,
    )


def test_tabela_da_familia_encaixa_nas_linhas_do_formulario():
    """Pai, Mãe, Irmãos e Outros ocupam as linhas impressas; o que sobra vai para linhas extras."""
    membros = [
        _membro("Mãe"), _membro("Irmã"), _membro("Avó"), _membro("Pai"),
        _membro("Pai", 50),  # segundo "pai": não cabe na linha impressa
    ]
    linhas = service._linhas_familia(membros)
    assert [l["componente"] for l in linhas] == ["Pai", "Mãe", "Irmã", "", "", "Avó", "", "Pai"]
    assert linhas[7]["idade"] == "50"


def test_tabela_da_familia_sem_membros_tem_as_sete_linhas_impressas():
    linhas = service._linhas_familia([])
    assert [l["componente"] for l in linhas] == ["Pai", "Mãe", "Irmãos", "", "", "Outros", ""]


def _estado_vazio() -> dict:
    return FichaSocioeconomicaResposta().model_dump(exclude=service.CAMPOS_FORA_DO_HISTORICO)


def _dados_membro(id_, **campos):
    base = {
        "id": id_, "tipo": "Irmão", "profissao": None, "idade": 5,
        "estado_civil": None, "escolaridade": None, "renda_mensal": None,
    }
    base.update(campos)
    return base


def test_campos_alterados_lista_so_os_nomes_dos_campos():
    antes = _estado_vazio()
    antes["nucleo_familiar"]["membros"] = [_dados_membro(1), _dados_membro(2)]
    depois = copy.deepcopy(antes)
    depois["contato"]["celular"] = "61999998888"
    depois["moradia"]["valor"] = Decimal("900.00")
    depois["nucleo_familiar"]["membros"] = [_dados_membro(1, idade=6), _dados_membro(3)]

    alterados = service._campos_alterados(antes, depois)

    assert alterados == [
        "Contato – celular",
        "Moradia – valor mensal",
        "Núcleo familiar – membro 1 – idade",
        "Núcleo familiar – membro adicionado",
        "Núcleo familiar – membro removido",
    ]
    assert service._campos_alterados(antes, copy.deepcopy(antes)) == []


def test_descricao_da_edicao_cabe_na_coluna_do_banco():
    """A descrição nunca passa de 1000 caracteres; o que sobra vira 'e mais N'."""
    curta = service._descricao_edicao(2026, ["Contato – celular", "Moradia – valor mensal"])
    assert curta == (
        "Ficha socioeconômica editada (ano letivo 2026): Contato – celular; Moradia – valor mensal"
    )
    muitos = [f"Núcleo familiar – membro {i} – profissão" for i in range(80)]
    longa = service._descricao_edicao(2026, muitos)
    assert len(longa) <= 1000
    assert "e mais" in longa


# ----------------- TESTES DE AUTENTICAÇÃO (RNF02) -----------------


def test_rotas_da_ficha_exigem_autenticacao(client, matricula):
    """Sem token, as três rotas retornam 401."""
    assert client.get(url(matricula.id)).status_code == 401
    assert client.put(url(matricula.id), json=payload_valido()).status_code == 401
    assert client.get(url(matricula.id, "/pdf")).status_code == 401


def test_usuario_inativo_nao_acessa_a_ficha(client, matricula, inactive_user):
    """RN18: conta inativa recebe 403."""
    response = client.get(url(matricula.id), headers=get_auth_headers(inactive_user))
    assert response.status_code == 403


def test_matricula_inexistente_retorna_404(client, test_user):
    """GET, PUT e PDF de matrícula que não existe retornam 404."""
    headers = get_auth_headers(test_user)
    assert client.get(url(99999), headers=headers).status_code == 404
    assert client.put(url(99999), json=payload_valido(), headers=headers).status_code == 404
    response = client.get(url(99999, "/pdf"), headers=headers)
    assert response.status_code == 404
    assert response.json()["detail"] == "Matrícula não encontrada."


# ----------------- TESTES DE OBTER A FICHA (GET) -----------------


def test_get_sem_ficha_devolve_dados_pessoais_endereco_e_secoes_vazias(client, test_user, matricula):
    """Matrícula sem ficha: dados do aluno preenchidos, resto vazio e completa falso."""
    response = client.get(url(matricula.id), headers=get_auth_headers(test_user))
    assert response.status_code == 200
    data = response.json()

    assert data["completa"] is False
    assert data["created_at"] is None
    assert data["dados_pessoais"]["nome"] == "Ana Clara de Sá"
    assert data["dados_pessoais"]["data_nasc"] == "2022-05-10"
    assert data["dados_pessoais"]["sexo"] == "Feminino"
    assert data["dados_pessoais"]["etapa"] == "Maternal II"
    assert data["dados_pessoais"]["ano_letivo"] == 2026
    assert data["endereco"]["logradouro"] == "Rua Antiga"
    assert data["endereco"]["cidade"] == "Águas Lindas de Goiás"
    assert data["endereco"]["uf_residencia"] == "GO"
    assert data["endereco"]["cep"] == "72910565"  # o hífen legado é normalizado
    assert data["contato"] == {"telefone_contato": None, "celular": None, "email": None}
    assert data["moradia"]["situacao"] is None
    assert data["transporte"]["meio"] is None
    assert data["nucleo_familiar"]["membros"] == []
    assert data["outras_propriedades"]["possui"] is None


def test_get_mostra_nome_da_mae_e_do_pai_quando_ha_requerimento(client, test_user, matricula, requerimento):
    response = client.get(url(matricula.id), headers=get_auth_headers(test_user))
    dados = response.json()["dados_pessoais"]
    assert dados["nome_mae"] == "Maria Souza"
    assert dados["nome_pai"] == "João Souza"


def test_get_deixa_nome_da_mae_e_do_pai_vazios_sem_requerimento(client, test_user, matricula):
    dados = client.get(url(matricula.id), headers=get_auth_headers(test_user)).json()["dados_pessoais"]
    assert dados["nome_mae"] is None
    assert dados["nome_pai"] is None


def test_get_de_ficha_parcial_nao_quebra_e_nao_esta_completa(client, test_user, db_session, matricula):
    """Ficha gravada incompleta (dado antigo) é lida sem erro, com completa falso."""
    db_session.add(FichaSocioeconomica(id_matricula=matricula.id, moradia=SituacaoMoradiaModelo.CEDIDO))
    db_session.commit()

    response = client.get(url(matricula.id), headers=get_auth_headers(test_user))
    assert response.status_code == 200
    assert response.json()["moradia"]["situacao"] == "CEDIDO"
    assert response.json()["completa"] is False


def test_rota_renova_o_token_a_cada_requisicao(client, test_user, matricula):
    """RN17: a resposta traz o novo token no cabeçalho configurado."""
    response = client.get(url(matricula.id), headers=get_auth_headers(test_user))
    assert response.headers[settings.renewed_token_header_name] != ""


# ----------------- TESTES DE SALVAR A FICHA (PUT) -----------------


def test_put_cria_a_ficha_e_segundo_put_atualiza(client, test_user, db_session, matricula):
    """Primeiro PUT cria; o seguinte atualiza a mesma ficha."""
    headers = get_auth_headers(test_user)

    r1 = _salvar(client, headers, matricula.id)
    assert r1.status_code == 200
    dados = r1.json()
    assert dados["completa"] is True
    assert dados["created_at"] is not None
    assert dados["transporte"]["meio"] == "TRANSPORTE_COLETIVO"
    assert dados["moradia"]["situacao"] == "ALUGADO"
    assert _dec(dados["moradia"]["valor"]) == Decimal("850.50")
    assert dados["contato"]["celular"] == "61999998888"
    assert dados["declaracao"]["data"] == "2026-03-09"
    assert db_session.query(FichaSocioeconomica).count() == 1

    corpo = payload_valido()
    corpo["transporte"]["meio"] = "CARONA"
    corpo["nucleo_familiar"]["membros"] = [
        {"id": m["id"], "tipo": m["tipo"], "idade": m["idade"]}
        for m in dados["nucleo_familiar"]["membros"]
    ]
    r2 = _salvar(client, headers, matricula.id, corpo)
    assert r2.status_code == 200
    assert r2.json()["transporte"]["meio"] == "CARONA"
    assert db_session.query(FichaSocioeconomica).count() == 1


def test_get_depois_do_put_devolve_a_mesma_ficha(client, test_user, matricula):
    headers = get_auth_headers(test_user)
    salvo = _salvar(client, headers, matricula.id).json()
    lido = client.get(url(matricula.id), headers=headers).json()
    assert _sem_datas(lido) == _sem_datas(salvo)


def test_put_responde_em_menos_de_5_segundos(client, test_user, matricula):
    """Critério de aceite: o PUT responde dentro de 5 segundos."""
    inicio = time.perf_counter()
    response = _salvar(client, get_auth_headers(test_user), matricula.id)
    assert response.status_code == 200
    assert time.perf_counter() - inicio < 5


def test_put_sem_campos_obrigatorios_retorna_422_listando_todos(client, test_user, db_session, matricula):
    """FE01: lista cada campo faltante, inclusive dentro dos membros da família, e não grava nada."""
    corpo = {"nucleo_familiar": {"membros": [{"tipo": "Mãe"}, {"idade": 5}]}}
    response = client.put(url(matricula.id), json=corpo, headers=get_auth_headers(test_user))

    assert response.status_code == 422
    texto = json.dumps(response.json()["detail"], ensure_ascii=False)
    for esperado in (
        "Endereço – CEP", "Endereço – logradouro", "Contato – telefone ou celular",
        "Moradia – situação do imóvel", "Transporte – meio de transporte",
        "Núcleo familiar – membro 1 – idade", "Núcleo familiar – membro 2 – componente",
        "Outras propriedades – resposta (sim ou não)", "Declaração – data",
    ):
        assert esperado in texto
    assert db_session.query(FichaSocioeconomica).count() == 0


def test_put_cedido_sem_quem_cedeu_retorna_422(client, test_user, matricula):
    corpo = payload_valido()
    corpo["moradia"] = {"situacao": "CEDIDO"}
    response = _salvar(client, get_auth_headers(test_user), matricula.id, corpo)
    assert response.status_code == 422
    assert "Moradia – quem cedeu" in json.dumps(response.json()["detail"], ensure_ascii=False)


@pytest.mark.parametrize("situacao,valor", [("ALUGADO", None), ("ALUGADO", "0"), ("FINANCIADO", None)])
def test_put_alugado_ou_financiado_sem_valor_retorna_422(client, test_user, matricula, situacao, valor):
    corpo = payload_valido()
    corpo["moradia"] = {"situacao": situacao}
    if valor is not None:
        corpo["moradia"]["valor"] = valor
    response = _salvar(client, get_auth_headers(test_user), matricula.id, corpo)
    assert response.status_code == 422
    assert "Moradia – valor mensal" in json.dumps(response.json()["detail"], ensure_ascii=False)


def test_put_proprio_com_valor_enviado_salva_com_valor_vazio(client, test_user, db_session, matricula):
    """Campo condicional é descartado pelo backend, mesmo que o front envie."""
    corpo = payload_valido()
    corpo["moradia"] = {"situacao": "PROPRIO", "cedido_por": "Fulano", "valor": "500"}
    response = _salvar(client, get_auth_headers(test_user), matricula.id, corpo)

    assert response.status_code == 200
    assert response.json()["moradia"]["valor"] is None
    assert response.json()["moradia"]["cedido_por"] is None
    ficha = db_session.query(FichaSocioeconomica).filter_by(id_matricula=matricula.id).one()
    assert ficha.valor is None
    assert ficha.cedido_por is None


def test_put_sem_outras_propriedades_descarta_a_relacao(client, test_user, db_session, matricula):
    corpo = payload_valido()
    corpo["outras_propriedades"] = {"possui": False, "relacao": "Terreno em Luziânia"}
    response = _salvar(client, get_auth_headers(test_user), matricula.id, corpo)

    assert response.status_code == 200
    assert response.json()["outras_propriedades"] == {"possui": False, "relacao": None}
    ficha = db_session.query(FichaSocioeconomica).filter_by(id_matricula=matricula.id).one()
    assert ficha.propriedades is None


def test_put_com_outras_propriedades_exige_a_relacao(client, test_user, matricula):
    corpo = payload_valido()
    corpo["outras_propriedades"] = {"possui": True}
    response = _salvar(client, get_auth_headers(test_user), matricula.id, corpo)
    assert response.status_code == 422
    assert "relação das propriedades" in json.dumps(response.json()["detail"], ensure_ascii=False)


@pytest.mark.parametrize("alteracao", [
    lambda p: p["endereco"].update(cep="123"),
    lambda p: p["endereco"].update(uf_residencia="XX"),
    lambda p: p["contato"].update(celular="123456789"),
    lambda p: p["contato"].update(telefone_contato="123"),
    lambda p: p["contato"].update(email="sem-arroba"),
    lambda p: p["moradia"].update(valor="-5"),
    lambda p: p["moradia"].update(valor="10.505"),
    lambda p: p["moradia"].update(situacao="EMPRESTADO"),
    lambda p: p["transporte"].update(meio="BICICLETA_VOADORA"),
    lambda p: p["nucleo_familiar"]["membros"][0].update(idade=121),
    lambda p: p["nucleo_familiar"]["membros"][0].update(idade=-1),
    lambda p: p["nucleo_familiar"]["membros"][0].update(renda_mensal="-1"),
    lambda p: p["declaracao"].update(data=(date.today() + timedelta(days=1)).isoformat()),
    lambda p: p["declaracao"].update(nome="x" * 151),
    lambda p: p["nucleo_familiar"].update(membros=[{"tipo": "Irmão", "idade": 5}] * 21),
], ids=[
    "cep", "uf", "celular", "telefone", "email", "valor-negativo", "valor-3-casas",
    "moradia-invalida", "transporte-invalido", "idade-acima", "idade-negativa",
    "renda-negativa", "data-futura", "nome-longo", "mais-de-20-membros",
])
def test_put_com_dado_invalido_retorna_422(client, test_user, db_session, matricula, alteracao):
    """CEP, telefone, e-mail, UF, idade, valores e limites inválidos retornam 422 e não gravam."""
    corpo = payload_valido()
    alteracao(corpo)
    response = _salvar(client, get_auth_headers(test_user), matricula.id, corpo)
    assert response.status_code == 422
    assert db_session.query(FichaSocioeconomica).count() == 0


def test_put_nao_altera_dados_pessoais_do_aluno(client, test_user, db_session, aluno, matricula):
    """Dados pessoais são somente leitura: o que vier no corpo é ignorado."""
    corpo = payload_valido()
    corpo["dados_pessoais"] = {"nome": "Outro Nome", "data_nasc": "2000-01-01", "sexo": "Masculino"}
    response = _salvar(client, get_auth_headers(test_user), matricula.id, corpo)

    assert response.status_code == 200
    assert response.json()["dados_pessoais"]["nome"] == "Ana Clara de Sá"
    db_session.refresh(aluno)
    assert aluno.nome == "Ana Clara de Sá"
    assert aluno.data_nasc == date(2022, 5, 10)
    assert aluno.sexo == Sexo.FEMININO


# ----------------- TESTES DE ENDEREÇO E CONTATOS -----------------


def test_endereco_alterado_na_ficha_aparece_no_aluno(client, test_user, db_session, aluno, matricula):
    """O endereço é editado na ficha, mas gravado no Aluno."""
    _salvar(client, get_auth_headers(test_user), matricula.id)

    db_session.refresh(aluno)
    assert aluno.logradouro == "Quadra 55 Conjunto A"
    assert aluno.numero == "35"
    assert aluno.bairro == "Setor 05"
    assert aluno.cidade == "Águas Lindas de Goiás"
    assert aluno.uf_residencia == "GO"
    assert aluno.cep == "72910565"


def test_contatos_ficam_na_ficha_e_nao_alteram_o_telefone_do_aluno(client, test_user, db_session, aluno, matricula):
    _salvar(client, get_auth_headers(test_user), matricula.id)

    ficha = db_session.query(FichaSocioeconomica).filter_by(id_matricula=matricula.id).one()
    assert ficha.telefone_contato == "6133334444"
    assert ficha.celular == "61999998888"
    assert ficha.email == "responsavel@exemplo.com"
    db_session.refresh(aluno)
    assert aluno.telefone == "61911112222"


# ----------------- TESTES DO NÚCLEO FAMILIAR -----------------


def test_membros_sao_criados_atualizados_e_removidos_no_mesmo_salvamento(client, test_user, db_session, matricula):
    headers = get_auth_headers(test_user)

    criados = _salvar(client, headers, matricula.id).json()["nucleo_familiar"]["membros"]
    assert len(criados) == 2
    assert all(m["id"] is not None for m in criados)
    id_mae, id_irmao = criados[0]["id"], criados[1]["id"]

    # Atualiza pelo id, remove o irmão (ausente da lista) e cria um membro novo (sem id)
    corpo = payload_valido()
    corpo["nucleo_familiar"]["membros"] = [
        {"id": id_mae, "tipo": "Mãe", "idade": 33},
        {"tipo": "Avó", "idade": 70},
    ]
    resposta = _salvar(client, headers, matricula.id, corpo).json()["nucleo_familiar"]["membros"]

    assert [m["tipo"] for m in resposta] == ["Mãe", "Avó"]
    assert resposta[0]["id"] == id_mae
    assert resposta[0]["idade"] == 33
    assert resposta[1]["id"] not in (id_mae, id_irmao)
    ficha = db_session.query(FichaSocioeconomica).filter_by(id_matricula=matricula.id).one()
    assert db_session.query(Familiar).filter_by(id_fs=ficha.id).count() == 2
    assert db_session.get(Familiar, id_irmao) is None


def test_reenviar_a_mesma_ficha_com_ids_nao_duplica_membros(client, test_user, db_session, matricula):
    """O PUT é idempotente: reenviar depois de um cancelamento não cria membros repetidos."""
    headers = get_auth_headers(test_user)
    primeira = _salvar(client, headers, matricula.id).json()

    corpo = payload_valido()
    corpo["nucleo_familiar"]["membros"] = [
        {"id": m["id"], "tipo": m["tipo"], "idade": m["idade"]}
        for m in primeira["nucleo_familiar"]["membros"]
    ]
    _salvar(client, headers, matricula.id, corpo)
    _salvar(client, headers, matricula.id, corpo)

    assert db_session.query(Familiar).count() == 2


def test_id_de_membro_de_outra_ficha_retorna_422(client, test_user, db_session, matricula, matricula_outro_ano):
    """Impede editar membros da ficha de outro ano letivo do mesmo aluno."""
    headers = get_auth_headers(test_user)
    ficha_2025 = _salvar(client, headers, matricula_outro_ano.id).json()
    ids_2025 = [m["id"] for m in ficha_2025["nucleo_familiar"]["membros"]]

    corpo = payload_valido()
    corpo["nucleo_familiar"]["membros"] = [{"id": ids_2025[0], "tipo": "Mãe", "idade": 99}]
    response = _salvar(client, headers, matricula.id, corpo)

    assert response.status_code == 422
    assert "não pertence a esta ficha" in response.json()["detail"]
    # a ficha de 2025 continua intacta
    assert db_session.get(Familiar, ids_2025[0]).idade == 32
    assert db_session.query(FichaSocioeconomica).filter_by(id_matricula=matricula.id).count() == 0


def test_id_de_membro_inexistente_retorna_422(client, test_user, matricula):
    corpo = payload_valido()
    corpo["nucleo_familiar"]["membros"] = [{"id": 999999, "tipo": "Mãe", "idade": 30}]
    response = _salvar(client, get_auth_headers(test_user), matricula.id, corpo)
    assert response.status_code == 422


def test_editar_a_ficha_de_uma_matricula_nao_altera_a_de_outra(client, test_user, matricula, matricula_outro_ano):
    """Cada ano letivo tem a sua ficha; editar uma nunca mexe na outra."""
    headers = get_auth_headers(test_user)

    corpo_2025 = payload_valido()
    corpo_2025["moradia"] = {"situacao": "PROPRIO"}
    corpo_2025["transporte"] = {"meio": "CARONA"}
    corpo_2025["nucleo_familiar"]["membros"] = [{"tipo": "Pai", "idade": 40}]
    _salvar(client, headers, matricula_outro_ano.id, corpo_2025)
    antes = client.get(url(matricula_outro_ano.id), headers=headers).json()

    _salvar(client, headers, matricula.id)  # ficha de 2026, com dados diferentes
    corpo_2026 = payload_valido()
    corpo_2026["transporte"]["meio"] = "CARRO_MOTO_PROPRIO"
    corpo_2026["nucleo_familiar"]["membros"] = []
    corpo_2026["nucleo_familiar"]["membros"] = [{"tipo": "Mãe", "idade": 31}]
    assert _salvar(client, headers, matricula.id, corpo_2026).status_code == 200

    depois = client.get(url(matricula_outro_ano.id), headers=headers).json()
    assert _sem_datas(depois) == _sem_datas(antes)
    assert depois["transporte"]["meio"] == "CARONA"
    assert depois["dados_pessoais"]["ano_letivo"] == 2025


# ----------------- TESTES DO HISTÓRICO (OPERAÇÃO) -----------------


def test_primeiro_salvamento_grava_preenchimento(client, test_user, db_session, aluno, matricula):
    _salvar(client, get_auth_headers(test_user), matricula.id)

    ops = db_session.query(Operacao).filter(Operacao.tipo == Tipo.PREENCHIMENTO_SOCIOECONOMICA).all()
    assert len(ops) == 1
    assert ops[0].id_user == test_user.id
    assert ops[0].id_aluno == aluno.id
    assert ops[0].descricao == "Ficha socioeconômica preenchida (ano letivo 2026)"
    assert db_session.query(Operacao).filter(Operacao.tipo == Tipo.EDICAO_SOCIOECONOMICA).count() == 0


def test_salvar_duas_vezes_a_mesma_ficha_nao_gera_edicao(client, test_user, db_session, matricula):
    """Um registro de preenchimento e nenhum de edição quando nada mudou."""
    headers = get_auth_headers(test_user)
    primeira = _salvar(client, headers, matricula.id).json()

    corpo = payload_valido()
    corpo["nucleo_familiar"]["membros"] = [
        {
            "id": m["id"], "tipo": m["tipo"], "idade": m["idade"], "profissao": m["profissao"],
            "estado_civil": m["estado_civil"], "escolaridade": m["escolaridade"],
            "renda_mensal": m["renda_mensal"],
        }
        for m in primeira["nucleo_familiar"]["membros"]
    ]
    assert _salvar(client, headers, matricula.id, corpo).status_code == 200

    assert db_session.query(Operacao).filter(Operacao.tipo == Tipo.PREENCHIMENTO_SOCIOECONOMICA).count() == 1
    assert db_session.query(Operacao).filter(Operacao.tipo == Tipo.EDICAO_SOCIOECONOMICA).count() == 0


def test_edicao_registra_nomes_dos_campos_e_nunca_os_valores(client, test_user, db_session, aluno, matricula):
    """LGPD: renda, moradia, contatos e dados da família não aparecem no histórico."""
    headers = get_auth_headers(test_user)
    membros = _salvar(client, headers, matricula.id).json()["nucleo_familiar"]["membros"]

    corpo = payload_valido()
    corpo["contato"]["celular"] = "61988887777"
    corpo["moradia"]["valor"] = "1234.56"
    corpo["nucleo_familiar"]["membros"] = [{"id": membros[0]["id"], "tipo": "Mãe", "idade": 32}]  # remove o irmão
    assert _salvar(client, headers, matricula.id, corpo).status_code == 200

    ops = db_session.query(Operacao).filter(Operacao.tipo == Tipo.EDICAO_SOCIOECONOMICA).all()
    assert len(ops) == 1
    descricao = ops[0].descricao
    assert ops[0].id_user == test_user.id
    assert ops[0].id_aluno == aluno.id
    assert "ano letivo 2026" in descricao
    for campo in ("Contato – celular", "Moradia – valor mensal", "Núcleo familiar – membro removido"):
        assert campo in descricao
    for valor in (
        "988887777", "1234", "850", "Costureira", "1500", "responsavel@exemplo.com",
        "Maria da Silva", "Quadra 55", "Pais separados",
    ):
        assert valor not in descricao


# ----------------- TESTES DE FALHA NO BANCO (FE04) -----------------


def test_falha_no_meio_do_salvamento_faz_rollback_e_retorna_503(client, test_user, db_session, matricula):
    """FE04: se algo falha depois de gravar endereço e ficha, nada é confirmado."""
    headers = get_auth_headers(test_user)
    falha = OperationalError("connection error", {}, None)

    with patch.object(db_session, "commit", wraps=db_session.commit) as commit, \
            patch.object(db_session, "rollback", wraps=db_session.rollback) as rollback, \
            patch("app.repository.repository_socioeconomica.sincronizar_familiares", side_effect=falha):
        response = _salvar(client, headers, matricula.id)

    assert response.status_code == 503
    assert response.json()["detail"] == "Não foi possível salvar. Tente novamente."
    commit.assert_not_called()
    rollback.assert_called()
    assert db_session.query(FichaSocioeconomica).count() == 0
    assert db_session.query(Familiar).count() == 0
    assert db_session.query(Operacao).filter(Operacao.tipo == Tipo.PREENCHIMENTO_SOCIOECONOMICA).count() == 0


def test_falha_de_conexao_ao_confirmar_retorna_503_e_nao_grava(client, test_user, db_session, matricula):
    """Falha no commit: 503, sem ficha, sem membros e sem histórico."""
    headers = get_auth_headers(test_user)

    with patch("sqlalchemy.orm.Session.commit", side_effect=OperationalError("connection error", {}, None)):
        response = _salvar(client, headers, matricula.id)

    assert response.status_code == 503
    assert response.json()["detail"] == "Não foi possível salvar. Tente novamente."
    assert db_session.query(FichaSocioeconomica).count() == 0
    assert db_session.query(Familiar).count() == 0
    assert db_session.query(Operacao).filter(Operacao.tipo == Tipo.PREENCHIMENTO_SOCIOECONOMICA).count() == 0


# ----------------- TESTES DO CONTEXTO E DO TEMPLATE DO PDF (SEM WEASYPRINT) -----------------


def test_contexto_do_pdf_vem_formatado_e_sem_objetos_do_banco(client, test_user, db_session, matricula, requerimento):
    corpo = payload_valido()
    corpo["nucleo_familiar"]["membros"] = [
        {"tipo": "Mãe", "idade": 32, "renda_mensal": "1500"},
        {"tipo": "Pai", "idade": 35},
        {"tipo": "Irmã", "idade": 9},
        {"tipo": "Avó", "idade": 70},
    ]
    _salvar(client, get_auth_headers(test_user), matricula.id, corpo)

    contexto = service.contexto_pdf(db_session, matricula.id)

    aluno_pdf = contexto["aluno"]
    assert aluno_pdf["nome"] == "Ana Clara de Sá"
    assert aluno_pdf["ano_serie"] == "Maternal II"
    assert aluno_pdf["ano_letivo"] == "2026"
    assert aluno_pdf["data_matricula"] == "15/01/2026"
    assert aluno_pdf["data_nasc"] == "10/05/2022"
    assert aluno_pdf["cpf"] == "111.222.333-44"
    assert aluno_pdf["sexo_f"] is True and aluno_pdf["sexo_m"] is False
    assert [r["rotulo"] for r in aluno_pdf["racas"] if r["marcado"]] == ["Parda"]
    assert aluno_pdf["nome_mae"] == "Maria Souza"
    assert contexto["endereco"]["cep"] == "72910-565"
    assert contexto["contato"]["celular"] == "(61) 99999-8888"
    assert contexto["contato"]["telefone_contato"] == "(61) 3333-4444"
    assert contexto["moradia"] == {"situacao": "ALUGADO", "cedido_por": "", "valor": "850,50"}
    assert contexto["transporte"]["meio"] == "TRANSPORTE_COLETIVO"
    assert contexto["declaracao"] == {
        "nome": "Maria da Silva", "local": "Águas Lindas de Goiás",
        "dia": "09", "mes": "março", "ano": "2026",
    }
    assert [l["componente"] for l in contexto["familiares"]] == ["Pai", "Mãe", "Irmã", "", "", "Avó", ""]
    assert contexto["familiares"][1]["renda_mensal"] == "R$ 1.500,00"
    json.dumps(contexto)  # só tipos simples: nada de objeto ORM


def test_template_do_pdf_tem_todas_as_secoes_e_nenhum_recurso_externo(client, test_user, db_session, matricula):
    _salvar(client, get_auth_headers(test_user), matricula.id)
    contexto = service.contexto_pdf(db_session, matricula.id)

    html = service_pdf._env.get_template("fichas/socioeconomica.html").render(logo="", **contexto)

    for trecho in (
        "FICHA SOCIOECONÔMICA", "DADOS PESSOAIS DO ALUNO", "Ana Clara de Sá",
        "O imóvel onde a criança reside é", "meio de transporte utilizado",
        "COMPONENTES", "possui propriedades", "O Serviço Social alerta",
        "Nome do (a) Responsável pela criança", "Assinatura",
        "R$ 850,50" if False else "850,50",
    ):
        assert trecho.lower() in html.lower()
    assert "(X) Alugado" in " ".join(html.split()).replace("<span class=\"marca\">", "").replace("</span>", "")
    assert html.count('class="pagina"') == 2
    assert "http://" not in html and "https://" not in html
    assert "<img" not in html  # sem logo.png, nenhuma imagem é referenciada


def test_template_escapa_html_digitado_nos_campos(client, test_user, db_session, matricula):
    """Texto digitado na ficha nunca vira HTML no PDF."""
    corpo = payload_valido()
    corpo["nucleo_familiar"]["observacoes"] = "<script>alert(1)</script>"
    _salvar(client, get_auth_headers(test_user), matricula.id, corpo)

    contexto = service.contexto_pdf(db_session, matricula.id)
    html = service_pdf._env.get_template("fichas/socioeconomica.html").render(logo="", **contexto)

    assert "<script>" not in html
    assert "&lt;script&gt;" in html


def test_nome_do_arquivo_do_pdf_sai_sem_acento_e_em_minusculas():
    assert service_pdf.slug("João da Conceição D'Ávila") == "joao-da-conceicao-d-avila"
    assert service_pdf.slug(None) == "aluno"


# ----------------- TESTES DA EXPORTAÇÃO EM PDF -----------------


def test_falha_na_geracao_do_pdf_retorna_500_e_nao_registra_exportacao(client, test_user, db_session, matricula):
    """FE: erro ao gerar o PDF devolve 500 genérico (sem dados da ficha) e não grava Operação."""
    _salvar(client, get_auth_headers(test_user), matricula.id)

    with patch("app.routes.route_matriculas.service_pdf.gerar_pdf", side_effect=RuntimeError("Maria da Silva")):
        response = client.get(url(matricula.id, "/pdf"), headers=get_auth_headers(test_user))

    assert response.status_code == 500
    assert response.json()["detail"] == "Não foi possível gerar o PDF."
    assert "Maria" not in response.text
    assert db_session.query(Operacao).filter(Operacao.tipo == Tipo.EXPORTACAO_PDF).count() == 0


@requer_weasyprint
def test_exportar_pdf_devolve_arquivo_sem_cache_e_registra_a_exportacao(client, test_user, db_session, aluno, matricula):
    """PDF gerado com WeasyPrint: tipo, download, sem cache, token renovado e Operação."""
    headers = get_auth_headers(test_user)
    _salvar(client, headers, matricula.id)

    response = client.get(url(matricula.id, "/pdf"), headers=headers)

    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert response.headers["cache-control"] == "no-store"
    assert 'filename="socioeconomica-ana-clara-de-sa-2026.pdf"' in response.headers["content-disposition"]
    assert response.headers[settings.renewed_token_header_name] != ""
    assert response.content.startswith(b"%PDF")

    ops = db_session.query(Operacao).filter(Operacao.tipo == Tipo.EXPORTACAO_PDF).all()
    assert len(ops) == 1
    assert ops[0].id_user == test_user.id
    assert ops[0].id_aluno == aluno.id
    assert ops[0].descricao == "Ficha socioeconômica exportada (ano letivo 2026)"


@requer_weasyprint
def test_exportar_pdf_de_matricula_sem_ficha_gera_o_formulario_em_branco(client, test_user, matricula):
    response = client.get(url(matricula.id, "/pdf"), headers=get_auth_headers(test_user))
    assert response.status_code == 200
    assert response.content.startswith(b"%PDF")
