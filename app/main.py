from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.api_all import api_router
from app.core.config import settings
from app.core.exceptions import ErroNegocio, tratar_erro_negocio

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
    # Content-Disposition: o frontend lê o nome do arquivo dos PDFs exportados (UC04).
    expose_headers=[settings.renewed_token_header_name, "Content-Disposition"],
)

# Erros de regra de negócio lançados pelos services (404, 422, 503...) viram resposta HTTP aqui.
app.add_exception_handler(ErroNegocio, tratar_erro_negocio)

app.include_router(api_router)


@app.get("/")
def root():
    return {"mensagem": "API funcionando"}
