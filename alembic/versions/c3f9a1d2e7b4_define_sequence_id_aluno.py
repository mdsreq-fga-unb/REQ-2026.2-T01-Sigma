"""define sequence id aluno

Revision ID: c3f9a1d2e7b4
Revises: afa74624024a
Create Date: 2026-11-10 23:20:00

"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = 'c3f9a1d2e7b4'
down_revision: Union[str, Sequence[str], None] = 'afa74624024a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    for tabela in ("Aluno",):
        seq = f"{tabela}_id_seq"
        op.execute(f'CREATE SEQUENCE IF NOT EXISTS "{seq}" OWNED BY "{tabela}".id')
        op.execute(
            f'SELECT setval(\'"{seq}"\', COALESCE((SELECT MAX(id) FROM "{tabela}"), 0) + 1, false)'
        )
        op.execute(
            f'ALTER TABLE "{tabela}" ALTER COLUMN id SET DEFAULT nextval(\'"{seq}"\')'
        )


def downgrade() -> None:
    for tabela in ("Aluno",):
        seq = f"{tabela}_id_seq"
        op.execute(f'ALTER TABLE "{tabela}" ALTER COLUMN id DROP DEFAULT')
        op.execute(f'DROP SEQUENCE IF EXISTS "{seq}"')
