"""sprint 2 ratings and list visibility

Revision ID: 20260619_0002
Revises: 20260618_0001
Create Date: 2026-06-19
"""

import sqlalchemy as sa
from alembic import op

revision = "20260619_0002"
down_revision = "20260618_0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "lists",
        sa.Column(
            "visibility",
            sa.String(length=20),
            server_default="private",
            nullable=False,
        ),
    )
    op.create_check_constraint(
        "ck_lists_visibility",
        "lists",
        "visibility IN ('public', 'private')",
    )

    op.create_table(
        "ratings",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("user_id", sa.String(length=36), nullable=False),
        sa.Column("place_id", sa.String(length=36), nullable=False),
        sa.Column("rating", sa.Integer(), nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint("rating >= 1 AND rating <= 10", name="ck_ratings_rating_range"),
        sa.ForeignKeyConstraint(["place_id"], ["places.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "place_id", name="uq_ratings_user_id_place_id"),
    )
    op.create_index(op.f("ix_ratings_place_id"), "ratings", ["place_id"], unique=False)
    op.create_index(op.f("ix_ratings_user_id"), "ratings", ["user_id"], unique=False)

    op.alter_column("lists", "visibility", server_default=None)


def downgrade() -> None:
    op.drop_index(op.f("ix_ratings_user_id"), table_name="ratings")
    op.drop_index(op.f("ix_ratings_place_id"), table_name="ratings")
    op.drop_table("ratings")
    op.drop_constraint("ck_lists_visibility", "lists", type_="check")
    op.drop_column("lists", "visibility")
