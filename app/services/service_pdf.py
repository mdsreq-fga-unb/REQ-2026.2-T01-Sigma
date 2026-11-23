import base64
import re
import unicodedata
from functools import lru_cache
from pathlib import Path

from jinja2 import Environment, FileSystemLoader, select_autoescape

PASTA_TEMPLATES = Path(__file__).resolve().parent.parent / "templates"
ARQUIVO_LOGO = PASTA_TEMPLATES / "fichas" / "logo.png"  # opcional

# Único ambiente Jinja2 do projeto. autoescape evita HTML injetado por dados da ficha.
_env = Environment(
    loader=FileSystemLoader(str(PASTA_TEMPLATES)),
    autoescape=select_autoescape(["html"]),
)


def slug(texto: str | None) -> str:
    """'João da Silva' -> 'joao-da-silva' (sem acentos, sem espaços, minúsculo)."""
    sem_acento = unicodedata.normalize("NFKD", texto or "").encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", sem_acento.lower()).strip("-") or "aluno"


def _bloquear_recurso_externo(url, *args, **kwargs):
    # O PDF não pode carregar nada de fora (privacidade e segurança).
    raise ValueError("Recurso externo bloqueado no PDF.")


@lru_cache(maxsize=1)
def _logo_data_uri() -> str:
    """Logo embutido no próprio HTML (data URI), se o arquivo existir. Nada é buscado de fora."""
    if not ARQUIVO_LOGO.is_file():
        return ""
    dados = base64.b64encode(ARQUIVO_LOGO.read_bytes()).decode()
    return f"data:image/png;base64,{dados}"


def gerar_pdf(template: str, contexto: dict) -> bytes:
    """Renderiza o template com Jinja2 e converte para PDF com WeasyPrint."""
    # Import tardio: se faltar biblioteca do sistema (Pango), só o PDF falha, não a API toda.
    from weasyprint import HTML, default_url_fetcher

    def fetcher(url, *args, **kwargs):
        # Só aceita imagens embutidas (data:); qualquer URL externa é recusada.
        if url.startswith("data:"):
            return default_url_fetcher(url)
        return _bloquear_recurso_externo(url)

    html = _env.get_template(template).render(logo=_logo_data_uri(), **contexto)
    return HTML(string=html, url_fetcher=fetcher).write_pdf()
