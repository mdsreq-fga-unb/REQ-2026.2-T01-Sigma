"""ajusta tentativa e operacao para autenticacao

Revision ID: 9a1f4b23c8e1
Revises: 4797f77f42a9
Create Date: 2026-11-08 12:35:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '9a1f4b23c8e1'
down_revision: Union[str, Sequence[str], None] = '4797f77f42a9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Permitir que tentativa de login falha sem usuario existente tenha id_user nulo
    op.alter_column('TentativaLogin', 'id_user',
               existing_type=sa.Integer(),
               nullable=True)

    # Permitir que operações de sistema (login, logout) não exijam id_aluno
    op.alter_column('Operacao', 'id_aluno',
               existing_type=sa.Integer(),
               nullable=True)

    # Adicionar novos valores ao enum de tipo de operacao (PostgreSQL)
    bind = op.get_bind()
    if bind.engine.name == 'postgresql':
        op.execute("ALTER TYPE tipo ADD VALUE IF NOT EXISTS 'LOGIN'")
        op.execute("ALTER TYPE tipo ADD VALUE IF NOT EXISTS 'LOGOUT'")


def downgrade() -> None:
    op.alter_column('Operacao', 'id_aluno',
               existing_type=sa.Integer(),
               nullable=False)
    op.alter_column('TentativaLogin', 'id_user',
               existing_type=sa.Integer(),
               nullable=False)
