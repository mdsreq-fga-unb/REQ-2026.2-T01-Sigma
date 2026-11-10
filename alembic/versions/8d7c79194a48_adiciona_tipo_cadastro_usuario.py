"""adiciona tipo CADASTRO_USUARIO

Revision ID: 8d7c79194a48
Revises: 61ac1fb37e79
Create Date: 2026-11-09 21:54:57.881792

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8d7c79194a48'
down_revision: Union[str, Sequence[str], None] = '61ac1fb37e79'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute("ALTER TYPE tipo ADD VALUE IF NOT EXISTS 'CADASTRO_USUARIO'")
    


def downgrade() -> None:
    """Downgrade schema."""
    pass
