"""uc04 bloco 2: remove colunas de backup da Saude (tipo_original e acomp_original)

Revision ID: a8c2d4e6f1b3
Revises: f1b2c3d4e5a6
Create Date: 2026-11-19 12:30:00

Só deve ser aplicada com o banco sem dados nessas colunas, ou após conferir o backup.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a8c2d4e6f1b3'
down_revision: Union[str, Sequence[str], None] = 'f1b2c3d4e5a6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_column('Saude', 'tipo_original')
    op.drop_column('Saude', 'acomp_original')


def downgrade() -> None:
    op.add_column('Saude', sa.Column('acomp_original', sa.String(length=200), nullable=True))
    op.add_column('Saude', sa.Column('tipo_original', sa.String(length=100), nullable=True))
