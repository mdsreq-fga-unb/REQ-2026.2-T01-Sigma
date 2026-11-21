from datetime import date, datetime, timezone
from zoneinfo import ZoneInfo

FUSO_SAO_PAULO = ZoneInfo("America/Sao_Paulo")


def para_sao_paulo(dt: datetime | None) -> datetime | None:
    """Converte um datetime para o fuso de São Paulo, mantendo o mesmo instante.
    Datetimes sem fuso são tratados como UTC, que é como o projeto os grava."""
    if dt is None:
        return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(FUSO_SAO_PAULO)


def agora_utc() -> datetime:
    """Instante atual em UTC, com fuso. É assim que o projeto grava datas e horas."""
    return datetime.now(timezone.utc)


def hoje_sao_paulo() -> date:
    """Data de hoje no fuso de São Paulo (usada para recusar datas futuras em formulários)."""
    return datetime.now(FUSO_SAO_PAULO).date()
