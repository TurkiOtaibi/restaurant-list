"""place taxonomy

Revision ID: 20260620_0005
Revises: 20260620_0004
Create Date: 2026-06-20
"""

import sqlalchemy as sa
from alembic import op

revision = "20260620_0005"
down_revision = "20260620_0004"
branch_labels = None
depends_on = None


PLACE_TYPE_CHECK = "type IN ('restaurant', 'cafe', 'ice_cream')"
PLACE_SUBTYPE_CHECK = """
(
    type = 'restaurant'
    AND subtype IN (
        'burger',
        'italian',
        'american',
        'steak',
        'grill',
        'shawarma',
        'saudi',
        'gulf',
        'indian',
        'asian',
        'seafood',
        'breakfast',
        'healthy',
        'other'
    )
)
OR (type = 'cafe' AND subtype IN ('coffee', 'tea'))
OR (type = 'ice_cream' AND subtype IS NULL)
"""


def upgrade() -> None:
    op.add_column("places", sa.Column("subtype", sa.String(length=30), nullable=True))
    op.execute("UPDATE places SET subtype = 'other' WHERE type = 'restaurant'")
    op.execute("UPDATE places SET subtype = 'coffee' WHERE type = 'cafe'")
    op.drop_constraint("ck_places_type", "places", type_="check")
    op.create_check_constraint("ck_places_type", "places", PLACE_TYPE_CHECK)
    op.create_check_constraint("ck_places_subtype_for_type", "places", PLACE_SUBTYPE_CHECK)


def downgrade() -> None:
    op.drop_constraint("ck_places_subtype_for_type", "places", type_="check")
    op.drop_constraint("ck_places_type", "places", type_="check")
    op.create_check_constraint("ck_places_type", "places", "type IN ('restaurant', 'cafe')")
    op.drop_column("places", "subtype")
