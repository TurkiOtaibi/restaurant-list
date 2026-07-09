import json
from pathlib import Path

import pytest
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from app.maintenance.cleanup_test_places import (
    CONFIRMATION_PHRASE,
    CandidateFileError,
    CandidateInput,
    CleanupOptions,
    CleanupSafetyError,
    discover_marker_status,
    load_candidate_file,
    run_cleanup,
)
from app.modules.auth.models import User
from app.modules.lists.models import ListItem, UserList
from app.modules.places.models import Place
from app.modules.profile.models import UserFavoritePlace
from app.modules.ratings.models import Rating


async def test_dry_run_does_not_mutate_data(
    session_factory: async_sessionmaker[AsyncSession],
) -> None:
    async with session_factory() as session:
        place = await _seed_place_with_references(session, name="Release Smoke Burger 1234567890")

        result = await run_cleanup(
            session,
            candidates=CandidateInput(approved_place_ids=frozenset({place.id})),
            options=CleanupOptions(),
        )

        assert result.mode == "dry-run"
        assert result.would_delete == (place.id,)
        assert await _count(session, Place) == 1
        assert await _count(session, Rating) == 1
        assert await _count(session, ListItem) == 1
        assert await _count(session, UserFavoritePlace) == 1


async def test_execute_requires_explicit_confirmation(
    session_factory: async_sessionmaker[AsyncSession],
) -> None:
    async with session_factory() as session:
        place = await _seed_place(session, name="Release Smoke Burger 1234567890")

        with pytest.raises(CleanupSafetyError):
            await run_cleanup(
                session,
                candidates=CandidateInput(
                    approved_place_ids=frozenset({place.id}),
                    source_kind="json",
                ),
                options=CleanupOptions(execute=True),
            )

        assert await session.get(Place, place.id) is not None


async def test_execute_requires_production_confirmation_in_production(
    session_factory: async_sessionmaker[AsyncSession],
) -> None:
    async with session_factory() as session:
        place = await _seed_place(session, name="Release Smoke Burger 1234567890")

        with pytest.raises(CleanupSafetyError):
            await run_cleanup(
                session,
                candidates=CandidateInput(
                    approved_place_ids=frozenset({place.id}),
                    source_kind="json",
                ),
                options=CleanupOptions(
                    execute=True,
                    confirm=CONFIRMATION_PHRASE,
                    app_env="production",
                ),
            )

        assert await session.get(Place, place.id) is not None


async def test_execute_deletes_only_allowlisted_test_places_and_related_records(
    session_factory: async_sessionmaker[AsyncSession],
) -> None:
    async with session_factory() as session:
        allowlisted = await _seed_place_with_references(
            session,
            name="CodexSmokeBurgerabcdef123456",
            description="release smoke verification",
        )
        not_allowlisted = await _seed_place(
            session,
            name="Release Smoke Burger 9999999999",
            email="other-owner@example.com",
        )

        result = await run_cleanup(
            session,
            candidates=CandidateInput(
                approved_place_ids=frozenset({allowlisted.id}),
                source_kind="json",
            ),
            options=CleanupOptions(
                execute=True,
                confirm=CONFIRMATION_PHRASE,
                confirm_production=True,
            ),
        )

        assert result.deleted == (allowlisted.id,)
        assert await session.get(Place, allowlisted.id) is None
        assert await session.get(Place, not_allowlisted.id) is not None
        assert await _count(session, Rating) == 0
        assert await _count(session, ListItem) == 0
        assert await _count(session, UserFavoritePlace) == 0


async def test_ambiguous_candidate_is_skipped(
    session_factory: async_sessionmaker[AsyncSession],
) -> None:
    async with session_factory() as session:
        place = await _seed_place(session, name="Detail Place 1782924890213")

        result = await run_cleanup(
            session,
            candidates=CandidateInput(
                approved_place_ids=frozenset({place.id}),
                source_kind="json",
            ),
            options=CleanupOptions(
                execute=True,
                confirm=CONFIRMATION_PHRASE,
                confirm_production=True,
            ),
        )

        assert result.deleted == tuple()
        assert result.skipped[0].skip_reason == "ambiguous candidate requires manual review"
        assert await session.get(Place, place.id) is not None


async def test_real_place_is_not_deleted_even_if_allowlisted(
    session_factory: async_sessionmaker[AsyncSession],
) -> None:
    async with session_factory() as session:
        place = await _seed_place(session, name="Real Catalog Cafe")

        result = await run_cleanup(
            session,
            candidates=CandidateInput(
                approved_place_ids=frozenset({place.id}),
                source_kind="json",
            ),
            options=CleanupOptions(
                execute=True,
                confirm=CONFIRMATION_PHRASE,
                confirm_production=True,
            ),
        )

        assert result.deleted == tuple()
        assert result.skipped[0].skip_reason == "place lacks explicit smoke/test/Codex evidence"
        assert await session.get(Place, place.id) is not None


async def test_protected_system_wishlist_place_is_preserved(
    session_factory: async_sessionmaker[AsyncSession],
) -> None:
    async with session_factory() as session:
        place = await _seed_place(session, name="Release Wishlist Burger 1234567890")
        owner = await session.get(User, place.created_by_user_id)
        assert owner is not None
        wishlist = UserList(
            user_id=owner.id,
            name="رغباتي",
            visibility="private",
            is_system=True,
        )
        session.add(wishlist)
        await session.flush()
        session.add(ListItem(list_id=wishlist.id, place_id=place.id))
        await session.commit()

        result = await run_cleanup(
            session,
            candidates=CandidateInput(
                approved_place_ids=frozenset({place.id}),
                source_kind="json",
            ),
            options=CleanupOptions(
                execute=True,
                confirm=CONFIRMATION_PHRASE,
                confirm_production=True,
            ),
        )

        assert result.deleted == tuple()
        assert result.skipped[0].skip_reason == "protected smoke baseline/system-list reference"
        assert await session.get(Place, place.id) is not None
        assert await session.get(UserList, wishlist.id) is not None


async def test_arabic_smoke_markers_are_recognized(
    session_factory: async_sessionmaker[AsyncSession],
) -> None:
    async with session_factory() as session:
        place = await _seed_place(
            session,
            name="\u062f\u062e\u0627\u0646 \u0645\u0641\u0636\u0644\u0629 1 1783041010129",
            description="\u0645\u0643\u0627\u0646 \u0627\u062e\u062a\u0628\u0627\u0631",
        )

        is_test, ambiguous, reasons = discover_marker_status(place)

        assert is_test is True
        assert ambiguous is False
        assert reasons


def test_invalid_candidate_file_fails_safely(tmp_path: Path) -> None:
    candidate_file = tmp_path / "candidates.json"
    candidate_file.write_text(
        json.dumps({"approvedPlaceIds": ["not-a-place-id"]}),
        encoding="utf-8",
    )

    with pytest.raises(CandidateFileError):
        load_candidate_file(candidate_file)


async def _seed_place_with_references(
    session: AsyncSession,
    *,
    name: str,
    description: str | None = None,
) -> Place:
    place = await _seed_place(session, name=name, description=description)
    owner = await session.get(User, place.created_by_user_id)
    assert owner is not None
    user_list = UserList(user_id=owner.id, name=f"List for {name}", visibility="public")
    session.add(user_list)
    await session.flush()
    session.add(ListItem(list_id=user_list.id, place_id=place.id))
    session.add(Rating(user_id=owner.id, place_id=place.id, rating=8.5))
    session.add(UserFavoritePlace(user_id=owner.id, place_id=place.id, position=1))
    await session.commit()
    return place


async def _seed_place(
    session: AsyncSession,
    *,
    name: str,
    email: str = "owner@example.com",
    description: str | None = None,
) -> Place:
    owner = User(email=email, password_hash="x")
    session.add(owner)
    await session.flush()
    place = Place(
        name=name,
        normalized_name=name.lower(),
        type="restaurant",
        subtype="burger",
        description=description,
        created_by_user_id=owner.id,
    )
    session.add(place)
    await session.commit()
    return place


async def _count(session: AsyncSession, model: type[object]) -> int:
    return int(await session.scalar(select(func.count()).select_from(model)) or 0)
