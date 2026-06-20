"""sprint 1 foundation

Revision ID: 20260618_0001
Revises:
Create Date: 2026-06-18
"""

import sqlalchemy as sa
from alembic import op

revision = "20260618_0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("email", sa.String(length=320), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=True)

    op.create_table(
        "places",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("type", sa.String(length=20), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("created_by_user_id", sa.String(length=36), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint("type IN ('restaurant', 'cafe')", name="ck_places_type"),
        sa.ForeignKeyConstraint(["created_by_user_id"], ["users.id"], ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_places_created_by_user_id"),
        "places",
        ["created_by_user_id"],
        unique=False,
    )
    op.create_index(op.f("ix_places_name"), "places", ["name"], unique=True)

    op.create_table(
        "lists",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("user_id", sa.String(length=36), nullable=False),
        sa.Column("name", sa.String(length=80), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_lists_user_id"), "lists", ["user_id"], unique=False)

    op.create_table(
        "list_items",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("list_id", sa.String(length=36), nullable=False),
        sa.Column("place_id", sa.String(length=36), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["list_id"], ["lists.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["place_id"], ["places.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("list_id", "place_id", name="uq_list_items_list_id_place_id"),
    )
    op.create_index(op.f("ix_list_items_list_id"), "list_items", ["list_id"], unique=False)
    op.create_index(op.f("ix_list_items_place_id"), "list_items", ["place_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_list_items_place_id"), table_name="list_items")
    op.drop_index(op.f("ix_list_items_list_id"), table_name="list_items")
    op.drop_table("list_items")
    op.drop_index(op.f("ix_lists_user_id"), table_name="lists")
    op.drop_table("lists")
    op.drop_index(op.f("ix_places_name"), table_name="places")
    op.drop_index(op.f("ix_places_created_by_user_id"), table_name="places")
    op.drop_table("places")
    op.drop_index(op.f("ix_users_email"), table_name="users")
    op.drop_table("users")
