"""Rotas das fichas e termos da matrícula (UC04 - Gerenciar Fichas de Matrícula).

Uma rota por termo/ficha. As rotas só recebem a requisição, chamam o service e devolvem a
resposta: nenhuma regra de negócio fica aqui. Os erros de negócio (404, 422, 503, 500) são
lançados pelos services e convertidos em resposta HTTP por `tratar_erro_negocio` (app/main.py).

Qualquer usuário autenticado e ativo da equipe administrativa pode usar as rotas
(`get_current_user` recusa token ausente/inválido com 401 e conta inativa com 403).
O corpo das requisições tem dados pessoais e nunca é registrado em log.
"""
from typing import Annotated

from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import Usuario
from app.schemas.termo_imagem import TermoImagemResponse, TermoImagemUpdate
from app.schemas.termo_saida import TermoSaidaResponse, TermoSaidaUpdate
from app.services import service_termo_imagem, service_termo_saida

router = APIRouter(prefix="/matriculas", tags=["Matrículas"])

SessaoBanco = Annotated[Session, Depends(get_db)]
UsuarioAtual = Annotated[Usuario, Depends(get_current_user)]

_RESPOSTAS_AUTENTICACAO = {
    401: {"description": "Token ausente, inválido ou expirado."},
    403: {"description": "Conta inativa."},
}
_RESPOSTA_PDF = {
    200: {
        "description": "PDF para impressão e assinatura (download).",
        "content": {"application/pdf": {"schema": {"type": "string", "format": "binary"}}},
    },
    **_RESPOSTAS_AUTENTICACAO,
    404: {"description": "Matrícula não encontrada."},
    500: {"description": "Falha na geração do PDF."},
}


def _resposta_pdf(conteudo: bytes, nome_arquivo: str, resposta_base: Response) -> Response:
    """PDF para download, sem cache (o documento tem dados sensíveis)."""
    resposta = Response(
        content=conteudo,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{nome_arquivo}"',
            "Cache-Control": "no-store",
        },
    )
    # Quando a rota devolve a própria Response, o FastAPI não copia os cabeçalhos definidos pela
    # dependência get_current_user. Sem esta cópia o PDF não renovaria o token (X-Renewed-Token, RN17).
    for nome, valor in resposta_base.headers.items():
        if nome.lower() not in {"content-length", "content-type"}:
            resposta.headers[nome] = valor
    return resposta


# Termo de autorização de uso de imagem

@router.get(
    "/{id_matricula}/termo-imagem",
    response_model=TermoImagemResponse,
    status_code=status.HTTP_200_OK,
    summary="Obter o Termo de autorização de uso de imagem da matrícula",
    responses={
        200: {"description": "Termo da matrícula. Sem termo salvo: seções vazias e `completa` falso."},
        **_RESPOSTAS_AUTENTICACAO,
        404: {"description": "Matrícula não encontrada."},
        503: {"description": "Falha de conexão com o banco de dados."},
    },
)
def obter_termo_imagem(id_matricula: int, db: SessaoBanco, _usuario: UsuarioAtual):
    return service_termo_imagem.obter_termo(db, id_matricula)


@router.put(
    "/{id_matricula}/termo-imagem",
    response_model=TermoImagemResponse,
    status_code=status.HTTP_200_OK,
    summary="Salvar o Termo de autorização de uso de imagem (cria ou atualiza)",
    responses={
        200: {"description": "Termo salvo."},
        **_RESPOSTAS_AUTENTICACAO,
        404: {"description": "Matrícula não encontrada."},
        422: {"description": "Campos obrigatórios vazios (todos listados) ou dados inválidos."},
        503: {"description": "Falha de conexão com o banco de dados. Nada foi salvo."},
    },
)
def salvar_termo_imagem(id_matricula: int, dados: TermoImagemUpdate, db: SessaoBanco, usuario: UsuarioAtual):
    return service_termo_imagem.salvar_termo(db, id_matricula, dados, usuario)


@router.get(
    "/{id_matricula}/termo-imagem/pdf",
    response_class=Response,
    summary="Exportar o Termo de uso de imagem em PDF",
    responses=_RESPOSTA_PDF,
)
def exportar_termo_imagem_pdf(id_matricula: int, response: Response, db: SessaoBanco, usuario: UsuarioAtual):
    # Função síncrona de propósito: o WeasyPrint usa CPU e bloqueia, então o FastAPI a executa
    # no pool de threads sem travar o servidor.
    conteudo, nome_arquivo = service_termo_imagem.exportar_pdf(db, id_matricula, usuario)
    return _resposta_pdf(conteudo, nome_arquivo, response)


# Termo de autorização de saída do aluno

@router.get(
    "/{id_matricula}/termo-saida",
    response_model=TermoSaidaResponse,
    status_code=status.HTTP_200_OK,
    summary="Obter o Termo de autorização de saída da matrícula",
    responses={
        200: {"description": "Termo da matrícula. Sem termo salvo: seções vazias, local fixo e `completa` falso."},
        **_RESPOSTAS_AUTENTICACAO,
        404: {"description": "Matrícula não encontrada."},
        503: {"description": "Falha de conexão com o banco de dados."},
    },
)
def obter_termo_saida(id_matricula: int, db: SessaoBanco, _usuario: UsuarioAtual):
    return service_termo_saida.obter_termo(db, id_matricula)


@router.put(
    "/{id_matricula}/termo-saida",
    response_model=TermoSaidaResponse,
    status_code=status.HTTP_200_OK,
    summary="Salvar o Termo de autorização de saída com as pessoas autorizadas (cria ou atualiza)",
    responses={
        200: {"description": "Termo e pessoas autorizadas salvos."},
        **_RESPOSTAS_AUTENTICACAO,
        404: {"description": "Matrícula não encontrada."},
        422: {
            "description": "Campos obrigatórios vazios (todos listados), regra condicional, mais de 4 "
            "pessoas ou `id` de pessoa que não pertence ao termo."
        },
        503: {"description": "Falha de conexão com o banco de dados. Nada foi salvo."},
    },
)
def salvar_termo_saida(id_matricula: int, dados: TermoSaidaUpdate, db: SessaoBanco, usuario: UsuarioAtual):
    return service_termo_saida.salvar_termo(db, id_matricula, dados, usuario)


@router.get(
    "/{id_matricula}/termo-saida/pdf",
    response_class=Response,
    summary="Exportar o Termo de autorização de saída em PDF",
    responses=_RESPOSTA_PDF,
)
def exportar_termo_saida_pdf(id_matricula: int, response: Response, db: SessaoBanco, usuario: UsuarioAtual):
    conteudo, nome_arquivo = service_termo_saida.exportar_pdf(db, id_matricula, usuario)
    return _resposta_pdf(conteudo, nome_arquivo, response)
