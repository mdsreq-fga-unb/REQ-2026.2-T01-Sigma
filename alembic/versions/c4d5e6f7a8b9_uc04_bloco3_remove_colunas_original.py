"""uc04 bloco 3: remove colunas de backup (moradia, transporte, valor, renda_mensal)

Revision ID: c4d5e6f7a8b9
Revises: b3c4d5e6f7a8
Create Date: 2026-11-19 16:10:00

Só aplicar depois de conferir os valores sem correspondência nas colunas *_original.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c4d5e6f7a8b9'
down_revision: Union[str, Sequence[str], None] = 'b3c4d5e6f7a8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_column('FichaSocioeconomica', 'moradia_original')
    op.drop_column('FichaSocioeconomica', 'transporte_original')
    op.drop_column('FichaSocioeconomica', 'valor_original')
    op.drop_column('Familiar', 'renda_mensal_original')


def downgrade() -> None:
    op.add_column('FichaSocioeconomica', sa.Column('moradia_original', sa.String(length=500), nullable=True))
    op.add_column('FichaSocioeconomica', sa.Column('transporte_original', sa.String(length=100), nullable=True))
    op.add_column('FichaSocioeconomica', sa.Column('valor_original', sa.String(length=100), nullable=True))
    op.add_column('Familiar', sa.Column('renda_mensal_original', sa.String(length=200), nullable=True))
    # Preenche o backup com o valor atual, para o downgrade da migration b3c4d5e6f7a8 ter o que restaurar.
    op.execute(
        """
        UPDATE "FichaSocioeconomica" SET
            moradia_original = CAST(moradia AS text),
            transporte_original = CAST(transporte AS text),
            valor_original = CAST(valor AS text)
        """
    )
    op.execute('UPDATE "Familiar" SET renda_mensal_original = CAST(renda_mensal AS text)')
