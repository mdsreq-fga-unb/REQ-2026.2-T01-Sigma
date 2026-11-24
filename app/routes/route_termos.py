"""Rotas de conteúdo dos termos (UC04).

O texto integral do termo de uso de imagem fica em um único arquivo (`app/templates/termos`),
usado por esta rota e pelo PDF: a tela e o documento impresso mostram sempre o mesmo texto.
"""
from typing import Annotated

from fastapi import APIRouter, Depends, status

from app.core.deps import get_current_user
from app.models.user import Usuario
from app.schemas.termo_imagem import TextoTermoResponse
from app.services import service_termo_imagem

router = APIRouter(prefix="/termos", tags=["Termos"])


@router.get(
    "/uso-imagem/texto",
    response_model=TextoTermoResponse,
    status_code=status.HTTP_200_OK,
    summary='Texto integral do Termo de uso de imagem (link "Ver texto completo do termo")',
    responses={
        200: {"description": "Texto integral, o mesmo que sai no PDF."},
        401: {"description": "Token ausente, inválido ou expirado."},
        403: {"description": "Conta inativa."},
    },
)
def obter_texto_uso_imagem(_usuario: Annotated[Usuario, Depends(get_current_user)]):
    return service_termo_imagem.obter_texto_termo()
