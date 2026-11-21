"""Testes dos validadores comuns (app/core/validadores.py)."""
import pytest

from app.core.validadores import cpf_valido, nis_valido, so_digitos, telefone_valido, uf_valida
from app.models.const import UFS


@pytest.mark.parametrize("cpf", ["52998224725", "11144477735", "12345678909"])
def test_cpf_valido(cpf):
    assert cpf_valido(cpf)


@pytest.mark.parametrize(
    "cpf",
    [
        "52998224724",  # dígito verificador errado
        "52998224735",  # primeiro dígito verificador errado
        "5299822472",  # 10 dígitos
        "529982247255",  # 12 dígitos
        "00000000000",  # sequências repetidas passam na conta, mas não são CPFs
        "11111111111",
        "99999999999",
        "529.982.247-25",  # a máscara é do frontend: com pontuação é inválido
        "5299822472a",
        " 52998224725",
        "52998224725\n",
        "",
        "٥٢٩٩٨٢٢٤٧٢٥",  # dígitos de outro alfabeto
        None,
        52998224725,
    ],
)
def test_cpf_invalido(cpf):
    assert not cpf_valido(cpf)


def test_nis_tem_exatamente_11_digitos():
    assert nis_valido("12345678901")
    for invalido in ("1234567890", "123456789012", "123.45678.90-1", "1234567890a", ""):
        assert not nis_valido(invalido)


def test_telefone_tem_10_ou_11_digitos():
    assert telefone_valido("6133334444")
    assert telefone_valido("61999998888")
    for invalido in ("619999988", "619999988887", "(61)99999-8888", "61 99999-8888", "", "61a9999888"):
        assert not telefone_valido(invalido)


@pytest.mark.parametrize("uf", UFS)
def test_todas_as_ufs_do_pais_sao_validas(uf):
    assert uf_valida(uf)


@pytest.mark.parametrize("uf", ["go", "XX", "G", "GOO", "", None])
def test_uf_invalida(uf):
    assert not uf_valida(uf)


def test_so_digitos_aceita_apenas_0_a_9():
    assert so_digitos("0123456789")
    for invalido in ("", "12 3", "1.5", "-1", "١٢٣", "²"):
        assert not so_digitos(invalido)
