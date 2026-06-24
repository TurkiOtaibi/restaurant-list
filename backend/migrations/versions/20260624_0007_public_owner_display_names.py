"""public owner display names

Revision ID: 20260624_0007
Revises: 20260621_0006
Create Date: 2026-06-24
"""

import sqlalchemy as sa
from alembic import op

revision = "20260624_0007"
down_revision = "20260621_0006"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column(
            "display_name",
            sa.String(length=80),
            nullable=False,
            server_default="مستخدم سجل",
        ),
    )
    op.alter_column("users", "display_name", server_default=None)


def downgrade() -> None:
    op.drop_column("users", "display_name")
