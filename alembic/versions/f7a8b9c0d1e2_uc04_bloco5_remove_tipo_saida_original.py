"""uc04 bloco 5: remove a coluna de backup TermoSaida.tipo_saida_original

Revision ID: f7a8b9c0d1e2
Revises: e6f7a8b9c0d1
Create Date: 2026-11-19 16:50:00

Só aplicar depois de conferir os valores sem correspondência em tipo_saida_original.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f7a8b9c0d1e2'
down_revision: Union[str, Sequence[str], None] = 'e6f7a8b9c0d1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_column('TermoSaida', 'tipo_saida_original')


def downgrade() -> None:
    op.add_column('TermoSaida', sa.Column('tipo_saida_original', sa.String(length=100), nullable=True))
    op.execute('UPDATE "TermoSaida" SET tipo_saida_original = CAST(tipo_saida AS text)')
