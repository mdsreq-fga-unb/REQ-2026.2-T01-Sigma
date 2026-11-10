"""ajusta turma e operacao para uc06

Revision ID: c4d8e2f1a09b
Revises: 9a1f4b23c8e1
Create Date: 2026-11-08 15:55:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c4d8e2f1a09b'
down_revision: Union[str, Sequence[str], None] = '9a1f4b23c8e1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Remover coluna sala de Turma (desnecessária no MVP)
    op.drop_column('Turma', 'sala')

    # 2. Tornar coluna turno opcional (nullable=True) em Turma
    op.alter_column('Turma', 'turno',
               existing_type=sa.Enum('MANHA', 'TARDE', 'NOITE', 'INTEGRAL', name='turno'),
               nullable=True)

    # 3. Adicionar novos tipos de operacao ao enum tipo no PostgreSQL
    bind = op.get_bind()
    if bind.engine.name == 'postgresql':
        op.execute("ALTER TYPE tipo ADD VALUE IF NOT EXISTS 'CADASTRO_ETAPA'")
        op.execute("ALTER TYPE tipo ADD VALUE IF NOT EXISTS 'CADASTRO_TURMA'")
        op.execute("ALTER TYPE tipo ADD VALUE IF NOT EXISTS 'INATIVACAO_TURMA'")


def downgrade() -> None:
    op.add_column('Turma', sa.Column('sala', sa.Integer(), nullable=True))
    op.alter_column('Turma', 'turno',
               existing_type=sa.Enum('MANHA', 'TARDE', 'NOITE', 'INTEGRAL', name='turno'),
               nullable=False)
