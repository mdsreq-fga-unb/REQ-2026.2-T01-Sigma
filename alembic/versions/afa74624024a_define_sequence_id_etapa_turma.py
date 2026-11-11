"""define sequence id etapa turma

Revision ID: afa74624024a
Revises: 37a42b037dbf
Create Date: 2026-11-10 20:52:48.293763

"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = 'afa74624024a'
down_revision: Union[str, Sequence[str], None] = '37a42b037dbf'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    for tabela in ("Etapa", "Turma"):
        seq = f"{tabela}_id_seq"
        op.execute(f'CREATE SEQUENCE IF NOT EXISTS "{seq}" OWNED BY "{tabela}".id')
        op.execute(
            f'SELECT setval(\'"{seq}"\', COALESCE((SELECT MAX(id) FROM "{tabela}"), 0) + 1, false)'
        )
        op.execute(
            f'ALTER TABLE "{tabela}" ALTER COLUMN id SET DEFAULT nextval(\'"{seq}"\')'
        )


def downgrade() -> None:
    for tabela in ("Etapa", "Turma"):
        seq = f"{tabela}_id_seq"
        op.execute(f'ALTER TABLE "{tabela}" ALTER COLUMN id DROP DEFAULT')
        op.execute(f'DROP SEQUENCE IF EXISTS "{seq}"')
