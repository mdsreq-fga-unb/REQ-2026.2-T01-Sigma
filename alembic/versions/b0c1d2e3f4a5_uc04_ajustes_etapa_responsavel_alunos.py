"""uc04 ajustes: etapa na matrícula, campos opcionais do aluno, responsável e histórico estruturado

Revision ID: b0c1d2e3f4a5
Revises: a9b0c1d2e3f4
Create Date: 2026-11-24 22:40:00

Decisões desta parte:
- O parentesco fica no aluno (vínculo com o responsável), e não em Responsavel.
- Telefone do responsável é normalizado para só dígitos; se sobrar mais de 11 dígitos, a migration para.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b0c1d2e3f4a5'
down_revision: Union[str, Sequence[str], None] = 'a9b0c1d2e3f4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _falha_se_existir(tabela: str, condicao: str, mensagem: str) -> str:
    """Bloco DO que interrompe a migration se a condição tiver linhas. Não altera dados."""
    return (
        'DO $$ BEGIN IF EXISTS (SELECT 1 FROM "' + tabela + '" WHERE ' + condicao + ') THEN '
        "RAISE EXCEPTION '" + mensagem + "'; END IF; END $$;"
    )


def upgrade() -> None:
    # --- 1.1 Etapa na matrícula ---
    op.add_column('Matricula', sa.Column('id_etapa', sa.Integer(), nullable=True))
    op.execute(
        """
        UPDATE "Matricula" m SET id_etapa = t.id_etapa
        FROM "Aluno" a JOIN "Turma" t ON t.id = a.turma_id
        WHERE a.id = m.id_aluno
        """
    )
    op.execute(_falha_se_existir(
        'Matricula', 'id_etapa IS NULL',
        'Existem matrículas sem etapa (aluno sem turma). Ajuste antes da migration.',
    ))
    op.alter_column('Matricula', 'id_etapa', nullable=False)
    op.create_foreign_key('Matricula_id_etapa_fkey', 'Matricula', 'Etapa', ['id_etapa'], ['id'])

    # --- 1.2 Campos opcionais do aluno ---
    op.alter_column('Aluno', 'turma_id', existing_type=sa.Integer(), nullable=True)
    op.alter_column('Aluno', 'logradouro', existing_type=sa.String(length=200), nullable=True)
    op.alter_column('Aluno', 'cidade', existing_type=sa.String(length=100), nullable=True)
    op.alter_column('Aluno', 'cep', existing_type=sa.String(length=9), nullable=True)

    # --- 1.3 Parentesco do responsável no aluno ---
    op.add_column('Aluno', sa.Column('parentesco_responsavel', sa.String(length=50), nullable=True))
    op.execute('UPDATE "Aluno" SET parentesco_responsavel = \'Não informado\' WHERE parentesco_responsavel IS NULL')
    op.alter_column('Aluno', 'parentesco_responsavel', existing_type=sa.String(length=50), nullable=False)

    # --- 1.3 Responsável: telefone só com dígitos, e-mail opcional ---
    op.execute(
        r"""UPDATE "Responsavel" SET telefone = NULLIF(regexp_replace(telefone, '\D', '', 'g'), '')
            WHERE telefone IS NOT NULL"""
    )
    op.execute(_falha_se_existir(
        'Responsavel', 'telefone IS NOT NULL AND length(telefone) > 11',
        'Existem telefones de responsável com mais de 11 dígitos. Ajuste antes da migration.',
    ))
    op.alter_column('Responsavel', 'telefone', existing_type=sa.String(length=20), type_=sa.String(length=11), nullable=True)
    op.alter_column('Responsavel', 'email', existing_type=sa.String(length=150), nullable=True)

    # --- 1.3 Pessoa: CPF e data de nascimento opcionais (CPF continua único) ---
    op.alter_column('Pessoa', 'cpf', existing_type=sa.String(length=11), nullable=True)
    op.alter_column('Pessoa', 'data_nasc', existing_type=sa.Date(), nullable=True)

    # --- 1.4 Histórico estruturado ---
    op.add_column(
        'Operacao',
        sa.Column('alteracoes', sa.JSON(), server_default=sa.text("'[]'"), nullable=False),
    )
    op.create_index('ix_operacao_id_aluno_data_op', 'Operacao', ['id_aluno', 'data_op'])


def downgrade() -> None:
    # --- 1.4 ---
    op.drop_index('ix_operacao_id_aluno_data_op', table_name='Operacao')
    op.drop_column('Operacao', 'alteracoes')

    # --- 1.3 Pessoa: só volta a obrigatório se não houver vazios ---
    op.execute(_falha_se_existir('Pessoa', 'cpf IS NULL', 'Existem pessoas sem CPF. Ajuste antes do downgrade.'))
    op.execute(_falha_se_existir('Pessoa', 'data_nasc IS NULL', 'Existem pessoas sem data de nascimento. Ajuste antes do downgrade.'))
    op.alter_column('Pessoa', 'data_nasc', existing_type=sa.Date(), nullable=False)
    op.alter_column('Pessoa', 'cpf', existing_type=sa.String(length=11), nullable=False)

    # --- 1.3 Responsável: vazios viram texto vazio para caber na restrição antiga ---
    op.execute('UPDATE "Responsavel" SET telefone = COALESCE(telefone, \'\'), email = COALESCE(email, \'\')')
    op.alter_column('Responsavel', 'email', existing_type=sa.String(length=150), nullable=False)
    op.alter_column('Responsavel', 'telefone', existing_type=sa.String(length=11), type_=sa.String(length=20), nullable=False)

    # --- 1.3 Parentesco do aluno ---
    op.drop_column('Aluno', 'parentesco_responsavel')

    # --- 1.2 Aluno: só volta a obrigatório se não houver vazios ---
    op.execute(_falha_se_existir('Aluno', 'turma_id IS NULL', 'Existem alunos sem turma. Ajuste antes do downgrade.'))
    op.execute(_falha_se_existir('Aluno', 'logradouro IS NULL', 'Existem alunos sem logradouro. Ajuste antes do downgrade.'))
    op.execute(_falha_se_existir('Aluno', 'cidade IS NULL', 'Existem alunos sem cidade. Ajuste antes do downgrade.'))
    op.execute(_falha_se_existir('Aluno', 'cep IS NULL', 'Existem alunos sem CEP. Ajuste antes do downgrade.'))
    op.alter_column('Aluno', 'cep', existing_type=sa.String(length=9), nullable=False)
    op.alter_column('Aluno', 'cidade', existing_type=sa.String(length=100), nullable=False)
    op.alter_column('Aluno', 'logradouro', existing_type=sa.String(length=200), nullable=False)
    op.alter_column('Aluno', 'turma_id', existing_type=sa.Integer(), nullable=False)

    # --- 1.1 Matrícula ---
    op.drop_constraint('Matricula_id_etapa_fkey', 'Matricula', type_='foreignkey')
    op.drop_column('Matricula', 'id_etapa')
