"""merge cadastro de usuarios e de turmas

Revision ID: cfe8b9eae9f9
Revises: 8d7c79194a48, c4d8e2f1a09b
Create Date: 2026-11-10 20:02:39.610279

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'cfe8b9eae9f9'
down_revision: Union[str, Sequence[str], None] = ('8d7c79194a48', 'c4d8e2f1a09b')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
