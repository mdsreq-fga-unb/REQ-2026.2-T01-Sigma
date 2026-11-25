"""uc04 bloco 7: termo de compromisso escolar (responsável, enums, data da assinatura e tipos de Operacao)

Revision ID: c1d2e3f4a5b6
Revises: b0c1d2e3f4a5
Create Date: 2026-11-25 17:30:00

modalidade e regime eram texto livre e viram enum. Texto sem correspondência (ex.: regime só
"parcial", sem o turno) faz a migration falhar de propósito, para não perder dados em silêncio.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = 'c1d2e3f4a5b6'
down_revision: Union[str, Sequence[str], None] = 'b0c1d2e3f4a5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

NOVOS_TIPOS = ('PREENCHIMENTO_TERMO_COMPROMISSO', 'EDICAO_TERMO_COMPROMISSO')

# coluna: (tipo enum no banco, {valor do enum: textos antigos aceitos, já em minúsculas})
ENUMS = {
    'modalidade': ('modalidade_ensino', {
        'CRECHE': ('creche',),
        'PRE_ESCOLA': ('pre_escola', 'pre-escola', 'pré-escola', 'pre escola', 'pré escola'),
    }),
    'regime': ('regime_atendimento', {
        'TEMPO_INTEGRAL': ('tempo_integral', 'tempo integral', 'integral'),
        'PARCIAL_MATUTINO': ('parcial_matutino', 'parcial - matutino', 'parcial – matutino', 'matutino'),
        'PARCIAL_VESPERTINO': ('parcial_vespertino', 'parcial - vespertino', 'parcial – vespertino', 'vespertino'),
    }),
}


def _mapa(coluna: str) -> str:
    """CASE que converte o texto antigo no valor do enum (NULL quando não há correspondência)."""
    casos = ' '.join(f"WHEN '{t}' THEN '{v}'" for v, textos in ENUMS[coluna][1].items() for t in textos)
    return f"CASE lower(trim({coluna})) {casos} ELSE NULL END"


def _enum(coluna: str) -> postgresql.ENUM:
    nome, valores = ENUMS[coluna]
    return postgresql.ENUM(*valores, name=nome, create_type=False)


def upgrade() -> None:
    # --- 1. Novos tipos de Operacao (o Alembic não detecta valor novo em enum do PostgreSQL) ---
    for valor in NOVOS_TIPOS:
        op.execute(f"ALTER TYPE tipo ADD VALUE IF NOT EXISTS '{valor}'")

    # --- 2. modalidade e regime: texto vira enum ---
    sem_correspondencia = ' OR '.join(f"(trim({c}) <> '' AND ({_mapa(c)}) IS NULL)" for c in ENUMS)
    op.execute(f"""
        DO $$ BEGIN
            IF EXISTS (SELECT 1 FROM "TermoCompromisso" WHERE {sem_correspondencia}) THEN
                RAISE EXCEPTION 'TermoCompromisso com modalidade ou regime sem correspondência: ajuste antes da migration';
            END IF;
        END $$;
    """)
    for coluna, (nome, valores) in ENUMS.items():
        sa.Enum(*valores, name=nome).create(op.get_bind(), checkfirst=True)
        # Primeiro tira o NOT NULL: texto vazio vira NULL ("não preenchido") na conversão.
        op.alter_column('TermoCompromisso', coluna, existing_type=sa.String(length=100), nullable=True)
        op.alter_column(
            'TermoCompromisso', coluna, existing_type=sa.String(length=100), type_=_enum(coluna),
            postgresql_using=f'CAST({_mapa(coluna)} AS {nome})', existing_nullable=True,
        )

    # --- 3. Responsável que assina e data da assinatura ---
    op.add_column('TermoCompromisso', sa.Column('nome_responsavel', sa.String(length=150), nullable=True))
    op.add_column('TermoCompromisso', sa.Column('cpf_responsavel', sa.String(length=11), nullable=True))
    op.add_column('TermoCompromisso', sa.Column('data_assinatura', sa.Date(), nullable=True))
    op.alter_column('TermoCompromisso', 'assinatura', existing_type=sa.Boolean(), existing_nullable=False,
                    server_default=sa.false())


def downgrade() -> None:
    op.alter_column('TermoCompromisso', 'assinatura', existing_type=sa.Boolean(), existing_nullable=False,
                    server_default=None)
    for coluna in ('data_assinatura', 'cpf_responsavel', 'nome_responsavel'):
        op.drop_column('TermoCompromisso', coluna)

    # As colunas antigas eram texto obrigatório: o que estiver vazio volta como texto vazio.
    for coluna, (nome, _) in ENUMS.items():
        op.alter_column(
            'TermoCompromisso', coluna, existing_type=_enum(coluna), type_=sa.String(length=100),
            postgresql_using=f"coalesce({coluna}::text, '')", nullable=False,
        )
        sa.Enum(name=nome).drop(op.get_bind(), checkfirst=True)

    # PostgreSQL não remove valor de enum. Recria o tipo sem os novos valores.
    # Falha se ainda existir registro de Operacao com algum deles (não apaga auditoria).
    novos = ', '.join(f"'{v}'" for v in NOVOS_TIPOS)
    op.execute(f"""
        DO $$
        DECLARE valores text;
        BEGIN
            IF EXISTS (SELECT 1 FROM "Operacao" WHERE tipo::text IN ({novos})) THEN
                RAISE EXCEPTION 'Existem registros de Operacao com os novos tipos: remova ou ajuste antes do downgrade';
            END IF;
            SELECT string_agg(quote_literal(e.enumlabel), ',' ORDER BY e.enumsortorder) INTO valores
              FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid
             WHERE t.typname = 'tipo' AND e.enumlabel NOT IN ({novos});
            ALTER TYPE tipo RENAME TO tipo_antigo;
            EXECUTE 'CREATE TYPE tipo AS ENUM (' || valores || ')';
            ALTER TABLE "Operacao" ALTER COLUMN tipo TYPE tipo USING tipo::text::tipo;
            DROP TYPE tipo_antigo;
        END $$;
    """)
