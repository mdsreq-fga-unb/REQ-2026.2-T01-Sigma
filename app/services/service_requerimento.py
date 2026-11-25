"""Regras do Requerimento de matrícula (UC04).

Fluxos tratados: preenchimento (FP01), edição (FA01), histórico de edições (FA04), campos
obrigatórios (FE01) e nada salvo pela metade (FE04).

Onde cada seção é gravada:
- dados pessoais e endereço: `Aluno` (são do aluno e valem para todas as matrículas);
- ano letivo e data da matrícula: `Matricula`;
- documentação civil: `DocumentacaoCivil` (1:1 com o aluno);
- filiação, telefone, termo de compromisso e transferência: `RequerimentoMatricula` (por matrícula);
- saúde: `Saude` (1:1 com o requerimento).
Ano de escolaridade (etapa) e turma são somente leitura: a troca de turma é do UC07.
"""
import logging
from datetime import datetime
from enum import Enum
from typing import Any

from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.exceptions import (
    DuplicidadeError,
    FalhaAoSalvarError,
    MatriculaNaoEncontradaError,
    ServidorIndisponivelError,
)
from app.core.tempo import agora_utc
from app.models.aluno import Raca, Sexo
from app.models.documentacao_civil import TipoCertidao
from app.models.documento import TipoDocumento
from app.models.matricula import Matricula
from app.models.ops import Tipo
from app.models.saude import AcompanhamentoMedico, ProblemaSaude
from app.models.user import Usuario
from app.repository import repository_matricula
from app.schemas.requerimento import (
    ROTULOS,
    ROTULOS_ACOMPANHAMENTO,
    ROTULOS_CERTIDAO,
    ROTULOS_DOCUMENTO,
    ROTULOS_PROBLEMA_SAUDE,
    ROTULOS_RACA,
    ROTULOS_SEXO,
    RequerimentoResponse,
    RequerimentoUpdate,
    ficha_completa,
)
from app.schemas.termo_comum import Caminho, valor_em
from app.services import service_historico, service_pdf

logger = logging.getLogger(__name__)

NOME_FICHA = "Requerimento de matrícula"
TITULO_PDF = "Requerimento de Matrícula"
TEMPLATE_PDF = "fichas/requerimento.html"
PREFIXO_ARQUIVO_PDF = "requerimento"
LINHAS_RENOVACAO_PDF = 6  # quadros "Matrícula renovada em" do modelo em papel

MENSAGEM_CPF_DUPLICADO = "Já existe um aluno cadastrado com este CPF."
MENSAGEM_NIS_DUPLICADO = "Já existe um aluno cadastrado com este NIS."
MENSAGEM_RG_DUPLICADO = "Já existe um aluno cadastrado com este RG nesta UF."
MENSAGEM_DUPLICIDADE_GENERICA = "Os dados informados já pertencem a outro aluno (CPF, NIS ou RG)."


# Conversões entre o banco e a API


def _nome_do_enum(valor: Any) -> str | None:
    return valor.name if isinstance(valor, Enum) else valor


def _nomes_da_lista(valores: list[str] | None, enum_cls: type[Enum]) -> list[str]:
    """Valores gravados no JSON -> nomes do enum (os da API). Valor desconhecido (ex.: dado
    antigo migrado) é devolvido como está, para não sumir: o PUT pede para corrigi-lo."""
    nomes = []
    for valor in valores or []:
        if valor in enum_cls.__members__:
            nomes.append(valor)
        else:
            try:
                nomes.append(enum_cls(valor).name)
            except ValueError:
                nomes.append(valor)
    return nomes


def _valores_da_lista(nomes: list[str], enum_cls: type[Enum]) -> list[str]:
    """Nomes do enum (API) -> valores gravados no JSON, como o model documenta."""
    return [enum_cls[nome].value for nome in nomes]


def _so_digitos(valor: str | None) -> str | None:
    """CEP antigo pode estar com hífen: a API sempre devolve só os dígitos."""
    if valor is None:
        return None
    return "".join(c for c in valor if c.isdigit()) or None


# Montagem dos dados


def _dados_da_ficha(matricula: Matricula) -> dict[str, Any]:
    """Estado da ficha no mesmo formato do corpo da requisição (dicionário aninhado)."""
    aluno = matricula.aluno
    doc = aluno.documentacao_civil
    rm = matricula.requerimento
    saude = rm.saude if rm is not None else None

    def de_doc(campo: str) -> Any:
        return getattr(doc, campo) if doc is not None else None

    def de_rm(campo: str) -> Any:
        return getattr(rm, campo) if rm is not None else None

    return {
        "dados_pessoais": {
            "nome": aluno.nome,
            "data_nascimento": aluno.data_nasc,
            "sexo": _nome_do_enum(aluno.sexo),
            "nis": aluno.nis,
            "cpf": aluno.cpf,
            "naturalidade": aluno.naturalidade,
            "uf": aluno.uf,
            "nacionalidade": aluno.nacionalidade,
            "raca": _nome_do_enum(aluno.raca),
        },
        "matricula": {"ano_letivo": matricula.ano, "data_matricula": matricula.data_matricula},
        "documentacao_civil": {
            "rg": de_doc("rg"),
            "orgao_emissor": de_doc("orgao_emissor"),
            "uf_rg": de_doc("uf_rg"),
            "data_expedicao": de_doc("data_expedicao"),
            "tipo_certidao": _nome_do_enum(de_doc("tipo_certidao")),
            "num_termo": de_doc("num_termo"),
            "folha": de_doc("folha"),
            "livro": de_doc("livro"),
            "data_emissao_certidao": de_doc("data_emissao_certidao"),
            "nome_cartorio": de_doc("nome_cartorio"),
            "uf_cartorio": de_doc("uf_cartorio"),
            "documento_estrangeiro": de_doc("documento_estrangeiro"),
        },
        "filiacao": {
            "pai": {
                "nome": de_rm("nome_pai"),
                "escolaridade": de_rm("esc_pai"),
                "local_trabalho": de_rm("loc_pai"),
                "telefone_trabalho": de_rm("tel_pai"),
            },
            "mae": {
                "nome": de_rm("nome_mae"),
                "escolaridade": de_rm("esc_mae"),
                "local_trabalho": de_rm("loc_mae"),
                "telefone_trabalho": de_rm("tel_mae"),
            },
        },
        "endereco_contato": {
            "logradouro": aluno.logradouro,
            "numero": aluno.numero,
            "bairro": aluno.bairro,
            "cidade": aluno.cidade,
            "uf": aluno.uf_residencia,
            "cep": _so_digitos(aluno.cep),
            "telefone": de_rm("telefone_requerimento"),
        },
        "saude": {
            "problemas": _nomes_da_lista(saude.tipo if saude else None, ProblemaSaude),
            "observacao_problemas": saude.descricao if saude else None,
            "acompanhamentos": _nomes_da_lista(saude.acomp if saude else None, AcompanhamentoMedico),
            "observacao_acompanhamentos": saude.descricao_acomp if saude else None,
        },
        "termo_compromisso": {
            "nome_responsavel": de_rm("nome_resp_compromisso"),
            "documentos_entregues": _nomes_da_lista(de_rm("documentos_entregues"), TipoDocumento),
        },
        "transferencia": {
            "data_pedido": de_rm("data_ped_transf"),
            "data_entrega": de_rm("data_ent_transf"),
            "nome_responsavel": de_rm("nome_resp_transferencia"),
        },
    }


# Textos legíveis no histórico (o banco guarda o nome do enum)
FORMATADORES_HISTORICO = {
    ("dados_pessoais", "sexo"): service_historico.rotulo_de(Sexo, ROTULOS_SEXO),
    ("dados_pessoais", "raca"): service_historico.rotulo_de(Raca, ROTULOS_RACA),
    ("termo_compromisso", "documentos_entregues"): service_historico.rotulo_de(TipoDocumento, ROTULOS_DOCUMENTO),
}


def _foto(dados: dict[str, Any]) -> dict[Caminho, Any]:
    """Fotografia da ficha para comparar antes e depois de salvar (histórico de edições).
    Listas são comparadas sem levar em conta a ordem."""
    foto = {}
    for caminho in ROTULOS:
        valor = valor_em(dados, caminho)
        foto[caminho] = tuple(sorted(valor)) if isinstance(valor, list) else valor
    return foto


def _ultima_alteracao(matricula: Matricula) -> datetime | None:
    rm = matricula.requerimento
    return rm.updated_at if rm is not None else None


def _montar_resposta(matricula: Matricula) -> RequerimentoResponse:
    """Resposta do GET e do PUT. Sem requerimento salvo: dados pessoais, endereço e documentação
    civil (que são do aluno) preenchidos, demais seções vazias e `completa` falso."""
    dados = _dados_da_ficha(matricula)
    turma = matricula.aluno.turma
    rm = matricula.requerimento
    dados["matricula"] = {
        **dados["matricula"],
        "ano_escolaridade": matricula.etapa.nome if matricula.etapa is not None else None,
        "turma": turma.nome if turma is not None else None,
    }
    return RequerimentoResponse(
        **dados,
        completa=rm is not None and ficha_completa(dados),
        created_at=rm.created_at if rm is not None else None,
        updated_at=_ultima_alteracao(matricula),
    )


def _buscar_matricula(db: Session, id_matricula: int) -> Matricula:
    try:
        matricula = repository_matricula.buscar_matricula_com_requerimento(db, id_matricula)
    except SQLAlchemyError as exc:
        logger.error("Falha ao consultar o requerimento de matrícula: %s", type(exc).__name__)
        raise ServidorIndisponivelError() from exc
    if matricula is None:
        raise MatriculaNaoEncontradaError()
    return matricula


def _conferir_duplicidade(db: Session, matricula: Matricula, dados: RequerimentoUpdate) -> None:
    """CPF, NIS e RG (por UF) não podem pertencer a outro aluno (409)."""
    id_aluno = matricula.id_aluno
    pessoais, doc = dados.dados_pessoais, dados.documentacao_civil
    try:
        if repository_matricula.existe_outro_aluno_com_cpf(db, pessoais.cpf, id_aluno):
            raise DuplicidadeError(MENSAGEM_CPF_DUPLICADO)
        if pessoais.nis and repository_matricula.existe_outro_aluno_com_nis(db, pessoais.nis, id_aluno):
            raise DuplicidadeError(MENSAGEM_NIS_DUPLICADO)
        if doc.rg and repository_matricula.existe_outro_aluno_com_rg(db, doc.rg, doc.uf_rg, id_aluno):
            raise DuplicidadeError(MENSAGEM_RG_DUPLICADO)
    except SQLAlchemyError as exc:
        logger.error("Falha ao conferir duplicidade no requerimento: %s", type(exc).__name__)
        raise ServidorIndisponivelError() from exc


def _mensagem_de_unicidade(exc: IntegrityError) -> str:
    """Conflito pego pelo banco (ex.: dois salvamentos ao mesmo tempo). Só o nome da restrição
    é lido; o valor nunca vai para a resposta nem para o log."""
    texto = str(exc.orig).lower()
    # PostgreSQL: nome da restrição ("uq_documentacao_civil_rg_uf", "Aluno_cpf_key").
    # SQLite: "UNIQUE constraint failed: Aluno.cpf".
    if "rg_uf" in texto or "documentacaocivil.rg" in texto:
        return MENSAGEM_RG_DUPLICADO
    if "_nis_" in texto or "aluno.nis" in texto:
        return MENSAGEM_NIS_DUPLICADO
    if "_cpf_" in texto or "aluno.cpf" in texto:
        return MENSAGEM_CPF_DUPLICADO
    return MENSAGEM_DUPLICIDADE_GENERICA


def _gravar(db: Session, matricula: Matricula, dados: RequerimentoUpdate) -> None:
    aluno = matricula.aluno
    pessoais, endereco = dados.dados_pessoais, dados.endereco_contato
    doc, filiacao = dados.documentacao_civil, dados.filiacao
    saude, compromisso, transf = dados.saude, dados.termo_compromisso, dados.transferencia

    # Dados compartilhados com as outras fichas: ficam no Aluno.
    repository_matricula.atualizar(
        aluno,
        {
            "nome": pessoais.nome,
            "data_nasc": pessoais.data_nascimento,
            "sexo": pessoais.sexo,
            "nis": pessoais.nis,
            "cpf": pessoais.cpf,
            "naturalidade": pessoais.naturalidade,
            "uf": pessoais.uf,
            "nacionalidade": pessoais.nacionalidade,
            "raca": pessoais.raca,
            "logradouro": endereco.logradouro,
            "numero": endereco.numero,
            "bairro": endereco.bairro,
            "cidade": endereco.cidade,
            "uf_residencia": endereco.uf,
            "cep": endereco.cep,
        },
    )
    repository_matricula.atualizar(
        matricula, {"ano": dados.matricula.ano_letivo, "data_matricula": dados.matricula.data_matricula}
    )

    valores_doc = doc.model_dump()
    if aluno.documentacao_civil is not None or any(v is not None for v in valores_doc.values()):
        repository_matricula.criar_ou_atualizar_documentacao_civil(db, aluno, valores_doc)

    requerimento = repository_matricula.criar_ou_atualizar_requerimento(
        db,
        matricula,
        {
            "nome_pai": filiacao.pai.nome,
            "esc_pai": filiacao.pai.escolaridade,
            "loc_pai": filiacao.pai.local_trabalho,
            "tel_pai": filiacao.pai.telefone_trabalho,
            "nome_mae": filiacao.mae.nome,
            "esc_mae": filiacao.mae.escolaridade,
            "loc_mae": filiacao.mae.local_trabalho,
            "tel_mae": filiacao.mae.telefone_trabalho,
            "telefone_requerimento": endereco.telefone,
            "nome_resp_compromisso": compromisso.nome_responsavel,
            "documentos_entregues": _valores_da_lista(compromisso.documentos_entregues, TipoDocumento),
            "data_ped_transf": transf.data_pedido,
            "data_ent_transf": transf.data_entrega,
            "nome_resp_transferencia": transf.nome_responsavel,
        },
    )
    repository_matricula.criar_ou_atualizar_saude(
        db,
        requerimento,
        {
            "tipo": _valores_da_lista(saude.problemas, ProblemaSaude),
            "descricao": saude.observacao_problemas,
            "acomp": _valores_da_lista(saude.acompanhamentos, AcompanhamentoMedico),
            "descricao_acomp": saude.observacao_acompanhamentos,
        },
    )


# Casos de uso


def obter_requerimento(db: Session, id_matricula: int) -> RequerimentoResponse:
    """Requerimento da matrícula. 404 se a matrícula não existir."""
    return _montar_resposta(_buscar_matricula(db, id_matricula))


def salvar_requerimento(
    db: Session,
    id_matricula: int,
    dados: RequerimentoUpdate,
    usuario: Usuario,
) -> RequerimentoResponse:
    """Grava aluno, matrícula, documentação civil, requerimento, saúde e histórico **em uma única
    transação** (FE04).

    Idempotente: reenviar a mesma ficha não duplica nada e, se nada mudou, não gera registro de
    edição. O histórico guarda os valores anterior e novo, exceto nos campos sensíveis (LGPD).
    """
    matricula = _buscar_matricula(db, id_matricula)
    _conferir_duplicidade(db, matricula, dados)  # 409 antes de alterar qualquer coisa

    try:
        ja_existia = matricula.requerimento is not None
        antes = _foto(_dados_da_ficha(matricula))

        _gravar(db, matricula, dados)
        db.flush()

        if not ja_existia:
            # Primeira vez: registro de preenchimento.
            descricao = service_historico.descrever(NOME_FICHA, "preenchido", matricula.ano)
            service_historico.registrar(db, usuario, matricula.id_aluno, Tipo.PREENCHIMENTO_REQUERIMENTO, descricao)
        else:
            # Demais: registro de edição com os NOMES dos campos alterados. Nada mudou, nada registrado.
            alterados = service_historico.itens_alterados(
                antes, _foto(_dados_da_ficha(matricula)), ROTULOS, NOME_FICHA, FORMATADORES_HISTORICO
            )
            if alterados:
                descricao = service_historico.descrever(
                    NOME_FICHA, "editado", matricula.ano, service_historico.nomes(alterados)
                )
                service_historico.registrar(
                    db, usuario, matricula.id_aluno, Tipo.EDICAO_REQUERIMENTO, descricao, alterados
                )
                # A ficha mudou mesmo que só o Aluno tenha mudado: `updated_at` é o da última edição.
                matricula.requerimento.updated_at = agora_utc()

        db.flush()
        db.refresh(matricula.requerimento, attribute_names=["created_at", "updated_at"])  # gerados pelo banco
        resposta = _montar_resposta(matricula)  # montada antes do commit: sem recarregar nada depois
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        logger.error("Conflito de unicidade ao salvar o requerimento (matrícula %s)", id_matricula)
        raise DuplicidadeError(_mensagem_de_unicidade(exc)) from exc
    except SQLAlchemyError as exc:
        db.rollback()
        logger.error("Falha ao salvar o requerimento (matrícula %s): %s", id_matricula, type(exc).__name__)
        raise FalhaAoSalvarError() from exc
    except Exception:
        db.rollback()
        raise
    return resposta


def exportar_pdf(db: Session, id_matricula: int, usuario: Usuario) -> tuple[bytes, str]:
    """Gera o PDF da ficha e registra a exportação. Devolve `(conteúdo, nome do arquivo)`.

    O PDF sai com o que está salvo (sem requerimento, com os dados do aluno e o resto em branco
    para preencher à mão): é o mesmo conteúdo do GET.
    """
    matricula = _buscar_matricula(db, id_matricula)
    id_aluno, ano = matricula.id_aluno, matricula.ano
    ficha = _montar_resposta(matricula)

    conteudo = service_pdf.gerar_pdf(TEMPLATE_PDF, montar_contexto_pdf(ficha))  # FalhaGeracaoPdfError -> 500

    try:
        descricao = service_historico.descrever(NOME_FICHA, "exportado em PDF", ano)
        service_historico.registrar(db, usuario, id_aluno, Tipo.EXPORTACAO_PDF, descricao)
        db.commit()
    except SQLAlchemyError as exc:
        db.rollback()
        logger.error("Falha ao registrar a exportação do requerimento: %s", type(exc).__name__)
        raise FalhaAoSalvarError("Não foi possível registrar a exportação. Tente novamente.") from exc

    nome_arquivo = service_pdf.nome_arquivo_pdf(PREFIXO_ARQUIVO_PDF, ficha.dados_pessoais.nome or "aluno", ano)
    return conteudo, nome_arquivo


# Contexto do PDF


def _rotulo(nome: str | None, enum_cls: type[Enum], rotulos: dict) -> str | None:
    if nome is None:
        return None
    return rotulos.get(enum_cls[nome], nome) if nome in enum_cls.__members__ else nome


def _opcoes(marcados: list[str], rotulos: dict) -> list[dict[str, Any]]:
    """Todas as opções do enum, na ordem da tela, com as escolhidas marcadas."""
    return [{"rotulo": rotulo, "marcada": membro.name in marcados} for membro, rotulo in rotulos.items()]


def montar_contexto_pdf(ficha: RequerimentoResponse) -> dict[str, Any]:
    """Ficha transformada em dicionário simples para o template. Nunca objetos ORM.

    CPF, NIS, telefones, CEP e datas seguem crus: os filtros do template aplicam a máscara.
    Opções (sexo, raça, certidão, saúde, documentos) já vão com o texto legível.
    """
    pessoais = ficha.dados_pessoais.model_dump()
    pessoais["sexo"] = _rotulo(pessoais["sexo"], Sexo, ROTULOS_SEXO)
    pessoais["raca"] = _rotulo(pessoais["raca"], Raca, ROTULOS_RACA)
    documentacao = ficha.documentacao_civil.model_dump()
    documentacao["tipo_certidao"] = _rotulo(documentacao["tipo_certidao"], TipoCertidao, ROTULOS_CERTIDAO)

    return {
        "titulo": TITULO_PDF,
        "ano_letivo": ficha.matricula.ano_letivo,
        "matricula": ficha.matricula.model_dump(),
        "pessoais": pessoais,
        "documentacao": documentacao,
        "filiacao": ficha.filiacao.model_dump(),
        "endereco": ficha.endereco_contato.model_dump(),
        "saude": {
            "problemas": _opcoes(ficha.saude.problemas, ROTULOS_PROBLEMA_SAUDE),
            "observacao_problemas": ficha.saude.observacao_problemas,
            "acompanhamentos": _opcoes(ficha.saude.acompanhamentos, ROTULOS_ACOMPANHAMENTO),
            "observacao_acompanhamentos": ficha.saude.observacao_acompanhamentos,
        },
        "compromisso": {
            "nome_responsavel": ficha.termo_compromisso.nome_responsavel,
            "documentos": _opcoes(ficha.termo_compromisso.documentos_entregues, ROTULOS_DOCUMENTO),
        },
        "transferencia": ficha.transferencia.model_dump(),
        "linhas_renovacao": LINHAS_RENOVACAO_PDF,
    }
