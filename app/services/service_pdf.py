import re
import unicodedata
from pathlib import Path

from jinja2 import Environment, FileSystemLoader, select_autoescape

PASTA_TEMPLATES = Path(__file__).resolve().parent.parent / "templates"

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


def gerar_pdf(template: str, contexto: dict) -> bytes:
    """Renderiza o template com Jinja2 e converte para PDF com WeasyPrint."""
    # Import tardio: se faltar biblioteca do sistema (Pango), só o PDF falha, não a API toda.
    from weasyprint import HTML

    html = _env.get_template(template).render(**contexto)
    return HTML(string=html, url_fetcher=_bloquear_recurso_externo).write_pdf()
