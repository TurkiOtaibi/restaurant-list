"""Add system-list flag for wishlist.

Revision ID: 20260703_0013
Revises: 20260703_0012
Create Date: 2026-07-03
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "20260703_0013"
down_revision: str | None = "20260703_0012"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "lists",
        sa.Column(
            "is_system",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
    )
    op.create_index(
        "uq_lists_one_system_list_per_user",
        "lists",
        ["user_id"],
        unique=True,
        sqlite_where=sa.text("is_system = 1"),
        postgresql_where=sa.text("is_system = true"),
    )


def downgrade() -> None:
    op.drop_index("uq_lists_one_system_list_per_user", table_name="lists")
    op.drop_column("lists", "is_system")
