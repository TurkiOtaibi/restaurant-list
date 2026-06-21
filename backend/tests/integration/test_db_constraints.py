"""Database-level constraint and referential-integrity tests.

These run against PostgreSQL in CI (via POSTGRES_TEST_DATABASE_URL) and against
SQLite locally with ``PRAGMA foreign_keys=ON`` so the same referential rules are
enforced in both environments.
"""

from datetime import timedelta

import pytest
from sqlalchemy import delete, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from app.db.utils import utc_now
from app.modules.auth.models import RefreshToken, User
from app.modules.lists.models import ListItem, UserList
from app.modules.places.models import Place
from app.modules.ratings.models import Rating


async def test_rating_half_step_check_is_enforced_by_database(
    session_factory: async_sessionmaker[AsyncSession],
) -> None:
    async with session_factory() as session:
        owner = User(email="owner@example.com", password_hash="x")
        session.add(owner)
        await session.flush()
        place = Place(
            name="Half Step",
            normalized_name="half step",
            type="ice_cream",
            subtype=None,
            created_by_user_id=owner.id,
        )
        session.add(place)
        await session.flush()

        session.add(Rating(user_id=owner.id, place_id=place.id, rating=3.3))
        with pytest.raises(IntegrityError):
            await session.commit()


async def test_normalized_name_uniqueness_is_enforced_by_database(
    session_factory: async_sessionmaker[AsyncSession],
) -> None:
    async with session_factory() as session:
        owner = User(email="owner@example.com", password_hash="x")
        session.add(owner)
        await session.flush()

        session.add(
            Place(
                name="Cafe One",
                normalized_name="cafe one",
                type="cafe",
                subtype="coffee",
                created_by_user_id=owner.id,
            )
        )
        session.add(
            Place(
                name="CAFE  ONE",
                normalized_name="cafe one",
                type="cafe",
                subtype="coffee",
                created_by_user_id=owner.id,
            )
        )
        with pytest.raises(IntegrityError):
            await session.commit()


async def test_user_deletion_cascades_to_owned_data(
    session_factory: async_sessionmaker[AsyncSession],
) -> None:
    async with session_factory() as session:
        creator = User(email="creator@example.com", password_hash="x")
        member = User(email="member@example.com", password_hash="x")
        session.add_all([creator, member])
        await session.flush()

        place = Place(
            name="Shared Place",
            normalized_name="shared place",
            type="ice_cream",
            subtype=None,
            created_by_user_id=creator.id,
        )
        session.add(place)
        await session.flush()

        user_list = UserList(user_id=member.id, name="Member list")
        session.add(user_list)
        await session.flush()

        session.add(ListItem(list_id=user_list.id, place_id=place.id))
        session.add(Rating(user_id=member.id, place_id=place.id, rating=8.5))
        session.add(
            RefreshToken(
                user_id=member.id,
                token_hash="member-token-hash",
                expires_at=utc_now() + timedelta(days=1),
            )
        )
        await session.commit()

        member_id = member.id
        list_id = user_list.id

        # DB-level delete so ON DELETE CASCADE is exercised (not ORM disassociation).
        await session.execute(delete(User).where(User.id == member_id))
        await session.commit()

    async with session_factory() as session:
        assert await session.scalar(select(UserList).where(UserList.user_id == member_id)) is None
        assert await session.scalar(select(ListItem).where(ListItem.list_id == list_id)) is None
        assert await session.scalar(select(Rating).where(Rating.user_id == member_id)) is None
        assert (
            await session.scalar(select(RefreshToken).where(RefreshToken.user_id == member_id))
            is None
        )
        # The creator's place must survive: nothing cascades from the member to it.
        assert (
            await session.scalar(select(Place).where(Place.normalized_name == "shared place"))
            is not None
        )


async def test_place_creator_deletion_is_restricted(
    session_factory: async_sessionmaker[AsyncSession],
) -> None:
    async with session_factory() as session:
        creator = User(email="restrict@example.com", password_hash="x")
        session.add(creator)
        await session.flush()
        session.add(
            Place(
                name="Owned Place",
                normalized_name="owned place",
                type="ice_cream",
                subtype=None,
                created_by_user_id=creator.id,
            )
        )
        await session.commit()
        creator_id = creator.id

        # RESTRICT is enforced at statement execution, so the delete itself raises.
        with pytest.raises(IntegrityError):
            await session.execute(delete(User).where(User.id == creator_id))
            await session.commit()
