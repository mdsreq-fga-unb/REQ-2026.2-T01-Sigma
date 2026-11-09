from fastapi import APIRouter, Depends, HTTPException,status, Response
from sqlalchemy.orm import Session
from typing import Annotated
from sqlalchemy.exc import SQLAlchemyError
from app.core.database import get_db
from app.core.exceptions import EmailJaCadastradoError
from app.schemas.schema_usuario import *

router = APIRouter(
    prefix="/user",
    tags=["usuario"]
)


@router.post(
        "",
    response_model=UsuarioResponse,
    status_code=status.HTTP_200_OK,
    summary= "Realiza o cadastro de um usuario comum",
    responses={
            200: {"description": "Cadastro realizado com sucesso"},
            401: {"description": "Credenciais inválidas."},
            403: {"description": "Conta inativa."},
        }
    )
def cadastro_usuario():
    pass




