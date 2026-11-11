"""adiciona tipos de auditoria para alteração de status de usuário

Revision ID: dc5e0d39a1b2
Revises: cfe8b9eae9f9
Create Date: 2026-11-11 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op


revision: str = "dc5e0d39a1b2"
down_revision: Union[str, Sequence[str], None] = "c3f9a1d2e7b4"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    if bind.engine.name == "postgresql":
        op.execute("ALTER TYPE tipo ADD VALUE IF NOT EXISTS 'INATIVACAO_USUARIO'")
        op.execute("ALTER TYPE tipo ADD VALUE IF NOT EXISTS 'REATIVACAO_USUARIO'")


def downgrade() -> None:
    pass
