import re
from decimal import Decimal, InvalidOperation

from app.models.const import UFS


def _so_digitos(valor: str) -> str:
    return re.sub(r"\D", "", valor or "")
# remove tudo que nao e numero


def normalizar_cep(valor: str) -> str:
    cep = _so_digitos(valor)
    if len(cep) != 8:
        raise ValueError("CEP deve ter 8 dígitos.")
    return cep


def normalizar_telefone(valor: str) -> str:
    tel = _so_digitos(valor)
    if len(tel) not in (10, 11):
        raise ValueError("Telefone deve ter 10 ou 11 dígitos.")
    return tel


def validar_uf(valor: str) -> str:
    uf = (valor or "").strip().upper()
    if uf not in UFS:
        raise ValueError("Estado (UF) inválido.")
    return uf


def validar_dinheiro(valor) -> Decimal:
    try:
        d = Decimal(str(valor))
    except InvalidOperation:
        raise ValueError("Valor monetário inválido.")
    if not d.is_finite():
        raise ValueError("Valor monetário inválido.")
    if d < 0:
        raise ValueError("O valor não pode ser negativo.")
    # normalize() tira zeros à direita: 10.500 vira 10.5 e passa
    if d.normalize().as_tuple().exponent < -2:
        raise ValueError("O valor deve ter no máximo duas casas decimais.")
    return d.quantize(Decimal("0.01"))