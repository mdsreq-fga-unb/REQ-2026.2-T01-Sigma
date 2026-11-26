"""Campos sensíveis do histórico de edições (LGPD).

Lista única, usada por todas as fichas. Um campo sensível aparece no histórico com o
nome, mas com `sensivel=True` e **sem valor anterior nem novo**.

Um caminho é a tupla de chaves do campo, como nos ROTULOS de cada schema
(ex.: ("dados_pessoais", "cpf")). Um prefixo listado em PREFIXOS_SENSIVEIS vale para
todos os campos que começam por ele (ex.: todos os de documentação civil).
"""
from collections.abc import Sequence

# Caminhos exatos
CAMINHOS_SENSIVEIS: frozenset[tuple[str, ...]] = frozenset({
    ("dados_pessoais", "nis"),
    ("dados_pessoais", "cpf"),
    ("dados_pessoais", "raca"),
    ("aluno", "nis"),
    ("aluno", "cpf"),
    ("aluno", "raca"),
    ("responsavel", "cpf"),        # termos de imagem e de saída e cadastro do card
    ("responsavel", "rg"),         # termo de imagem
    ("nucleo_familiar", "membro", "renda_mensal"),
    ("moradia", "valor"),          # valor mensal da moradia (decisão da equipe)
})

# Prefixos: documentos civis e saúde inteiros
PREFIXOS_SENSIVEIS: tuple[tuple[str, ...], ...] = (
    ("documentacao_civil",),
    ("saude",),
)


def e_sensivel(caminho: Sequence[str]) -> bool:
    caminho = tuple(caminho)
    if caminho in CAMINHOS_SENSIVEIS:
        return True
    return any(caminho[: len(prefixo)] == prefixo for prefixo in PREFIXOS_SENSIVEIS)
