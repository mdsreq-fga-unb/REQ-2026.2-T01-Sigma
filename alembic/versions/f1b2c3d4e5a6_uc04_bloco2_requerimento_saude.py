"""uc04 bloco 2: civil move para DocumentacaoCivil, ajusta RequerimentoMatricula e Saude

Revision ID: f1b2c3d4e5a6
Revises: e5a1c7d9b3f2
Create Date: 2026-11-19 12:00:00

Regra de migração dos dados civis: para cada aluno, vale o requerimento da
matrícula mais recente (maior `ano`; em caso de empate, maior `id` do requerimento).
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f1b2c3d4e5a6'
down_revision: Union[str, Sequence[str], None] = 'e5a1c7d9b3f2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

CAMPOS_CIVIS_ANTIGOS = (
    "rg", "oe", "uf", "data_exp", "certidao", "num_termo", "folha",
    "livro", "data_emiss", "nome_cart", "uf_cart",
)

CAMPOS_OPCIONAIS = (
    "nome_pai", "nome_mae", "esc_pai", "esc_mae", "loc_pai", "loc_mae",
    "data_ped_transf", "data_ent_transf",
)


def upgrade() -> None:
    # --- 1. Copia os dados civis do requerimento mais recente para DocumentacaoCivil ---
    op.execute(
        """
        INSERT INTO "DocumentacaoCivil"
            (id_aluno, rg, orgao_emissor, uf_rg, data_expedicao, tipo_certidao,
             num_termo, folha, livro, data_emissao_certidao, nome_cartorio, uf_cartorio)
        SELECT DISTINCT ON (m.id_aluno)
            m.id_aluno,
            r.rg,
            r.oe,
            r.uf,
            r.data_exp,
            CAST(CASE WHEN r.certidao THEN 'NASCIMENTO' ELSE 'CASAMENTO' END AS tipo_certidao),
            CAST(r.num_termo AS VARCHAR(20)),
            CAST(r.folha AS VARCHAR(10)),
            r.livro,
            r.data_emiss,
            r.nome_cart,
            r.uf_cart
        FROM "RequerimentoMatricula" r
        JOIN "Matricula" m ON m.id = r.id_matricula
        ORDER BY m.id_aluno, m.ano DESC, r.id DESC
        """
    )

    # --- 2. RequerimentoMatricula: campos opcionais e telefones só com dígitos ---
    for campo in CAMPOS_OPCIONAIS:
        op.alter_column('RequerimentoMatricula', campo, nullable=True)

    for campo in ("tel_pai", "tel_mae"):
        op.alter_column(
            'RequerimentoMatricula', campo,
            existing_type=sa.String(length=100),
            type_=sa.String(length=11),
            nullable=True,
            postgresql_using=rf"left(regexp_replace({campo}, '\D', '', 'g'), 11)",
        )

    # --- 3. RequerimentoMatricula: novos campos ---
    op.add_column('RequerimentoMatricula', sa.Column('telefone_requerimento', sa.String(length=11), nullable=True))
    op.add_column('RequerimentoMatricula', sa.Column('nome_resp_compromisso', sa.String(length=150), nullable=True))
    op.add_column('RequerimentoMatricula', sa.Column('nome_resp_transferencia', sa.String(length=150), nullable=True))
    op.add_column(
        'RequerimentoMatricula',
        sa.Column('documentos_entregues', sa.JSON(), server_default=sa.text("'[]'"), nullable=False),
    )

    # --- 4. RequerimentoMatricula: remove os campos civis (já copiados acima) ---
    for campo in CAMPOS_CIVIS_ANTIGOS:
        op.drop_column('RequerimentoMatricula', campo)

    # --- 5. Saude: tipo e acomp viram listas (JSON) ---
    # Os textos originais ficam em *_original para conferência. Remover depois de validar.
    op.alter_column('Saude', 'tipo', new_column_name='tipo_original')
    op.alter_column('Saude', 'acomp', new_column_name='acomp_original')
    op.add_column('Saude', sa.Column('tipo', sa.JSON(), nullable=True))
    op.add_column('Saude', sa.Column('acomp', sa.JSON(), nullable=True))
    op.execute(
        """
        UPDATE "Saude" SET
            tipo  = (SELECT json_agg(upper(trim(v))) FROM unnest(string_to_array(tipo_original, ',')) AS v),
            acomp = (SELECT json_agg(upper(trim(v))) FROM unnest(string_to_array(acomp_original, ',')) AS v)
        """
    )


def downgrade() -> None:
    # --- 5. Saude: volta ao texto original ---
    op.drop_column('Saude', 'acomp')
    op.drop_column('Saude', 'tipo')
    op.alter_column('Saude', 'acomp_original', new_column_name='acomp')
    op.alter_column('Saude', 'tipo_original', new_column_name='tipo')

    # --- 4. Recria os campos civis no RequerimentoMatricula (nullable) ---
    op.add_column('RequerimentoMatricula', sa.Column('rg', sa.String(length=11), nullable=True))
    op.add_column('RequerimentoMatricula', sa.Column('oe', sa.String(length=100), nullable=True))
    op.add_column('RequerimentoMatricula', sa.Column('uf', sa.String(length=3), nullable=True))
    op.add_column('RequerimentoMatricula', sa.Column('data_exp', sa.Date(), nullable=True))
    op.add_column('RequerimentoMatricula', sa.Column('certidao', sa.Boolean(), nullable=True))
    op.add_column('RequerimentoMatricula', sa.Column('num_termo', sa.Integer(), nullable=True))
    op.add_column('RequerimentoMatricula', sa.Column('folha', sa.Integer(), nullable=True))
    op.add_column('RequerimentoMatricula', sa.Column('livro', sa.String(length=100), nullable=True))
    op.add_column('RequerimentoMatricula', sa.Column('data_emiss', sa.Date(), nullable=True))
    op.add_column('RequerimentoMatricula', sa.Column('nome_cart', sa.String(length=200), nullable=True))
    op.add_column('RequerimentoMatricula', sa.Column('uf_cart', sa.String(length=3), nullable=True))

    # Devolve os dados civis a todos os requerimentos do aluno.
    # Obs.: num_termo e folha voltam a inteiro; valores com letras ou zeros à esquerda falham aqui.
    op.execute(
        """
        UPDATE "RequerimentoMatricula" r SET
            rg = d.rg,
            oe = d.orgao_emissor,
            uf = d.uf_rg,
            data_exp = d.data_expedicao,
            certidao = (d.tipo_certidao = 'NASCIMENTO'),
            num_termo = CAST(d.num_termo AS INTEGER),
            folha = CAST(d.folha AS INTEGER),
            livro = d.livro,
            data_emiss = d.data_emissao_certidao,
            nome_cart = d.nome_cartorio,
            uf_cart = d.uf_cartorio
        FROM "Matricula" m, "DocumentacaoCivil" d
        WHERE m.id = r.id_matricula AND d.id_aluno = m.id_aluno
        """
    )

    # --- 3. Remove os novos campos ---
    op.drop_column('RequerimentoMatricula', 'documentos_entregues')
    op.drop_column('RequerimentoMatricula', 'nome_resp_transferencia')
    op.drop_column('RequerimentoMatricula', 'nome_resp_compromisso')
    op.drop_column('RequerimentoMatricula', 'telefone_requerimento')

    # --- 2. Telefones de volta a String(100) ---
    for campo in ("tel_pai", "tel_mae"):
        op.alter_column(
            'RequerimentoMatricula', campo,
            existing_type=sa.String(length=11),
            type_=sa.String(length=100),
        )
    # Obs.: a obrigatoriedade (NOT NULL) dos campos opcionais não é restaurada automaticamente.
