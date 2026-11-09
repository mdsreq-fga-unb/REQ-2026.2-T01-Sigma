from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import api_router
from app.core.config import settings

app = FastAPI(
    title=settings.app_name,
    description="API do Sistema Integrado de Gestão Escolar (SIGMA) - Creche Estação Vida",
    version="1.0.0",
)

# Configuração de CORS para permitir consumo pelo frontend React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=[settings.renewed_token_header_name],
)

app.include_router(api_router)


@app.get("/")
def root():
    return {"mensagem": "API funcionando"}
