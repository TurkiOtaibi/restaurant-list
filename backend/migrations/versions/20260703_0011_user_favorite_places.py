"""user favorite places

Revision ID: 20260703_0011
Revises: 20260702_0010
Create Date: 2026-07-03
"""

import sqlalchemy as sa
from alembic import op

revision = "20260703_0011"
down_revision = "20260702_0010"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "user_favorite_places",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("user_id", sa.String(length=36), nullable=False),
        sa.Column("place_id", sa.String(length=36), nullable=False),
        sa.Column("position", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint(
            "position >= 1 AND position <= 4",
            name="ck_user_favorite_places_position",
        ),
        sa.ForeignKeyConstraint(["place_id"], ["places.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "user_id",
            "place_id",
            name="uq_user_favorite_places_user_id_place_id",
        ),
        sa.UniqueConstraint(
            "user_id",
            "position",
            name="uq_user_favorite_places_user_id_position",
        ),
    )
    op.create_index(
        op.f("ix_user_favorite_places_place_id"),
        "user_favorite_places",
        ["place_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_user_favorite_places_user_id"),
        "user_favorite_places",
        ["user_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_user_favorite_places_user_id"), table_name="user_favorite_places")
    op.drop_index(op.f("ix_user_favorite_places_place_id"), table_name="user_favorite_places")
    op.drop_table("user_favorite_places")
