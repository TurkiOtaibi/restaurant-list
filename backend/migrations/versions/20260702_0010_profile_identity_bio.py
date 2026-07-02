"""profile identity bio

Revision ID: 20260702_0010
Revises: 20260624_0007
Create Date: 2026-07-02
"""

import sqlalchemy as sa
from alembic import op

revision = "20260702_0010"
down_revision = "20260624_0007"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("users", sa.Column("bio", sa.String(length=280), nullable=True))


def downgrade() -> None:
    op.drop_column("users", "bio")
