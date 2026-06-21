"""decimal ratings

Revision ID: 20260621_0006
Revises: 20260620_0005
Create Date: 2026-06-21
"""

import sqlalchemy as sa
from alembic import op

revision = "20260621_0006"
down_revision = "20260620_0005"
branch_labels = None
depends_on = None


RATING_CHECK = "rating >= 1 AND rating <= 10 AND rating * 2 = ROUND(rating * 2, 0)"


def upgrade() -> None:
    op.drop_constraint("ck_ratings_rating_range", "ratings", type_="check")
    op.alter_column(
        "ratings",
        "rating",
        existing_type=sa.Integer(),
        type_=sa.Numeric(3, 1),
        existing_nullable=False,
        postgresql_using="rating::numeric(3, 1)",
    )
    op.create_check_constraint("ck_ratings_rating_range", "ratings", RATING_CHECK)


def downgrade() -> None:
    op.drop_constraint("ck_ratings_rating_range", "ratings", type_="check")
    op.alter_column(
        "ratings",
        "rating",
        existing_type=sa.Numeric(3, 1),
        type_=sa.Integer(),
        existing_nullable=False,
        postgresql_using="rating::integer",
    )
    op.create_check_constraint("ck_ratings_rating_range", "ratings", "rating >= 1 AND rating <= 10")
