"""define default now() em Operacao.data_op

Revision ID: 37a42b037dbf
Revises: cfe8b9eae9f9

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '37a42b037dbf'
down_revision: Union[str, Sequence[str], None] = 'cfe8b9eae9f9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column(
        'Operacao', 'data_op',
        existing_type=sa.DateTime(timezone=True),
        existing_nullable=False,
        server_default=sa.text('now()'),
    )


def downgrade() -> None:
    op.alter_column(
        'Operacao', 'data_op',
        existing_type=sa.DateTime(timezone=True),
        existing_nullable=False,
        server_default=None,
    )
