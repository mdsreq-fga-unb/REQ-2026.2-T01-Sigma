"""criar enum

Revision ID: 5d61256c7e7d
Revises: 4797f77f42a9
Create Date: 2026-11-07 23:56:06.419781

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5d61256c7e7d'
down_revision: Union[str, Sequence[str], None] = '8139ec8b4677'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    sa.Enum('FEMININO', 'MASCULINO', 'NAO_DECLARADO', name='sexo').create(op.get_bind(), checkfirst=True)
    sa.Enum('BRANCO', 'PRETO', 'PARDO', 'AMARELO', 'INDIGENA', 'NAO_DECLARADO', name='raca').create(op.get_bind(), checkfirst=True)
    sa.Enum('CONSULTA', 'INATIVACAO', 'MATRICULA', name='tipo').create(op.get_bind(), checkfirst=True)
    sa.Enum('MANHA', 'TARDE', 'NOITE', 'INTEGRAL', name='turno').create(op.get_bind(), checkfirst=True)


def downgrade() -> None:
    """Downgrade schema."""
    pass
