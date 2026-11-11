from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.api_all import api_router
from app.core.config import settings

app = FastAPI(
    title=settings.app_name,
    description="API do Sistema Integrado de Gestão Escolar (SIGMA) - Creche Estação Vida",
    version="1.0.0",
)

# Configuração de CORS para permitir consumo pelo frontend React
ORIGENS_PERMITIDAS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ORIGENS_PERMITIDAS,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=[settings.renewed_token_header_name],
)

app.include_router(api_router)


@app.get("/")
def root():
    return {"mensagem": "API funcionando"}
