from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.db.utils import new_id, utc_now


class UserFavoritePlace(Base):
    __tablename__ = "user_favorite_places"
    __table_args__ = (
        CheckConstraint("position >= 1 AND position <= 4", name="ck_user_favorite_places_position"),
        UniqueConstraint("user_id", "position", name="uq_user_favorite_places_user_id_position"),
        UniqueConstraint("user_id", "place_id", name="uq_user_favorite_places_user_id_place_id"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    user_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    place_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("places.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    position: Mapped[int] = mapped_column(Integer, nullable=False)
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

    user = relationship("User", back_populates="favorite_places")
    place = relationship("Place", back_populates="favorite_entries")
