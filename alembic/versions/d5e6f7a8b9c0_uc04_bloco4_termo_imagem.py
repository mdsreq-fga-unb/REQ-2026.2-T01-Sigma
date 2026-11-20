"""uc04 bloco 4: termo de uso de imagem (responsável, residência, local e data)

Revision ID: d5e6f7a8b9c0
Revises: c4d5e6f7a8b9
Create Date: 2026-11-19 16:30:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd5e6f7a8b9c0'
down_revision: Union[str, Sequence[str], None] = 'c4d5e6f7a8b9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # --- 1. Autorização passa a aceitar "não respondido" ---
    op.alter_column('TermoImagem', 'autorizacao', existing_type=sa.Boolean(), nullable=True)

    # --- 2. Dados do responsável ---
    op.add_column('TermoImagem', sa.Column('resp_nome', sa.String(length=150), nullable=True))
    op.add_column('TermoImagem', sa.Column('resp_nacionalidade', sa.String(length=50), nullable=True))
    op.add_column('TermoImagem', sa.Column('resp_estado_civil', sa.String(length=50), nullable=True))
    op.add_column('TermoImagem', sa.Column('resp_rg', sa.String(length=20), nullable=True))
    op.add_column('TermoImagem', sa.Column('resp_cpf', sa.String(length=11), nullable=True))

    # --- 3. Residência: preenche com o endereço montado do aluno e só depois torna obrigatório ---
    op.add_column('TermoImagem', sa.Column('residente_em', sa.String(length=300), nullable=True))
    op.execute(
        """
        UPDATE "TermoImagem" t SET residente_em = left(concat_ws(', ',
            a.logradouro,
            CASE WHEN a.numero IS NOT NULL AND a.numero <> '' THEN 'nº ' || a.numero END,
            NULLIF(a.bairro, ''),
            a.cidade || CASE WHEN a.uf_residencia IS NOT NULL THEN '/' || a.uf_residencia ELSE '' END,
            CASE WHEN a.cep IS NOT NULL AND a.cep <> '' THEN 'CEP ' || a.cep END
        ), 300)
        FROM "Matricula" m, "Aluno" a
        WHERE m.id = t.id_matricula AND a.id = m.id_aluno
        """
    )
    # Termos sem aluno correspondente (não deveria existir) ficam com texto vazio para não bloquear a restrição
    op.execute('UPDATE "TermoImagem" SET residente_em = \'\' WHERE residente_em IS NULL')
    op.alter_column('TermoImagem', 'residente_em', nullable=False)

    # --- 4. Local e data da assinatura ---
    op.add_column('TermoImagem', sa.Column('local', sa.String(length=100), nullable=True))
    op.add_column('TermoImagem', sa.Column('data', sa.Date(), nullable=True))


def downgrade() -> None:
    op.drop_column('TermoImagem', 'data')
    op.drop_column('TermoImagem', 'local')
    op.drop_column('TermoImagem', 'residente_em')
    op.drop_column('TermoImagem', 'resp_cpf')
    op.drop_column('TermoImagem', 'resp_rg')
    op.drop_column('TermoImagem', 'resp_estado_civil')
    op.drop_column('TermoImagem', 'resp_nacionalidade')
    op.drop_column('TermoImagem', 'resp_nome')

    # Não há como representar "não respondido" no booleano antigo: vazio vira "não autoriza".
    op.execute('UPDATE "TermoImagem" SET autorizacao = false WHERE autorizacao IS NULL')
    op.alter_column('TermoImagem', 'autorizacao', existing_type=sa.Boolean(), nullable=False)
