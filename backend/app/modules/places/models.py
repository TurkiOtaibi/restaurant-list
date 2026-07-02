from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.db.utils import new_id, utc_now


class Place(Base):
    __tablename__ = "places"
    __table_args__ = (
        CheckConstraint("type IN ('restaurant', 'cafe', 'ice_cream')", name="ck_places_type"),
        CheckConstraint(
            """
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
            """,
            name="ck_places_subtype_for_type",
        ),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    name: Mapped[str] = mapped_column(String(120), nullable=False, unique=True, index=True)
    normalized_name: Mapped[str] = mapped_column(
        String(120), nullable=False, unique=True, index=True
    )
    type: Mapped[str] = mapped_column(String(20), nullable=False)
    subtype: Mapped[str | None] = mapped_column(String(30), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_by_user_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        onupdate=utc_now,
        nullable=False,
    )

    created_by_user = relationship("User", back_populates="places_created")
    favorite_entries = relationship("UserFavoritePlace", back_populates="place")
    list_items = relationship("ListItem", back_populates="place")
    ratings = relationship("Rating", back_populates="place")
