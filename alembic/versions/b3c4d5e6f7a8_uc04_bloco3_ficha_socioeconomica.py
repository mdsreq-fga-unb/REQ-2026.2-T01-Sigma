"""uc04 bloco 3: ficha socioeconômica ligada à matrícula e ajustes de Familiar

Revision ID: b3c4d5e6f7a8
Revises: a8c2d4e6f1b3
Create Date: 2026-11-19 16:00:00

Valores de texto sem correspondência no enum ou no número vão para colunas *_original,
que são removidas na migration c4d5e6f7a8b9 depois de conferidas.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = 'b3c4d5e6f7a8'
down_revision: Union[str, Sequence[str], None] = 'a8c2d4e6f1b3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

SITUACAO_MORADIA = ('PROPRIO', 'CEDIDO', 'FINANCIADO', 'ALUGADO', 'OCUPACAO_IRREGULAR')
MEIO_TRANSPORTE = ('NENHUM_A_PE_BICICLETA', 'CARONA', 'TRANSPORTE_COLETIVO', 'CARRO_MOTO_PROPRIO')

MAPA_MORADIA = """
    CASE lower(trim(moradia_original))
        WHEN 'proprio' THEN 'PROPRIO'
        WHEN 'próprio' THEN 'PROPRIO'
        WHEN 'cedido' THEN 'CEDIDO'
        WHEN 'financiado' THEN 'FINANCIADO'
        WHEN 'alugado' THEN 'ALUGADO'
        WHEN 'ocupacao irregular' THEN 'OCUPACAO_IRREGULAR'
        WHEN 'ocupação irregular' THEN 'OCUPACAO_IRREGULAR'
        WHEN 'ocupacao_irregular' THEN 'OCUPACAO_IRREGULAR'
        ELSE NULL
    END
"""

MAPA_TRANSPORTE = """
    CASE lower(trim(transporte_original))
        WHEN 'nenhum' THEN 'NENHUM_A_PE_BICICLETA'
        WHEN 'a pé' THEN 'NENHUM_A_PE_BICICLETA'
        WHEN 'a pe' THEN 'NENHUM_A_PE_BICICLETA'
        WHEN 'bicicleta' THEN 'NENHUM_A_PE_BICICLETA'
        WHEN 'nenhum_a_pe_bicicleta' THEN 'NENHUM_A_PE_BICICLETA'
        WHEN 'carona' THEN 'CARONA'
        WHEN 'transporte coletivo' THEN 'TRANSPORTE_COLETIVO'
        WHEN 'transporte_coletivo' THEN 'TRANSPORTE_COLETIVO'
        WHEN 'coletivo' THEN 'TRANSPORTE_COLETIVO'
        WHEN 'ônibus' THEN 'TRANSPORTE_COLETIVO'
        WHEN 'onibus' THEN 'TRANSPORTE_COLETIVO'
        WHEN 'carro' THEN 'CARRO_MOTO_PROPRIO'
        WHEN 'moto' THEN 'CARRO_MOTO_PROPRIO'
        WHEN 'carro/moto' THEN 'CARRO_MOTO_PROPRIO'
        WHEN 'carro_moto_proprio' THEN 'CARRO_MOTO_PROPRIO'
        ELSE NULL
    END
"""


def _converte_texto_para_enum(tabela: str, coluna: str, nome_enum: str, valores, mapa_sql: str) -> None:
    op.alter_column(tabela, coluna, new_column_name=f'{coluna}_original')
    op.add_column(
        tabela,
        sa.Column(coluna, postgresql.ENUM(*valores, name=nome_enum, create_type=False), nullable=True),
    )
    op.execute(f'UPDATE "{tabela}" SET {coluna} = CAST({mapa_sql} AS {nome_enum})')


def _converte_texto_para_numero(tabela: str, coluna: str) -> None:
    op.alter_column(tabela, coluna, new_column_name=f'{coluna}_original')
    op.add_column(tabela, sa.Column(coluna, sa.Numeric(10, 2), nullable=True))
    op.execute(
        'UPDATE "' + tabela + '" SET ' + coluna + ' = CAST(replace(trim(' + coluna + '_original), \',\', \'.\') AS NUMERIC(10,2)) '
        'WHERE trim(' + coluna + '_original) ~ \'^[0-9]+([.,][0-9]{1,2})?$\''
    )


def upgrade() -> None:
    bind = op.get_bind()
    sa.Enum(*SITUACAO_MORADIA, name='situacao_moradia').create(bind, checkfirst=True)
    sa.Enum(*MEIO_TRANSPORTE, name='meio_transporte').create(bind, checkfirst=True)

    # --- 1. Ficha passa a ser ligada à matrícula ---
    # Aluno com ficha e sem matrícula ganha uma matrícula do ano da ficha.
    op.execute(
        """
        INSERT INTO "Matricula" (ano, id_aluno, data_matricula)
        SELECT EXTRACT(YEAR FROM f.created_at)::int, f.id_aluno, f.created_at::date
        FROM "FichaSocioeconomica" f
        WHERE NOT EXISTS (SELECT 1 FROM "Matricula" m WHERE m.id_aluno = f.id_aluno)
        """
    )
    op.add_column('FichaSocioeconomica', sa.Column('id_matricula', sa.Integer(), nullable=True))
    op.execute(
        """
        UPDATE "FichaSocioeconomica" f SET id_matricula = (
            SELECT m.id FROM "Matricula" m
            WHERE m.id_aluno = f.id_aluno
            ORDER BY m.ano DESC, m.id DESC
            LIMIT 1
        )
        """
    )
    op.alter_column('FichaSocioeconomica', 'id_matricula', nullable=False)
    op.create_unique_constraint('FichaSocioeconomica_id_matricula_key', 'FichaSocioeconomica', ['id_matricula'])
    op.create_foreign_key(
        'FichaSocioeconomica_id_matricula_fkey', 'FichaSocioeconomica', 'Matricula', ['id_matricula'], ['id'],
    )
    op.drop_column('FichaSocioeconomica', 'id_aluno')

    # --- 2. Conversões de texto para enum ---
    _converte_texto_para_enum('FichaSocioeconomica', 'moradia', 'situacao_moradia', SITUACAO_MORADIA, MAPA_MORADIA)
    _converte_texto_para_enum('FichaSocioeconomica', 'transporte', 'meio_transporte', MEIO_TRANSPORTE, MAPA_TRANSPORTE)

    # --- 3. Conversão de texto para número ---
    _converte_texto_para_numero('FichaSocioeconomica', 'valor')
    _converte_texto_para_numero('Familiar', 'renda_mensal')
    op.create_check_constraint(
        'ck_ficha_valor_nao_negativo', 'FichaSocioeconomica', 'valor IS NULL OR valor >= 0',
    )
    op.create_check_constraint(
        'ck_familiar_renda_nao_negativa', 'Familiar', 'renda_mensal IS NULL OR renda_mensal >= 0',
    )

    # --- 4. Renomeações e colunas novas da ficha ---
    op.alter_column(
        'FichaSocioeconomica', 'o_prop',
        new_column_name='possui_outras_propriedades',
        existing_type=sa.Boolean(), nullable=True,
    )
    op.add_column('FichaSocioeconomica', sa.Column('cedido_por', sa.String(length=150), nullable=True))
    op.add_column('FichaSocioeconomica', sa.Column('propriedades', sa.Text(), nullable=True))
    op.add_column('FichaSocioeconomica', sa.Column('obs_nucleo_familiar', sa.Text(), nullable=True))
    op.add_column('FichaSocioeconomica', sa.Column('telefone_contato', sa.String(length=11), nullable=True))
    op.add_column('FichaSocioeconomica', sa.Column('celular', sa.String(length=11), nullable=True))
    op.add_column('FichaSocioeconomica', sa.Column('email', sa.String(length=150), nullable=True))
    op.add_column('FichaSocioeconomica', sa.Column('declaracao_nome', sa.String(length=150), nullable=True))
    op.add_column('FichaSocioeconomica', sa.Column('declaracao_local', sa.String(length=100), nullable=True))
    op.add_column('FichaSocioeconomica', sa.Column('declaracao_data', sa.Date(), nullable=True))

    # --- 5. Familiar ---
    op.add_column('Familiar', sa.Column('profissao', sa.String(length=100), nullable=True))
    op.alter_column('Familiar', 'ec', new_column_name='estado_civil', existing_type=sa.String(length=100), nullable=True)
    op.alter_column('Familiar', 'escolaridade', existing_type=sa.String(length=100), nullable=True)
    op.create_check_constraint('ck_familiar_idade', 'Familiar', 'idade BETWEEN 0 AND 120')


def downgrade() -> None:
    # --- 5. Familiar ---
    op.drop_constraint('ck_familiar_idade', 'Familiar', type_='check')
    op.alter_column('Familiar', 'estado_civil', new_column_name='ec', existing_type=sa.String(length=100))
    op.drop_column('Familiar', 'profissao')

    # --- 4. Ficha: colunas novas e renomeação ---
    op.alter_column('FichaSocioeconomica', 'possui_outras_propriedades', new_column_name='o_prop', existing_type=sa.Boolean())
    op.drop_column('FichaSocioeconomica', 'declaracao_data')
    op.drop_column('FichaSocioeconomica', 'declaracao_local')
    op.drop_column('FichaSocioeconomica', 'declaracao_nome')
    op.drop_column('FichaSocioeconomica', 'email')
    op.drop_column('FichaSocioeconomica', 'celular')
    op.drop_column('FichaSocioeconomica', 'telefone_contato')
    op.drop_column('FichaSocioeconomica', 'obs_nucleo_familiar')
    op.drop_column('FichaSocioeconomica', 'propriedades')
    op.drop_column('FichaSocioeconomica', 'cedido_por')

    # --- 3. Números voltam a ser texto (restaurados a partir do *_original) ---
    op.drop_constraint('ck_familiar_renda_nao_negativa', 'Familiar', type_='check')
    op.drop_constraint('ck_ficha_valor_nao_negativo', 'FichaSocioeconomica', type_='check')
    op.drop_column('Familiar', 'renda_mensal')
    op.alter_column('Familiar', 'renda_mensal_original', new_column_name='renda_mensal')
    op.drop_column('FichaSocioeconomica', 'valor')
    op.alter_column('FichaSocioeconomica', 'valor_original', new_column_name='valor')

    # --- 2. Enums voltam a ser texto ---
    op.drop_column('FichaSocioeconomica', 'transporte')
    op.alter_column('FichaSocioeconomica', 'transporte_original', new_column_name='transporte')
    op.drop_column('FichaSocioeconomica', 'moradia')
    op.alter_column('FichaSocioeconomica', 'moradia_original', new_column_name='moradia')

    # --- 1. Ficha volta a ser ligada ao aluno ---
    # Obs.: se o aluno tiver mais de uma matrícula com ficha, esta etapa falha na unicidade de id_aluno.
    op.add_column('FichaSocioeconomica', sa.Column('id_aluno', sa.Integer(), nullable=True))
    op.execute(
        """
        UPDATE "FichaSocioeconomica" f SET id_aluno = m.id_aluno
        FROM "Matricula" m WHERE m.id = f.id_matricula
        """
    )
    op.alter_column('FichaSocioeconomica', 'id_aluno', nullable=False)
    op.create_unique_constraint('FichaSocioeconomica_id_aluno_key', 'FichaSocioeconomica', ['id_aluno'])
    op.create_foreign_key(
        'FichaSocioeconomica_id_aluno_fkey', 'FichaSocioeconomica', 'Aluno', ['id_aluno'], ['id'],
    )
    op.drop_column('FichaSocioeconomica', 'id_matricula')

    bind = op.get_bind()
    sa.Enum(name='meio_transporte').drop(bind, checkfirst=True)
    sa.Enum(name='situacao_moradia').drop(bind, checkfirst=True)
