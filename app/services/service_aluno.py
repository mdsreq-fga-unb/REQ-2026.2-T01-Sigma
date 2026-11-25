"""Regras de negócio do cadastro do card do aluno e visão geral (UC04 / issue #108)."""
import logging
from typing import Any

from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.exceptions import (
    AlunoNaoEncontradoError,
    DuplicidadeError,
    EtapaNaoEncontradaError,
    FalhaAoSalvarError,
    ServidorIndisponivelError,
)
from app.models.aluno import Aluno, Raca, StatusAluno
from app.models.documento import TipoDocumento
from app.models.matricula import Matricula
from app.models.ops import Tipo
from app.models.pessoa import Pessoa
from app.models.responsavel import Responsavel
from app.models.user import Usuario
from app.repository import repository_aluno
from app.schemas.aluno import (
    ROTULOS,
    AlunoCardCreate,
    AlunoVisaoGeralResponse,
    DocumentoChecklistItem,
    DocumentosChecklistResponse,
    EtapaResumo,
    FichasStatusResponse,
    FichaStatusItem,
    ResponsavelResumoResponse,
    ResumoCardResponse,
    TurmaEtapaResumoResponse,
    TurmaResumoCard,
    UltimaEdicaoResponse,
)
from app.schemas.requerimento import ROTULOS_DOCUMENTO, ROTULOS_RACA, ROTULOS_SEXO
from app.services import service_historico, service_status_matricula, service_termo_imagem

logger = logging.getLogger(__name__)

MENSAGEM_CPF_ALUNO_DUPLICADO = "Já existe um aluno cadastrado com este CPF."
MENSAGEM_NIS_ALUNO_DUPLICADO = "Já existe um aluno cadastrado com este NIS."
MENSAGEM_DUPLICIDADE_GENERICA = "Os dados informados já pertencem a outro aluno (CPF ou NIS)."

ORDEM_DOCUMENTOS: tuple[TipoDocumento, ...] = (
    TipoDocumento.CERTIDAO_NASCIMENTO,
    TipoDocumento.COMPROVANTE_RESIDENCIA,
    TipoDocumento.FOTO_3X4,
    TipoDocumento.CARTAO_VACINA,
    TipoDocumento.HISTORICO_ESCOLAR,
)

FORMATADORES_HISTORICO = {
    ("aluno", "sexo"): service_historico.rotulo_de(type(next(iter(ROTULOS_SEXO))), ROTULOS_SEXO),
    ("aluno", "raca"): service_historico.rotulo_de(Raca, ROTULOS_RACA),
}


def _selecionar_matricula(aluno: Aluno) -> Matricula | None:
    """Seleciona a matrícula mais recente do aluno."""
    if not aluno.matriculas:
        return None
    return max(aluno.matriculas, key=lambda m: (m.ano, m.data_matricula, m.id))


def _documentos_checklist(matricula: Matricula) -> DocumentosChecklistResponse:
    rm = matricula.requerimento
    entregues_set = set(rm.documentos_entregues or []) if rm is not None else set()
    itens = [
        DocumentoChecklistItem(
            tipo=doc.name,
            nome=ROTULOS_DOCUMENTO[doc],
            entregue=(doc.value in entregues_set or doc.name in entregues_set),
        )
        for doc in ORDEM_DOCUMENTOS
    ]
    return DocumentosChecklistResponse(
        itens=itens,
        entregues=sum(1 for item in itens if item.entregue),
        total=len(ORDEM_DOCUMENTOS),
    )


def _montar_visao_geral(
    db: Session,
    aluno: Aluno,
    matricula: Matricula,
    pessoa_resp: Pessoa | None,
) -> AlunoVisaoGeralResponse:
    fichas_dict = service_status_matricula.status_fichas_matricula(matricula)
    status_card = service_status_matricula.calcular_status_matricula(matricula, fichas_dict)

    etapa_resumo = EtapaResumo(id=matricula.etapa.id, nome=matricula.etapa.nome) if matricula.etapa else None
    turma_obj = aluno.turma
    turma_resumo = (
        TurmaResumoCard(
            id=turma_obj.id,
            nome=turma_obj.nome,
            turno=turma_obj.turno.value if turma_obj.turno else None,
            status=turma_obj.status.value,
        )
        if turma_obj is not None
        else None
    )

    rm = matricula.requerimento
    telefone_aluno = (rm.telefone_requerimento if rm is not None else None) or aluno.telefone
    endereco = service_termo_imagem.montar_endereco_aluno(aluno) or None

    ultima = repository_aluno.buscar_ultima_edicao(db, aluno.id)
    ultima_edicao = (
        UltimaEdicaoResponse(data=ultima[0].data_op, autor=ultima[1].nome)
        if ultima is not None
        else None
    )

    return AlunoVisaoGeralResponse(
        id_aluno=aluno.id,
        id_matricula=matricula.id,
        nome=aluno.nome,
        data_nasc=aluno.data_nasc,
        status=status_card,
        etapa=etapa_resumo,
        turma=turma_resumo,
        ano_letivo=matricula.ano,
        data_matricula=matricula.data_matricula,
        fichas=FichasStatusResponse(
            requerimento=FichaStatusItem(completa=fichas_dict["requerimento"]),
            socioeconomica=FichaStatusItem(completa=fichas_dict["socioeconomica"]),
            termo_imagem=FichaStatusItem(completa=fichas_dict["termo_imagem"]),
            termo_saida=FichaStatusItem(completa=fichas_dict["termo_saida"]),
            termo_compromisso=FichaStatusItem(completa=fichas_dict["termo_compromisso"]),
        ),
        resumo=ResumoCardResponse(
            responsavel=ResponsavelResumoResponse(
                nome=pessoa_resp.nome if pessoa_resp is not None else "",
                parentesco=aluno.parentesco_responsavel,
                telefone=aluno.responsavel.telefone if aluno.responsavel else None,
                cpf=pessoa_resp.cpf if pessoa_resp is not None else None,
            ),
            telefone=telefone_aluno,
            endereco=endereco,
            turma_etapa=TurmaEtapaResumoResponse(
                etapa=matricula.etapa.nome if matricula.etapa else None,
                turma=turma_obj.nome if turma_obj is not None else None,
            ),
        ),
        documentos=_documentos_checklist(matricula),
        ultima_edicao=ultima_edicao,
    )


def _mapa_historico_criacao(dados: AlunoCardCreate) -> dict[tuple[str, ...], Any]:
    raca = dados.aluno.raca or Raca.NAO_DECLARADO
    return {
        ("aluno", "nome"): dados.aluno.nome,
        ("aluno", "data_nasc"): dados.aluno.data_nasc,
        ("aluno", "sexo"): dados.aluno.sexo,
        ("aluno", "cpf"): dados.aluno.cpf,
        ("aluno", "nis"): dados.aluno.nis,
        ("aluno", "naturalidade"): dados.aluno.naturalidade,
        ("aluno", "uf"): dados.aluno.uf,
        ("aluno", "nacionalidade"): dados.aluno.nacionalidade,
        ("aluno", "raca"): raca,
        ("responsavel", "nome"): dados.responsavel.nome,
        ("responsavel", "parentesco"): dados.responsavel.parentesco,
        ("responsavel", "cpf"): dados.responsavel.cpf,
        ("responsavel", "telefone"): dados.responsavel.telefone,
        ("matricula", "id_etapa"): dados.matricula.id_etapa,
        ("matricula", "ano"): dados.matricula.ano,
        ("matricula", "data_matricula"): dados.matricula.data_matricula,
    }


def _mensagem_de_unicidade(exc: IntegrityError) -> str:
    texto = str(exc.orig).lower()
    if "_nis_" in texto or "aluno.nis" in texto:
        return MENSAGEM_NIS_ALUNO_DUPLICADO
    if "_cpf_" in texto or "aluno.cpf" in texto:
        return MENSAGEM_CPF_ALUNO_DUPLICADO
    return MENSAGEM_DUPLICIDADE_GENERICA


def criar_card_aluno(
    db: Session,
    dados: AlunoCardCreate,
    usuario: Usuario,
) -> AlunoVisaoGeralResponse:
    """Cadastra responsável (ou reaproveita por CPF), aluno, matrícula e histórico em transação única."""
    try:
        etapa = repository_aluno.buscar_etapa_por_id(db, dados.matricula.id_etapa)
        if etapa is None:
            raise EtapaNaoEncontradaError()

        if repository_aluno.existe_aluno_com_cpf(db, dados.aluno.cpf):
            raise DuplicidadeError(MENSAGEM_CPF_ALUNO_DUPLICADO)
        if dados.aluno.nis and repository_aluno.existe_aluno_com_nis(db, dados.aluno.nis):
            raise DuplicidadeError(MENSAGEM_NIS_ALUNO_DUPLICADO)

        responsavel = None
        if dados.responsavel.cpf:
            responsavel = repository_aluno.buscar_responsavel_por_cpf(db, dados.responsavel.cpf)

        if responsavel is None:
            pessoa_resp = Pessoa(
                nome=dados.responsavel.nome,
                cpf=dados.responsavel.cpf,
            )
            db.add(pessoa_resp)
            db.flush()

            responsavel = Responsavel(
                id_pessoa=pessoa_resp.id,
                telefone=dados.responsavel.telefone,
            )
            db.add(responsavel)
            db.flush()

        aluno = Aluno(
            nome=dados.aluno.nome,
            data_nasc=dados.aluno.data_nasc,
            nis=dados.aluno.nis,
            cpf=dados.aluno.cpf,
            sexo=dados.aluno.sexo,
            raca=dados.aluno.raca or Raca.NAO_DECLARADO,
            nacionalidade=dados.aluno.nacionalidade,
            uf=dados.aluno.uf,
            naturalidade=dados.aluno.naturalidade,
            status=StatusAluno.ATIVO,
            responsavel_id=responsavel.id,
            parentesco_responsavel=dados.responsavel.parentesco,
            turma_id=None,
        )
        db.add(aluno)
        db.flush()

        matricula = Matricula(
            ano=dados.matricula.ano,
            data_matricula=dados.matricula.data_matricula,
            id_aluno=aluno.id,
            id_etapa=etapa.id,
        )
        db.add(matricula)
        db.flush()

        alteracoes = service_historico.itens_alterados(
            {},
            _mapa_historico_criacao(dados),
            ROTULOS,
            "Card do aluno",
            FORMATADORES_HISTORICO,
        )
        descricao = service_historico.descrever(
            "Card do aluno",
            "cadastrado",
            matricula.ano,
            service_historico.nomes(alteracoes),
        )
        service_historico.registrar(
            db,
            usuario,
            aluno.id,
            Tipo.MATRICULA,
            descricao,
            alteracoes,
        )

        db.commit()
    except (EtapaNaoEncontradaError, DuplicidadeError):
        db.rollback()
        raise
    except IntegrityError as exc:
        db.rollback()
        logger.warning("Conflito de unicidade ao cadastrar card do aluno: %s", type(exc).__name__)
        raise DuplicidadeError(_mensagem_de_unicidade(exc)) from exc
    except SQLAlchemyError as exc:
        db.rollback()
        logger.error("Falha ao cadastrar card do aluno: %s", type(exc).__name__)
        raise FalhaAoSalvarError() from exc

    return obter_visao_geral_aluno(db, aluno.id)


def obter_visao_geral_aluno(db: Session, id_aluno: int) -> AlunoVisaoGeralResponse:
    """Retorna a visão geral consolidada do card do aluno (404 se não existir)."""
    try:
        aluno = repository_aluno.buscar_aluno_visao_geral(db, id_aluno)
        if aluno is None:
            raise AlunoNaoEncontradoError()
        matricula = _selecionar_matricula(aluno)
        if matricula is None:
            raise AlunoNaoEncontradoError("Matrícula do aluno não encontrada.")
        pessoa_resp = (
            repository_aluno.buscar_pessoa_por_id(db, aluno.responsavel.id_pessoa)
            if aluno.responsavel is not None
            else None
        )
        return _montar_visao_geral(db, aluno, matricula, pessoa_resp)
    except AlunoNaoEncontradoError:
        raise
    except SQLAlchemyError as exc:
        logger.error("Falha ao consultar visão geral do aluno: %s", type(exc).__name__)
        raise ServidorIndisponivelError() from exc
