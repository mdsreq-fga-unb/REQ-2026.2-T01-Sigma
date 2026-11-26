"""Cálculo de status da matrícula e proteção de edição para cards inativos (UC04).

Regras centralizadas:
- RN01 / RN02 / RN03: matrícula só é ATIVO quando todas as 5 fichas obrigatórias estão
  completas E o aluno está vinculado a uma turma ativa da mesma etapa da matrícula.
  Antes disso, o status é PENDENTE.
- RN10 / FE03: se `Aluno.status == StatusAluno.INATIVO`, o status do card é INATIVO e
  qualquer tentativa de edição nas fichas ou no card é bloqueada (`MatriculaInativaError`).
"""
from app.core.exceptions import MatriculaInativaError
from app.models.aluno import StatusAluno
from app.models.matricula import Matricula
from app.models.turma import StatusTurma
from app.schemas.requerimento import ficha_completa as requerimento_completo
from app.schemas.termo_imagem import termo_completo as termo_imagem_completo
from app.schemas.termo_saida import termo_completo as termo_saida_completo


def termo_compromisso_completo(matricula: Matricula) -> bool:
    """Termo de compromisso completo quando modalidade, regime e assinatura estão preenchidos."""
    termo = matricula.termo_compromisso
    if termo is None:
        return False
    return (
        bool((termo.modalidade or "").strip())
        and bool((termo.regime or "").strip())
        and termo.assinatura is True
    )


def status_fichas_matricula(matricula: Matricula) -> dict[str, bool]:
    """Retorna a completude individual de cada uma das 5 fichas obrigatórias (RN03)."""
    from app.services import (
        service_requerimento,
        service_socioeconomica,
        service_termo_imagem,
        service_termo_saida,
    )
    req_completa = (
        matricula.requerimento is not None
        and requerimento_completo(service_requerimento._dados_da_ficha(matricula))
    )
    socio_completa = (
        matricula.ficha_socioeconomica is not None
        and service_socioeconomica._montar_resposta(matricula).completa
    )
    imagem_completa = (
        matricula.termo_imagem is not None
        and termo_imagem_completo(service_termo_imagem._dados_do_termo(matricula.termo_imagem))
    )
    saida_completa = (
        matricula.termo_saida is not None
        and termo_saida_completo(service_termo_saida._dados_do_termo(matricula.termo_saida))
    )
    comp_completa = termo_compromisso_completo(matricula)

    return {
        "requerimento": req_completa,
        "socioeconomica": socio_completa,
        "termo_imagem": imagem_completa,
        "termo_saida": saida_completa,
        "termo_compromisso": comp_completa,
    }


def turma_ativa_compativel(matricula: Matricula) -> bool:
    """RN02 / RN03: aluno possui turma ativa vinculada à mesma etapa da matrícula."""
    turma = matricula.aluno.turma
    if turma is None:
        return False
    return turma.status == StatusTurma.ATIVO and turma.id_etapa == matricula.id_etapa


def calcular_status_matricula(
    matricula: Matricula,
    fichas: dict[str, bool] | None = None,
) -> str:
    """Calcula o status atual do card: INATIVO, ATIVO ou PENDENTE (RN02, RN03, RN10)."""
    if matricula.aluno.status == StatusAluno.INATIVO:
        return "INATIVO"
    completudes = fichas if fichas is not None else status_fichas_matricula(matricula)
    if all(completudes.values()) and turma_ativa_compativel(matricula):
        return "ATIVO"
    return "PENDENTE"


def garantir_editavel(matricula: Matricula) -> None:
    """RN10 / FE03: bloqueia qualquer edição quando o card/matrícula está INATIVO."""
    if matricula.aluno.status == StatusAluno.INATIVO:
        raise MatriculaInativaError()
