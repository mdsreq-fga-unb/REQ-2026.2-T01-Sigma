from fastapi import APIRouter
from app.routes import route_auth,route_usuario

api_router = APIRouter()
api_router.include_router(route_auth.router)
api_router.include_router(route_usuario.router)
