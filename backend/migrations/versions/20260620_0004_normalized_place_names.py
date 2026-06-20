"""normalized place name uniqueness

Revision ID: 20260620_0004
Revises: 20260620_0003
Create Date: 2026-06-20
"""

import sqlalchemy as sa
from alembic import op

revision = "20260620_0004"
down_revision = "20260620_0003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("places", sa.Column("normalized_name", sa.String(length=120), nullable=True))
    bind = op.get_bind()
    if bind.dialect.name == "sqlite":
        op.execute("UPDATE places SET normalized_name = lower(trim(name))")
    else:
        op.execute(
            """
            UPDATE places
            SET normalized_name = lower(regexp_replace(trim(name), '\\s+', ' ', 'g'))
            """
        )
    op.alter_column(
        "places", "normalized_name", existing_type=sa.String(length=120), nullable=False
    )
    op.create_index(op.f("ix_places_normalized_name"), "places", ["normalized_name"], unique=True)


def downgrade() -> None:
    op.drop_index(op.f("ix_places_normalized_name"), table_name="places")
    op.drop_column("places", "normalized_name")
