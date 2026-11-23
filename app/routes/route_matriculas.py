from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import Usuario
from app.schemas.schema_ficha_socioeconomica import (
    FichaSocioeconomicaEntrada,
    FichaSocioeconomicaResposta,
)
from app.services import service_pdf
from app.services import service_socioeconomica as service
from app.services.service_socioeconomica import (
    MatriculaNaoEncontradaError,
    MembroInvalidoError,
)

router = APIRouter(
    prefix="/matriculas",
    tags=["matriculas"],
)

# LGPD: estas rotas não registram o corpo da requisição nem os erros do banco em log.
ERRO_BANCO = "Não foi possível salvar. Tente novamente."


@router.get(
    "/{id_matricula}/socioeconomica",
    response_model=FichaSocioeconomicaResposta,
    status_code=status.HTTP_200_OK,
    summary="Obtém a ficha socioeconômica da matrícula",
    responses={
        200: {"description": "Ficha (vazia, se ainda não foi preenchida)"},
        401: {"description": "Token ausente ou inválido"},
        404: {"description": "Matrícula não encontrada"},
    },
)
def obter_socioeconomica(
    id_matricula: int,
    db: Annotated[Session, Depends(get_db)],
    usuario: Annotated[Usuario, Depends(get_current_user)],
):
    try:
        return service.obter_ficha(db, id_matricula)
    except MatriculaNaoEncontradaError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.mensagem)


@router.put(
    "/{id_matricula}/socioeconomica",
    response_model=FichaSocioeconomicaResposta,
    status_code=status.HTTP_200_OK,
    summary="Salva a ficha socioeconômica da matrícula",
    responses={
        200: {"description": "Ficha salva"},
        401: {"description": "Token ausente ou inválido"},
        404: {"description": "Matrícula não encontrada"},
        422: {"description": "Dados inválidos ou campos obrigatórios faltando"},
        503: {"description": "Falha de conexão com o banco de dados"},
    },
)
def salvar_socioeconomica(
    id_matricula: int,
    dados: FichaSocioeconomicaEntrada,
    db: Annotated[Session, Depends(get_db)],
    usuario: Annotated[Usuario, Depends(get_current_user)],
):
    try:
        return service.salvar_ficha(db, id_matricula, dados, usuario)
    except MatriculaNaoEncontradaError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.mensagem)
    except MembroInvalidoError as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=e.mensagem)
    except SQLAlchemyError:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=ERRO_BANCO)


# Função síncrona (não async): o WeasyPrint é bloqueante e roda no pool de threads do FastAPI.
@router.get(
    "/{id_matricula}/socioeconomica/pdf",
    response_class=Response,
    status_code=status.HTTP_200_OK,
    summary="Exporta a ficha socioeconômica em PDF (WeasyPrint)",
    responses={
        200: {"description": "Arquivo PDF", "content": {"application/pdf": {}}},
        401: {"description": "Token ausente ou inválido"},
        404: {"description": "Matrícula não encontrada"},
        500: {"description": "Falha na geração do PDF"},
        503: {"description": "Falha de conexão com o banco de dados"},
    },
)
def exportar_socioeconomica_pdf(
    id_matricula: int,
    response: Response,
    db: Annotated[Session, Depends(get_db)],
    usuario: Annotated[Usuario, Depends(get_current_user)],
):
    try:
        contexto = service.contexto_pdf(db, id_matricula)
    except MatriculaNaoEncontradaError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.mensagem)
    except SQLAlchemyError:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=ERRO_BANCO)

    try:
        pdf = service_pdf.gerar_pdf("fichas/socioeconomica.html", contexto)
    except Exception:
        # Sem detalhes na resposta nem em log: o erro pode conter dados da ficha.
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Não foi possível gerar o PDF.",
        )

    try:
        service.registrar_exportacao_pdf(db, id_matricula, usuario)
    except SQLAlchemyError:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=ERRO_BANCO)

    aluno = contexto["aluno"]
    nome_arquivo = f"socioeconomica-{service_pdf.slug(aluno['nome'])}-{aluno['ano_letivo']}.pdf"
    resposta = Response(
        content=pdf,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{nome_arquivo}"',
            "Cache-Control": "no-store",
        },
    )
    # Ao devolver um Response pronto, o FastAPI não copia os cabeçalhos que o
    # get_current_user colocou (renovação do token, RN17). Copiamos aqui.
    for nome in (settings.renewed_token_header_name, "Access-Control-Expose-Headers"):
        if nome in response.headers:
            resposta.headers[nome] = response.headers[nome]
    return resposta
