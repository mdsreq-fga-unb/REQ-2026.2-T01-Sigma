"""uc04 bloco 1: ajusta Aluno e Matricula e cria DocumentacaoCivil

Revision ID: e5a1c7d9b3f2
Revises: 30728bc1476d
Create Date: 2026-11-19 11:00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = 'e5a1c7d9b3f2'
down_revision: Union[str, Sequence[str], None] = '30728bc1476d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

UFS_SQL = (
    "'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', "
    "'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', "
    "'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'"
)


def upgrade() -> None:
    # --- Aluno: renomeia endereco e adiciona os campos de endereço, telefone e naturalidade ---
    op.alter_column('Aluno', 'endereco', new_column_name='logradouro')
    op.add_column('Aluno', sa.Column('numero', sa.String(length=10), nullable=True))
    op.add_column('Aluno', sa.Column('bairro', sa.String(length=100), nullable=True))
    op.add_column('Aluno', sa.Column('naturalidade', sa.String(length=100), nullable=True))
    op.add_column('Aluno', sa.Column('telefone', sa.String(length=11), nullable=True))
    op.add_column('Aluno', sa.Column('uf_residencia', sa.String(length=2), nullable=True))
    op.create_check_constraint(
        'ck_alunos_uf_residencia', 'Aluno',
        f'uf_residencia IN ({UFS_SQL})',
    )

    # --- Matricula: data da matrícula (linhas existentes recebem a data atual) ---
    op.add_column(
        'Matricula',
        sa.Column('data_matricula', sa.Date(), server_default=sa.text('CURRENT_DATE'), nullable=False),
    )

    # --- DocumentacaoCivil: enum e tabela 1:1 com Aluno ---
    sa.Enum('NASCIMENTO', 'CASAMENTO', name='tipo_certidao').create(op.get_bind(), checkfirst=True)

    op.create_table(
        'DocumentacaoCivil',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('id_aluno', sa.Integer(), nullable=False),
        sa.Column('rg', sa.String(length=20), nullable=True),
        sa.Column('orgao_emissor', sa.String(length=100), nullable=True),
        sa.Column('uf_rg', sa.String(length=2), nullable=True),
        sa.Column('data_expedicao', sa.Date(), nullable=True),
        sa.Column(
            'tipo_certidao',
            postgresql.ENUM('NASCIMENTO', 'CASAMENTO', name='tipo_certidao', create_type=False),
            nullable=True,
        ),
        sa.Column('num_termo', sa.String(length=20), nullable=True),
        sa.Column('folha', sa.String(length=10), nullable=True),
        sa.Column('livro', sa.String(length=20), nullable=True),
        sa.Column('data_emissao_certidao', sa.Date(), nullable=True),
        sa.Column('nome_cartorio', sa.String(length=200), nullable=True),
        sa.Column('uf_cartorio', sa.String(length=2), nullable=True),
        sa.Column('documento_estrangeiro', sa.String(length=50), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['id_aluno'], ['Aluno.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('id_aluno'),
        sa.UniqueConstraint('rg', 'uf_rg', name='uq_documentacao_civil_rg_uf'),
        sa.CheckConstraint(f'uf_rg IN ({UFS_SQL})', name='ck_documentacao_civil_uf_rg'),
        sa.CheckConstraint(f'uf_cartorio IN ({UFS_SQL})', name='ck_documentacao_civil_uf_cartorio'),
    )


def downgrade() -> None:
    # Ordem inversa do upgrade
    op.drop_table('DocumentacaoCivil')
    sa.Enum(name='tipo_certidao').drop(op.get_bind(), checkfirst=True)

    op.drop_column('Matricula', 'data_matricula')

    op.drop_constraint('ck_alunos_uf_residencia', 'Aluno', type_='check')
    op.drop_column('Aluno', 'uf_residencia')
    op.drop_column('Aluno', 'telefone')
    op.drop_column('Aluno', 'naturalidade')
    op.drop_column('Aluno', 'bairro')
    op.drop_column('Aluno', 'numero')
    op.alter_column('Aluno', 'logradouro', new_column_name='endereco')
