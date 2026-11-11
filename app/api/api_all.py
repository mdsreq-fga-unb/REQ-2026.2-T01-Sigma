from fastapi import APIRouter
from app.routes import route_auth,route_etapas,route_turmas,route_usuario

api_router = APIRouter()
api_router.include_router(route_auth.router)
api_router.include_router(route_usuario.router)
api_router.include_router(route_turmas.router)
api_router.include_router(route_etapas.router)
