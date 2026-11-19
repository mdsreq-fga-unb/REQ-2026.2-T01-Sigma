"""uc04 bloco 6: novos tipos de Operacao para as fichas de matrícula e exportação em PDF

Revision ID: a9b0c1d2e3f4
Revises: f7a8b9c0d1e2
Create Date: 2026-11-19 17:00:00

O Alembic não detecta valores novos em enum do PostgreSQL, por isso o comando é escrito à mão.
"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = 'a9b0c1d2e3f4'
down_revision: Union[str, Sequence[str], None] = 'f7a8b9c0d1e2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

NOVOS_TIPOS = (
    'PREENCHIMENTO_REQUERIMENTO',
    'EDICAO_REQUERIMENTO',
    'PREENCHIMENTO_SOCIOECONOMICA',
    'EDICAO_SOCIOECONOMICA',
    'PREENCHIMENTO_TERMO_IMAGEM',
    'EDICAO_TERMO_IMAGEM',
    'PREENCHIMENTO_TERMO_SAIDA',
    'EDICAO_TERMO_SAIDA',
    'EXPORTACAO_PDF',
)


def upgrade() -> None:
    for valor in NOVOS_TIPOS:
        op.execute(f"ALTER TYPE tipo ADD VALUE IF NOT EXISTS '{valor}'")


def downgrade() -> None:
    # PostgreSQL não remove valor de enum. Recria o tipo sem os novos valores.
    # Falha se ainda existir registro de Operacao com algum deles (não apaga auditoria).
    lista_novos = ', '.join(f"'{v}'" for v in NOVOS_TIPOS)
    op.execute(
        """
        DO $$
        DECLARE
            valores text;
        BEGIN
            IF EXISTS (SELECT 1 FROM "Operacao" WHERE tipo::text IN (""" + lista_novos + """)) THEN
                RAISE EXCEPTION 'Existem registros de Operacao com os novos tipos: remova ou ajuste antes do downgrade';
            END IF;

            SELECT string_agg(quote_literal(e.enumlabel), ',' ORDER BY e.enumsortorder)
              INTO valores
              FROM pg_enum e
              JOIN pg_type t ON t.oid = e.enumtypid
             WHERE t.typname = 'tipo' AND e.enumlabel NOT IN (""" + lista_novos + """);

            ALTER TYPE tipo RENAME TO tipo_antigo;
            EXECUTE 'CREATE TYPE tipo AS ENUM (' || valores || ')';
            ALTER TABLE "Operacao" ALTER COLUMN tipo TYPE tipo USING tipo::text::tipo;
            DROP TYPE tipo_antigo;
        END $$;
        """
    )
