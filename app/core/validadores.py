"""Validadores comuns reutilizados pelos schemas das fichas e termos (UC04).

O backend recebe CPF, NIS e telefone **só com dígitos**: a máscara é responsabilidade do
frontend. Valor com pontuação, espaço ou letras é inválido.

As funções devolvem `True` ou `False`. Quem valida (o schema) decide a mensagem de erro.
"""
import re

from app.models.const import UFS

# [0-9] e não \d: \d também aceita dígitos de outros alfabetos (ex.: árabe-índicos).
_SO_DIGITOS = re.compile(r"[0-9]+")


def so_digitos(valor: str) -> bool:
    """`True` se o texto tem ao menos um caractere e todos são dígitos de 0 a 9."""
    return isinstance(valor, str) and _SO_DIGITOS.fullmatch(valor) is not None


def cpf_valido(cpf: str) -> bool:
    """CPF com exatamente 11 dígitos e dígitos verificadores corretos.

    Recusa sequências de um dígito repetido (000.000.000-00, 111.111.111-11 etc.), que passam
    na conta dos dígitos verificadores mas não são CPFs válidos.
    """
    if not so_digitos(cpf) or len(cpf) != 11 or cpf == cpf[0] * 11:
        return False

    for posicao in (9, 10):
        soma = sum(int(cpf[i]) * (posicao + 1 - i) for i in range(posicao))
        digito = (soma * 10) % 11 % 10
        if digito != int(cpf[posicao]):
            return False
    return True


def nis_valido(nis: str) -> bool:
    """NIS com exatamente 11 dígitos."""
    return so_digitos(nis) and len(nis) == 11


def telefone_valido(telefone: str) -> bool:
    """Telefone com DDD: 10 dígitos (fixo) ou 11 dígitos (celular)."""
    return so_digitos(telefone) and len(telefone) in (10, 11)


def cep_valido(cep: str) -> bool:
    """CEP com exatamente 8 dígitos."""
    return so_digitos(cep) and len(cep) == 8


def uf_valida(uf: str) -> bool:
    """Sigla de UF presente em `UFS` (maiúsculas, como o banco guarda)."""
    return isinstance(uf, str) and uf in UFS
