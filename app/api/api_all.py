from fastapi import APIRouter
from app.routes import route_auth,route_etapas,route_matriculas,route_termos,route_turmas,route_usuario

api_router = APIRouter()
api_router.include_router(route_auth.router)
api_router.include_router(route_usuario.router)
api_router.include_router(route_turmas.router)
api_router.include_router(route_etapas.router)
api_router.include_router(route_matriculas.router)
api_router.include_router(route_termos.router)
