from fastapi import APIRouter
from app.api.v1.endpoints import auth, etapas, turmas

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(etapas.router)
api_router.include_router(turmas.router)
