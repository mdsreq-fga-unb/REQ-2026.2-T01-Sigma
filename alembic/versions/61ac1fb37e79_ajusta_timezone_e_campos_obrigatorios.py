"""ajusta timezone e campos obrigatorios

Revision ID: 61ac1fb37e79
Revises: 9a1f4b23c8e1
Create Date: 2026-11-09 17:31:11.877466

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '61ac1fb37e79'
down_revision: Union[str, Sequence[str], None] = '9a1f4b23c8e1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column('TentativaLogin', 'data_hora',
               existing_type=sa.DateTime(),
               type_=sa.DateTime(timezone=True),
               existing_nullable=False,
               postgresql_using="data_hora AT TIME ZONE 'UTC'")
    op.alter_column('Usuario', 'bloqueado_ate',
               existing_type=sa.DateTime(),
               type_=sa.DateTime(timezone=True),
               existing_nullable=True,
               postgresql_using="bloqueado_ate AT TIME ZONE 'UTC'")
    op.alter_column('Aluno', 'data_nasc',
               existing_type=sa.Date(),
               existing_nullable=True,
               nullable=False)
    op.alter_column('Aluno', 'cidade',
               existing_type=sa.String(length=100),
               existing_nullable=True,
               nullable=False)
    op.alter_column('Aluno', 'cep',
               existing_type=sa.String(length=9),
               existing_nullable=True,
               nullable=False)


def downgrade() -> None:
    op.alter_column('Aluno', 'cep',
               existing_type=sa.String(length=9),
               existing_nullable=False,
               nullable=True)
    op.alter_column('Aluno', 'cidade',
               existing_type=sa.String(length=100),
               existing_nullable=False,
               nullable=True)
    op.alter_column('Aluno', 'data_nasc',
               existing_type=sa.Date(),
               existing_nullable=False,
               nullable=True)
    op.alter_column('Usuario', 'bloqueado_ate',
               existing_type=sa.DateTime(timezone=True),
               type_=sa.DateTime(),
               existing_nullable=True,
               postgresql_using="bloqueado_ate AT TIME ZONE 'UTC'")
    op.alter_column('TentativaLogin', 'data_hora',
               existing_type=sa.DateTime(timezone=True),
               type_=sa.DateTime(),
               existing_nullable=False,
               postgresql_using="data_hora AT TIME ZONE 'UTC'")
