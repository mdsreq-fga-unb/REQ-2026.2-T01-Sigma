"""Histórico com valores: formatação, campos sensíveis e itens (sem banco)."""
from datetime import date
from decimal import Decimal

from app.core.auditoria import e_sensivel
from app.models.termo_saida import FormaSaida
from app.services import service_historico as hist

FICHA = "Ficha de teste"
ROTULOS = {
    ("responsavel", "nome"): "Nome",
    ("responsavel", "cpf"): "CPF",
    ("data",): "Data",
}


def test_formata_datas_dinheiro_e_booleanos():
    assert hist.formatar(date(2026, 5, 2)) == "02/05/2026"
    assert hist.formatar(Decimal("1234.5")) == "R$ 1.234,50"
    assert hist.formatar(True) == "Sim"
    assert hist.formatar(False) == "Não"


def test_rotulo_de_troca_o_nome_do_enum_pelo_texto_da_opcao():
    formatar = hist.rotulo_de(FormaSaida, {FormaSaida.OUTROS: "Outros"})
    assert formatar("OUTROS") == "Outros"
    assert formatar(FormaSaida.OUTROS) == "Outros"


def test_campo_sensivel_sai_sem_valores_e_o_comum_sai_com_valores():
    antes = {("responsavel", "nome"): "Ana", ("responsavel", "cpf"): "11111111111"}
    depois = {("responsavel", "nome"): "Bia", ("responsavel", "cpf"): "22222222222"}

    itens = hist.itens_alterados(antes, depois, ROTULOS, FICHA)

    assert itens == [
        {"ficha": FICHA, "campo": "Nome", "valor_anterior": "Ana", "valor_novo": "Bia", "sensivel": False},
        {"ficha": FICHA, "campo": "CPF", "valor_anterior": "", "valor_novo": "", "sensivel": True},
    ]


def test_sem_mudanca_nao_gera_itens():
    foto = {("data",): date(2026, 1, 1)}
    assert hist.itens_alterados(foto, dict(foto), ROTULOS, FICHA) == []


def test_texto_vazio_e_none_contam_como_nao_preenchido():
    antes = {("responsavel", "nome"): ""}
    depois = {("responsavel", "nome"): None}
    assert hist.itens_alterados(antes, depois, ROTULOS, FICHA) == []


def test_lista_usa_o_formatador_e_junta_com_ponto_e_virgula():
    rotulos = {("saida", "lista"): "Lista"}
    formatadores = {
        ("saida", "lista"): hist.rotulo_de(FormaSaida, {FormaSaida.RESPONSAVEIS: "Responsáveis", FormaSaida.OUTROS: "Outros"}),
    }
    antes = {("saida", "lista"): ["RESPONSAVEIS"]}
    depois = {("saida", "lista"): ["OUTROS", "RESPONSAVEIS"]}

    (item,) = hist.itens_alterados(antes, depois, rotulos, FICHA, formatadores)

    assert item["valor_anterior"] == "Responsáveis"
    assert item["valor_novo"] == "Outros; Responsáveis"


def test_sensibilidade_por_caminho_exato_e_por_prefixo():
    assert e_sensivel(("dados_pessoais", "cpf"))
    assert e_sensivel(("documentacao_civil", "rg"))
    assert e_sensivel(("saude", "problemas"))
    assert e_sensivel(("nucleo_familiar", "membro", "renda_mensal"))
    assert not e_sensivel(("dados_pessoais", "nome"))
    assert e_sensivel(("moradia", "valor"))


def test_nomes_sem_repeticao_mantendo_a_ordem():
    itens = [{"campo": "A"}, {"campo": "A"}, {"campo": "B"}]
    assert hist.nomes(itens) == ["A", "B"]
