"""Regras do Termo de autorização de saída do aluno (UC04).

Fluxos tratados: preenchimento (FP01), edição (FA01), histórico de edições (FA04),
campos obrigatórios (FE01) e nada salvo pela metade (FE04).

O termo é **por matrícula**. As pessoas autorizadas são salvas junto com o termo, como lista
completa, e nunca por rotas separadas. O local é fixo e vem da configuração da aplicação.
"""
import logging
from typing import Any

from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.exceptions import (
    DadosInvalidosError,
    FalhaAoSalvarError,
    MatriculaNaoEncontradaError,
    ServidorIndisponivelError,
)
from app.models.matricula import Matricula
from app.models.ops import Tipo
from app.models.termo_saida import FormaSaida, TermoSaida
from app.models.user import Usuario
from app.repository import repository_termos
from app.schemas.termo_comum import AlunoTermoResponse, Caminho, valor_em
from app.schemas.termo_saida import (
    MAX_PESSOAS_AUTORIZADAS,
    ROTULO_PESSOAS,
    ROTULOS,
    ROTULOS_FORMA_SAIDA,
    PessoaAutorizadaResponse,
    ResponsavelSaidaResponse,
    SaidaEscolaResponse,
    TermoSaidaResponse,
    TermoSaidaUpdate,
    rotulo_pessoa,
    termo_completo,
)
from app.services import service_historico, service_pdf

logger = logging.getLogger(__name__)

NOME_TERMO = "Termo de autorização de saída do aluno"
TITULO_PDF = "Termo de Autorização de Saída do Aluno"
TEMPLATE_PDF = "fichas/termo_saida.html"
PREFIXO_ARQUIVO_PDF = "termo-saida"
OBSERVACAO_PDF = "Se outra pessoa for buscar a criança, a escola precisa ser avisada com antecedência."

_CAMINHO_DATA: Caminho = ("data",)


# Montagem dos dados

def _dados_do_termo(termo: TermoSaida | None) -> dict[str, Any]:
    """Estado do termo no mesmo formato do corpo da requisição (dicionário aninhado).

    As pessoas saem na ordem de cadastro (por id), que é também a ordem do PDF e do histórico.
    """
    if termo is None:
        return {
            "responsavel": {"nome": None},
            "periodo": None,
            "saida": {"forma_saida": None, "descricao_outros": None},
            "pessoas_autorizadas": [],
            "data": None,
        }
    pessoas = sorted(termo.pessoas_autorizadas, key=lambda p: (p.id is None, p.id or 0))
    return {
        "responsavel": {"nome": termo.resp_nome},
        "periodo": termo.periodo,
        "saida": {"forma_saida": termo.tipo_saida, "descricao_outros": termo.descricao_outros},
        "pessoas_autorizadas": [{"id": p.id, "nome": p.nome, "parentesco": p.parentesco} for p in pessoas],
        "data": termo.data,
    }


FORMATADORES_HISTORICO = {
    ("saida", "forma_saida"): service_historico.rotulo_de(FormaSaida, ROTULOS_FORMA_SAIDA),
}


def _foto(dados: dict[str, Any]) -> dict[Caminho, Any]:
    return {caminho: valor_em(dados, caminho) for caminho in ROTULOS}


def _itens_pessoas(antes: list[dict[str, Any]], depois: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Uma linha por pessoa adicionada/removida (com o nome) e por campo alterado de cada pessoa."""
    por_id_antes = {p["id"]: p for p in antes}
    ids_depois = {p["id"] for p in depois}
    itens: list[dict[str, Any]] = []

    for pessoa in depois:
        if pessoa["id"] not in por_id_antes:
            itens.append(service_historico.item(NOME_TERMO, f"{ROTULO_PESSOAS} – pessoa adicionada", None, pessoa["nome"]))
    for pessoa in antes:
        if pessoa["id"] not in ids_depois:
            itens.append(service_historico.item(NOME_TERMO, f"{ROTULO_PESSOAS} – pessoa removida", pessoa["nome"], None))

    for posicao, pessoa in enumerate(depois, start=1):
        anterior = por_id_antes.get(pessoa["id"])
        if anterior is None:
            continue
        for campo in ("nome", "parentesco"):
            if anterior[campo] != pessoa[campo]:
                itens.append(service_historico.item(NOME_TERMO, rotulo_pessoa(posicao, campo), anterior[campo], pessoa[campo]))
    return itens


def _itens_alterados(antes: dict[str, Any], depois: dict[str, Any]) -> list[dict[str, Any]]:
    """Itens alterados na ordem da tela: responsável, período, saída, pessoas e, por fim, a data."""
    foto_antes, foto_depois = _foto(antes), _foto(depois)
    sem_data = {caminho: rotulo for caminho, rotulo in ROTULOS.items() if caminho != _CAMINHO_DATA}
    so_data = {_CAMINHO_DATA: ROTULOS[_CAMINHO_DATA]}

    return (
        service_historico.itens_alterados(foto_antes, foto_depois, sem_data, NOME_TERMO, FORMATADORES_HISTORICO)
        + _itens_pessoas(antes["pessoas_autorizadas"], depois["pessoas_autorizadas"])
        + service_historico.itens_alterados(foto_antes, foto_depois, so_data, NOME_TERMO, FORMATADORES_HISTORICO)
    )


def _conferir_ids_das_pessoas(termo: TermoSaida | None, dados: TermoSaidaUpdate) -> None:
    """O `id` de uma pessoa enviada precisa pertencer ao termo desta matrícula (senão, 422)."""
    ids_do_termo = {pessoa.id for pessoa in termo.pessoas_autorizadas} if termo is not None else set()
    erros = [
        {
            "type": "pessoa_autorizada_invalida",
            "loc": ["body", "pessoas_autorizadas", indice, "id"],
            "msg": f"{rotulo_pessoa(indice + 1, 'id')}: a pessoa informada não pertence ao termo desta matrícula.",
        }
        for indice, pessoa in enumerate(dados.pessoas_autorizadas)
        if pessoa.id is not None and pessoa.id not in ids_do_termo
    ]
    if erros:
        raise DadosInvalidosError(erros)


def _valores_para_gravar(dados: TermoSaidaUpdate) -> dict[str, Any]:
    return {
        "resp_nome": dados.responsavel.nome,
        "periodo": dados.periodo,
        "tipo_saida": dados.saida.forma_saida,
        "descricao_outros": dados.saida.descricao_outros,
        "data": dados.data,
    }


def _montar_resposta(matricula: Matricula, termo: TermoSaida | None) -> TermoSaidaResponse:
    """Resposta do GET e do PUT. Sem termo salvo: seções vazias, local da configuração e
    `completa` falso. O local nunca vem do banco nem do corpo da requisição."""
    dados = _dados_do_termo(termo)
    return TermoSaidaResponse(
        aluno=AlunoTermoResponse.de_matricula(matricula),
        responsavel=ResponsavelSaidaResponse(**dados["responsavel"]),
        periodo=dados["periodo"],
        saida=SaidaEscolaResponse(**dados["saida"]),
        pessoas_autorizadas=[PessoaAutorizadaResponse(**pessoa) for pessoa in dados["pessoas_autorizadas"]],
        local=settings.local_termo_saida,
        data=dados["data"],
        completa=termo is not None and termo_completo(dados),
        created_at=termo.created_at if termo is not None else None,
        updated_at=termo.updated_at if termo is not None else None,
    )


def _buscar_matricula(db: Session, id_matricula: int) -> Matricula:
    try:
        matricula = repository_termos.buscar_matricula_com_termo_saida(db, id_matricula)
    except SQLAlchemyError as exc:
        logger.error("Falha ao consultar o termo de saída: %s", type(exc).__name__)
        raise ServidorIndisponivelError() from exc
    if matricula is None:
        raise MatriculaNaoEncontradaError()
    return matricula


# Casos de uso

def obter_termo(db: Session, id_matricula: int) -> TermoSaidaResponse:
    """Termo da matrícula. 404 se a matrícula não existir."""
    matricula = _buscar_matricula(db, id_matricula)
    return _montar_resposta(matricula, matricula.termo_saida)


def salvar_termo(
    db: Session,
    id_matricula: int,
    dados: TermoSaidaUpdate,
    usuario: Usuario,
) -> TermoSaidaResponse:
    """Cria ou atualiza o termo, sincroniza as pessoas autorizadas e registra o histórico,
    **tudo em uma única transação** (FE04).

    Idempotente: reenviar o mesmo termo (com o `id` das pessoas já salvas) não duplica pessoas e,
    se nada mudou, não gera registro de edição. O histórico guarda só os nomes dos campos
    alterados, nunca os valores (LGPD).
    """
    matricula = _buscar_matricula(db, id_matricula)
    from app.services.service_status_matricula import garantir_editavel
    garantir_editavel(matricula)
    termo_anterior = matricula.termo_saida
    _conferir_ids_das_pessoas(termo_anterior, dados)  # 422 antes de alterar qualquer coisa: nada a desfazer

    try:
        antes = _dados_do_termo(termo_anterior)

        termo = repository_termos.criar_ou_atualizar_termo_saida(db, matricula, _valores_para_gravar(dados))
        repository_termos.sincronizar_pessoas_autorizadas(
            termo, [pessoa.model_dump() for pessoa in dados.pessoas_autorizadas]
        )
        db.flush()  # gera o id das pessoas novas

        if termo_anterior is None:
            # Primeira vez: registro de preenchimento.
            descricao = service_historico.descrever(NOME_TERMO, "preenchido", matricula.ano)
            service_historico.registrar(db, usuario, matricula.id_aluno, Tipo.PREENCHIMENTO_TERMO_SAIDA, descricao)
        else:
            # Demais: registro de edição com os NOMES dos campos alterados. Nada mudou, nada registrado.
            alterados = _itens_alterados(antes, _dados_do_termo(termo))
            if alterados:
                descricao = service_historico.descrever(
                    NOME_TERMO, "editado", matricula.ano, service_historico.nomes(alterados)
                )
                service_historico.registrar(
                    db, usuario, matricula.id_aluno, Tipo.EDICAO_TERMO_SAIDA, descricao, alterados
                )

        db.flush()
        db.refresh(termo, attribute_names=["created_at", "updated_at"])  # gerados pelo banco
        resposta = _montar_resposta(matricula, termo)  # montada antes do commit: sem recarregar nada depois
        db.commit()
    except SQLAlchemyError as exc:
        db.rollback()
        logger.error("Falha ao salvar o termo de saída (matrícula %s): %s", id_matricula, type(exc).__name__)
        raise FalhaAoSalvarError() from exc
    except Exception:
        db.rollback()
        raise
    return resposta


def exportar_pdf(db: Session, id_matricula: int, usuario: Usuario) -> tuple[bytes, str]:
    """Gera o PDF do termo e registra a exportação. Devolve `(conteúdo, nome do arquivo)`.

    O PDF sai com o que está salvo (ou em branco, se o termo ainda não existe): é o mesmo
    conteúdo do GET.
    """
    matricula = _buscar_matricula(db, id_matricula)
    id_aluno, ano = matricula.id_aluno, matricula.ano
    termo = _montar_resposta(matricula, matricula.termo_saida)

    conteudo = service_pdf.gerar_pdf(TEMPLATE_PDF, montar_contexto_pdf(termo))  # FalhaGeracaoPdfError -> 500

    try:
        descricao = service_historico.descrever(NOME_TERMO, "exportado em PDF", ano)
        service_historico.registrar(db, usuario, id_aluno, Tipo.EXPORTACAO_PDF, descricao)
        db.commit()
    except SQLAlchemyError as exc:
        db.rollback()
        logger.error("Falha ao registrar a exportação do termo de saída: %s", type(exc).__name__)
        raise FalhaAoSalvarError("Não foi possível registrar a exportação. Tente novamente.") from exc

    nome_arquivo = service_pdf.nome_arquivo_pdf(PREFIXO_ARQUIVO_PDF, termo.aluno.nome, ano)
    return conteudo, nome_arquivo


# Contexto do PDF

def montar_contexto_pdf(termo: TermoSaidaResponse) -> dict[str, Any]:
    """Termo transformado em dicionário simples para o template. Nunca objetos ORM.

    Todas as formas de saída entram na lista, com a escolhida marcada. A tabela de pessoas
    sai sempre com no mínimo 4 linhas, preenchidas ou em branco.
    """
    forma = termo.saida.forma_saida
    formas_saida = [
        {
            "rotulo": ROTULOS_FORMA_SAIDA[opcao],
            "marcada": forma == opcao,
            "com_descricao": opcao == FormaSaida.OUTROS,
            "descricao": termo.saida.descricao_outros if opcao == FormaSaida.OUTROS else None,
        }
        for opcao in FormaSaida
    ]

    pessoas = [
        {"numero": numero, "nome": pessoa.nome, "parentesco": pessoa.parentesco}
        for numero, pessoa in enumerate(termo.pessoas_autorizadas, start=1)
    ]
    while len(pessoas) < MAX_PESSOAS_AUTORIZADAS:
        pessoas.append({"numero": len(pessoas) + 1, "nome": "", "parentesco": ""})

    return {
        "titulo": TITULO_PDF,
        "ano_letivo": termo.aluno.ano_letivo,
        "aluno": {
            "nome": termo.aluno.nome,
            "data_nascimento": termo.aluno.data_nascimento,
            "etapa": termo.aluno.etapa,
            "periodo": termo.periodo,
        },
        "responsavel_nome": termo.responsavel.nome,
        "formas_saida": formas_saida,
        "pessoas": pessoas,
        "observacao": OBSERVACAO_PDF,
        "local": termo.local,
        "data": termo.data,
    }
