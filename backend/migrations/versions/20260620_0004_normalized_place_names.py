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
    # Quarantine any pre-existing duplicate normalized names (keep the earliest
    # row unchanged, suffix the rest) so the unique index below cannot fail on a
    # populated database. No-op on a clean database.
    op.execute(
        """
        UPDATE places
        SET normalized_name = substr(normalized_name, 1, 70) || '-dup-' || id
        WHERE id IN (
            SELECT p.id
            FROM places p
            JOIN places q
              ON q.normalized_name = p.normalized_name
             AND (
                 q.created_at < p.created_at
                 OR (q.created_at = p.created_at AND q.id < p.id)
             )
        )
        """
    )
    op.create_index(op.f("ix_places_normalized_name"), "places", ["normalized_name"], unique=True)


def downgrade() -> None:
    op.drop_index(op.f("ix_places_normalized_name"), table_name="places")
    op.drop_column("places", "normalized_name")
