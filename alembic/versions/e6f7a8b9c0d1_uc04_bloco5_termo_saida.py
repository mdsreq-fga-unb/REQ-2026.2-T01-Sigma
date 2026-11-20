"""uc04 bloco 5: termo de saída e pessoas autorizadas sem Pessoa

Revision ID: e6f7a8b9c0d1
Revises: d5e6f7a8b9c0
Create Date: 2026-11-19 16:40:00

tipo_saida sem correspondência vai para tipo_saida_original, removida na migration f7a8b9c0d1e2.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = 'e6f7a8b9c0d1'
down_revision: Union[str, Sequence[str], None] = 'd5e6f7a8b9c0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

FORMA_SAIDA = ('RESPONSAVEIS', 'TRANSPORTE_ESCOLAR', 'OUTROS')

MAPA_FORMA_SAIDA = """
    CASE lower(trim(tipo_saida_original))
        WHEN 'responsáveis' THEN 'RESPONSAVEIS'
        WHEN 'responsaveis' THEN 'RESPONSAVEIS'
        WHEN 'responsável' THEN 'RESPONSAVEIS'
        WHEN 'responsavel' THEN 'RESPONSAVEIS'
        WHEN 'transporte escolar' THEN 'TRANSPORTE_ESCOLAR'
        WHEN 'transporte_escolar' THEN 'TRANSPORTE_ESCOLAR'
        WHEN 'outros' THEN 'OUTROS'
        ELSE NULL
    END
"""


def upgrade() -> None:
    sa.Enum(*FORMA_SAIDA, name='forma_saida').create(op.get_bind(), checkfirst=True)

    # --- 1. TermoSaida: forma de saída vira enum (backup do texto original) ---
    op.alter_column('TermoSaida', 'tipo_saida', new_column_name='tipo_saida_original')
    op.add_column(
        'TermoSaida',
        sa.Column('tipo_saida', postgresql.ENUM(*FORMA_SAIDA, name='forma_saida', create_type=False), nullable=True),
    )
    op.execute('UPDATE "TermoSaida" SET tipo_saida = CAST(' + MAPA_FORMA_SAIDA + ' AS forma_saida)')

    # --- 2. TermoSaida: data_saida (data e hora) vira data da assinatura (sem hora) ---
    op.alter_column(
        'TermoSaida', 'data_saida',
        new_column_name='data',
        type_=sa.Date(),
        existing_type=sa.DateTime(),
        postgresql_using='data_saida::date',
        nullable=True,
    )
    op.add_column('TermoSaida', sa.Column('descricao_outros', sa.String(length=300), nullable=True))
    op.add_column('TermoSaida', sa.Column('resp_nome', sa.String(length=150), nullable=True))
    op.add_column('TermoSaida', sa.Column('periodo', sa.String(length=50), nullable=True))

    # --- 3. PessoaAutorizada: nome vem de Pessoa quando estiver vazio ---
    op.execute(
        """
        UPDATE "PessoaAutorizada" pa SET nome = p.nome
        FROM "Pessoa" p
        WHERE p.id = pa.id_pessoa AND (pa.nome IS NULL OR trim(pa.nome) = '')
        """
    )

    # --- 4. PessoaAutorizada: sem Pessoa, parentesco com 50 caracteres, FK para o termo renomeada ---
    # Falha de propósito se algum parentesco for maior que 50, para não truncar dados em silêncio.
    op.execute(
        """
        DO $$
        BEGIN
            IF EXISTS (SELECT 1 FROM "PessoaAutorizada" WHERE length(parentesco) > 50) THEN
                RAISE EXCEPTION 'PessoaAutorizada.parentesco com mais de 50 caracteres: ajuste antes da migration';
            END IF;
        END $$;
        """
    )
    op.drop_column('PessoaAutorizada', 'id_pessoa')
    op.alter_column(
        'PessoaAutorizada', 'parentesco',
        existing_type=sa.String(length=100), type_=sa.String(length=50),
    )
    op.alter_column('PessoaAutorizada', 'id_tasa', new_column_name='id_termo_saida')


def downgrade() -> None:
    # --- 4. PessoaAutorizada ---
    op.alter_column('PessoaAutorizada', 'id_termo_saida', new_column_name='id_tasa')
    op.alter_column(
        'PessoaAutorizada', 'parentesco',
        existing_type=sa.String(length=50), type_=sa.String(length=100),
    )
    # Não há como recuperar a Pessoa de cada registro: a coluna volta opcional.
    op.add_column('PessoaAutorizada', sa.Column('id_pessoa', sa.Integer(), nullable=True))
    op.create_foreign_key('PessoaAutorizada_id_pessoa_fkey', 'PessoaAutorizada', 'Pessoa', ['id_pessoa'], ['id'])

    # --- 1 a 2. TermoSaida ---
    op.drop_column('TermoSaida', 'periodo')
    op.drop_column('TermoSaida', 'resp_nome')
    op.drop_column('TermoSaida', 'descricao_outros')
    op.alter_column(
        'TermoSaida', 'data',
        new_column_name='data_saida',
        type_=sa.DateTime(),
        existing_type=sa.Date(),
        postgresql_using='data::timestamp',
        nullable=True,
    )
    op.drop_column('TermoSaida', 'tipo_saida')
    op.alter_column('TermoSaida', 'tipo_saida_original', new_column_name='tipo_saida')

    sa.Enum(name='forma_saida').drop(op.get_bind(), checkfirst=True)
