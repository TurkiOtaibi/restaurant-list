"""Safely remove explicitly approved smoke/test/Codex places.

The command defaults to dry-run mode. Execute mode requires a JSON allowlist,
an exact confirmation string, and an additional production confirmation when
APP_ENV=production.
"""

from __future__ import annotations

import argparse
import asyncio
import json
import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.db.session import AsyncSessionLocal
from app.modules.lists.models import ListItem, UserList
from app.modules.places.models import Place
from app.modules.profile.models import UserFavoritePlace
from app.modules.ratings.models import Rating

CONFIRMATION_PHRASE = "DELETE_TEST_PLACES_ONLY"
UUID_PATTERN = re.compile(
    r"\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-"
    r"[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\b"
)
GENERATED_SUFFIX_PATTERN = re.compile(r"(?:^|\s)\d{10,}$")
SMOKE_FAVORITE_PATTERN = re.compile(
    r"^\u062f\u062e\u0627\u0646 \u0645\u0641\u0636\u0644\u0629\s+\d+\s+\d{10,}$"
)
EXPLICIT_TEST_MARKERS = (
    "codex",
    "smoke",
    "test",
    "release",
    "\u0627\u0644\u0625\u0635\u062f\u0627\u0631",
    "\u0627\u062e\u062a\u0628\u0627\u0631",
    "\u062a\u062c\u0631\u064a\u0628\u064a",
)


class CleanupSafetyError(RuntimeError):
    """Raised when requested cleanup would violate safety gates."""


class CandidateFileError(ValueError):
    """Raised when the candidate file is missing, unsupported, or invalid."""


@dataclass(frozen=True)
class CandidateInput:
    approved_place_ids: frozenset[str]
    ambiguous_place_ids: frozenset[str] = frozenset()
    protected_place_ids: frozenset[str] = frozenset()
    source_kind: str = "discovery"


@dataclass(frozen=True)
class ListReference:
    id: str
    name: str
    visibility: str
    is_system: bool


@dataclass(frozen=True)
class PlaceReferenceSummary:
    list_items: int
    ratings: int
    favorite_entries: int
    image_url_present: bool
    lists: tuple[ListReference, ...]


@dataclass(frozen=True)
class PlaceAssessment:
    place_id: str
    name: str
    created_at: str
    created_by_user_id: str
    safe_to_delete: bool
    ambiguous: bool
    protected: bool
    reasons: tuple[str, ...]
    skip_reason: str | None
    references: PlaceReferenceSummary


@dataclass(frozen=True)
class CleanupOptions:
    execute: bool = False
    confirm: str | None = None
    confirm_production: bool = False
    app_env: str = "development"


@dataclass(frozen=True)
class CleanupRunResult:
    mode: str
    assessed: tuple[PlaceAssessment, ...]
    would_delete: tuple[str, ...] = field(default_factory=tuple)
    deleted: tuple[str, ...] = field(default_factory=tuple)
    skipped: tuple[PlaceAssessment, ...] = field(default_factory=tuple)


def load_candidate_file(path: Path) -> CandidateInput:
    if not path.exists():
        raise CandidateFileError(f"Candidate file does not exist: {path}")

    if path.suffix.lower() == ".json":
        return _load_json_candidate_file(path)
    if path.suffix.lower() in {".md", ".markdown"}:
        return _load_markdown_candidate_file(path)

    raise CandidateFileError(
        "Candidate file must be JSON for execute mode or Markdown for dry-run."
    )


def discover_marker_status(place: Place) -> tuple[bool, bool, tuple[str, ...]]:
    name = place.name
    description = place.description or ""
    haystack = f"{name}\n{description}"
    haystack_lower = haystack.lower()
    reasons: list[str] = []

    for marker in EXPLICIT_TEST_MARKERS:
        if marker.lower() in haystack_lower:
            reasons.append(f"explicit marker `{marker}`")

    if SMOKE_FAVORITE_PATTERN.search(name):
        reasons.append("generated smoke favorites batch pattern")

    is_test = bool(reasons)
    ambiguous = not is_test and GENERATED_SUFFIX_PATTERN.search(name) is not None
    if ambiguous:
        reasons.append("generated-looking numeric suffix without explicit marker")

    return is_test, ambiguous, tuple(reasons)


async def run_cleanup(
    session: AsyncSession,
    *,
    candidates: CandidateInput | None,
    options: CleanupOptions,
) -> CleanupRunResult:
    candidate_input = candidates or await discover_candidates(session)
    if options.execute:
        _validate_execute_options(candidate_input, options)
        return await _execute_cleanup(session, candidate_input)

    return await _dry_run_cleanup(session, candidate_input)


async def discover_candidates(session: AsyncSession) -> CandidateInput:
    places = list(await session.scalars(select(Place).order_by(Place.created_at.asc())))
    approved: set[str] = set()
    ambiguous: set[str] = set()
    for place in places:
        is_test, is_ambiguous, _reasons = discover_marker_status(place)
        if is_test:
            approved.add(place.id)
        elif is_ambiguous:
            ambiguous.add(place.id)

    return CandidateInput(
        approved_place_ids=frozenset(approved),
        ambiguous_place_ids=frozenset(ambiguous),
        source_kind="discovery",
    )


async def _dry_run_cleanup(
    session: AsyncSession,
    candidates: CandidateInput,
) -> CleanupRunResult:
    assessments = await _assess_candidates(session, candidates)
    would_delete = tuple(
        assessment.place_id for assessment in assessments if assessment.safe_to_delete
    )
    skipped = tuple(assessment for assessment in assessments if not assessment.safe_to_delete)
    return CleanupRunResult(
        mode="dry-run",
        assessed=tuple(assessments),
        would_delete=would_delete,
        skipped=skipped,
    )


async def _execute_cleanup(
    session: AsyncSession,
    candidates: CandidateInput,
) -> CleanupRunResult:
    async with session.begin():
        assessments = await _assess_candidates(session, candidates)
        deletable_ids = tuple(
            assessment.place_id for assessment in assessments if assessment.safe_to_delete
        )
        skipped = tuple(assessment for assessment in assessments if not assessment.safe_to_delete)

        for place_id in deletable_ids:
            await _delete_place_and_references(session, place_id)

    return CleanupRunResult(
        mode="execute",
        assessed=tuple(assessments),
        deleted=deletable_ids,
        skipped=skipped,
    )


async def _assess_candidates(
    session: AsyncSession,
    candidates: CandidateInput,
) -> list[PlaceAssessment]:
    ordered_ids = sorted(candidates.approved_place_ids | candidates.ambiguous_place_ids)
    assessments: list[PlaceAssessment] = []
    for place_id in ordered_ids:
        place = await session.get(Place, place_id)
        if place is None:
            assessments.append(
                PlaceAssessment(
                    place_id=place_id,
                    name="",
                    created_at="",
                    created_by_user_id="",
                    safe_to_delete=False,
                    ambiguous=False,
                    protected=False,
                    reasons=("place not found",),
                    skip_reason="place not found",
                    references=PlaceReferenceSummary(
                        list_items=0,
                        ratings=0,
                        favorite_entries=0,
                        image_url_present=False,
                        lists=tuple(),
                    ),
                )
            )
            continue

        references = await _place_references(session, place.id)
        is_test, discovered_ambiguous, marker_reasons = discover_marker_status(place)
        ambiguous = place.id in candidates.ambiguous_place_ids or discovered_ambiguous
        protected = place.id in candidates.protected_place_ids or any(
            list_reference.is_system for list_reference in references.lists
        )
        skip_reason = _skip_reason(
            in_allowlist=place.id in candidates.approved_place_ids,
            is_test=is_test,
            ambiguous=ambiguous,
            protected=protected,
        )
        assessments.append(
            PlaceAssessment(
                place_id=place.id,
                name=place.name,
                created_at=place.created_at.isoformat(),
                created_by_user_id=place.created_by_user_id,
                safe_to_delete=skip_reason is None,
                ambiguous=ambiguous,
                protected=protected,
                reasons=marker_reasons,
                skip_reason=skip_reason,
                references=references,
            )
        )

    return assessments


def _skip_reason(
    *,
    in_allowlist: bool,
    is_test: bool,
    ambiguous: bool,
    protected: bool,
) -> str | None:
    if not in_allowlist:
        return "not in approved allowlist"
    if protected:
        return "protected smoke baseline/system-list reference"
    if ambiguous:
        return "ambiguous candidate requires manual review"
    if not is_test:
        return "place lacks explicit smoke/test/Codex evidence"
    return None


async def _place_references(session: AsyncSession, place_id: str) -> PlaceReferenceSummary:
    list_rows = (
        await session.execute(
            select(UserList.id, UserList.name, UserList.visibility, UserList.is_system)
            .join(ListItem, ListItem.list_id == UserList.id)
            .where(ListItem.place_id == place_id)
            .order_by(UserList.created_at.asc())
        )
    ).all()
    lists = tuple(
        ListReference(
            id=list_id,
            name=list_name,
            visibility=list_visibility,
            is_system=bool(list_is_system),
        )
        for list_id, list_name, list_visibility, list_is_system in list_rows
    )
    place = await session.get(Place, place_id)
    return PlaceReferenceSummary(
        list_items=await _count_list_items(session, place_id),
        ratings=await _count_ratings(session, place_id),
        favorite_entries=await _count_favorite_entries(session, place_id),
        image_url_present=bool(place and place.image_url),
        lists=lists,
    )


async def _count_list_items(session: AsyncSession, place_id: str) -> int:
    return int(
        await session.scalar(
            select(func.count()).select_from(ListItem).where(ListItem.place_id == place_id)
        )
        or 0
    )


async def _count_ratings(session: AsyncSession, place_id: str) -> int:
    return int(
        await session.scalar(
            select(func.count()).select_from(Rating).where(Rating.place_id == place_id)
        )
        or 0
    )


async def _count_favorite_entries(session: AsyncSession, place_id: str) -> int:
    return int(
        await session.scalar(
            select(func.count())
            .select_from(UserFavoritePlace)
            .where(UserFavoritePlace.place_id == place_id)
        )
        or 0
    )


async def _delete_place_and_references(session: AsyncSession, place_id: str) -> None:
    await session.execute(delete(UserFavoritePlace).where(UserFavoritePlace.place_id == place_id))
    await session.execute(delete(Rating).where(Rating.place_id == place_id))
    await session.execute(delete(ListItem).where(ListItem.place_id == place_id))
    await session.execute(delete(Place).where(Place.id == place_id))


def _validate_execute_options(candidates: CandidateInput, options: CleanupOptions) -> None:
    if candidates.source_kind != "json":
        raise CleanupSafetyError("Execute mode requires a JSON candidate allowlist file.")
    if not candidates.approved_place_ids:
        raise CleanupSafetyError("Execute mode requires at least one approved place ID.")
    if options.confirm != CONFIRMATION_PHRASE:
        raise CleanupSafetyError(f'Execute mode requires --confirm "{CONFIRMATION_PHRASE}".')
    if options.app_env.lower() == "production" and not options.confirm_production:
        raise CleanupSafetyError(
            "Production execute mode requires --confirm-production in addition to --confirm."
        )


def _load_json_candidate_file(path: Path) -> CandidateInput:
    raw = json.loads(path.read_text(encoding="utf-8"))
    if isinstance(raw, list):
        approved = _string_set(raw, field_name="root array")
        ambiguous: set[str] = set()
        protected: set[str] = set()
    elif isinstance(raw, dict):
        approved = _first_string_set(
            raw,
            field_names=("approvedPlaceIds", "approved_place_ids", "placeIds", "place_ids"),
        )
        ambiguous = _first_string_set(
            raw,
            field_names=("ambiguousPlaceIds", "ambiguous_place_ids"),
            required=False,
        )
        protected = _first_string_set(
            raw,
            field_names=("protectedPlaceIds", "protected_place_ids"),
            required=False,
        )
    else:
        raise CandidateFileError("JSON candidate file must be an object or an array of IDs.")

    return CandidateInput(
        approved_place_ids=frozenset(approved),
        ambiguous_place_ids=frozenset(ambiguous),
        protected_place_ids=frozenset(protected),
        source_kind="json",
    )


def _load_markdown_candidate_file(path: Path) -> CandidateInput:
    approved: set[str] = set()
    ambiguous: set[str] = set()
    section = ""
    for line in path.read_text(encoding="utf-8").splitlines():
        normalized = line.strip().lower()
        if normalized.startswith("## "):
            if "safe-to-delete" in normalized or "safe to delete" in normalized:
                section = "approved"
            elif "manual review" in normalized:
                section = "ambiguous"
            elif normalized.startswith("## not-delete") or normalized.startswith("## not delete"):
                section = "other"
            continue

        ids = set(UUID_PATTERN.findall(line))
        if section == "approved":
            approved.update(ids)
        elif section == "ambiguous":
            ambiguous.update(ids)

    if not approved and not ambiguous:
        raise CandidateFileError("Markdown candidate file did not contain candidate place IDs.")

    return CandidateInput(
        approved_place_ids=frozenset(approved),
        ambiguous_place_ids=frozenset(ambiguous),
        source_kind="markdown",
    )


def _first_string_set(
    raw: dict[str, Any],
    *,
    field_names: tuple[str, ...],
    required: bool = True,
) -> set[str]:
    for field_name in field_names:
        if field_name in raw:
            return _string_set(raw[field_name], field_name=field_name)
    if required:
        joined = ", ".join(field_names)
        raise CandidateFileError(f"JSON candidate file must include one of: {joined}.")
    return set()


def _string_set(raw: object, *, field_name: str) -> set[str]:
    if not isinstance(raw, list):
        raise CandidateFileError(f"`{field_name}` must be a list of place IDs.")
    values: set[str] = set()
    for value in raw:
        if not isinstance(value, str) or not UUID_PATTERN.fullmatch(value):
            raise CandidateFileError(f"`{field_name}` contains an invalid place ID.")
        values.add(value)
    return values


def cleanup_result_to_dict(result: CleanupRunResult) -> dict[str, Any]:
    return {
        "mode": result.mode,
        "assessedCount": len(result.assessed),
        "wouldDelete": list(result.would_delete),
        "deleted": list(result.deleted),
        "skipped": [_assessment_to_dict(assessment) for assessment in result.skipped],
        "assessed": [_assessment_to_dict(assessment) for assessment in result.assessed],
    }


def _assessment_to_dict(assessment: PlaceAssessment) -> dict[str, Any]:
    return {
        "placeId": assessment.place_id,
        "name": assessment.name,
        "createdAt": assessment.created_at,
        "createdByUserId": assessment.created_by_user_id,
        "safeToDelete": assessment.safe_to_delete,
        "ambiguous": assessment.ambiguous,
        "protected": assessment.protected,
        "reasons": list(assessment.reasons),
        "skipReason": assessment.skip_reason,
        "references": {
            "listItems": assessment.references.list_items,
            "ratings": assessment.references.ratings,
            "favoriteEntries": assessment.references.favorite_entries,
            "imageUrlPresent": assessment.references.image_url_present,
            "lists": [
                {
                    "id": list_reference.id,
                    "name": list_reference.name,
                    "visibility": list_reference.visibility,
                    "isSystem": list_reference.is_system,
                }
                for list_reference in assessment.references.lists
            ],
        },
    }


def _parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Dry-run or execute cleanup for explicitly approved smoke/test/Codex places."
    )
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--dry-run", action="store_true", help="Inspect candidates without mutation.")
    mode.add_argument("--execute", action="store_true", help="Delete approved safe candidates.")
    parser.add_argument(
        "--candidate-file",
        type=Path,
        help="Markdown dry-run report or JSON execute allowlist.",
    )
    parser.add_argument("--confirm", help="Required execute confirmation string.")
    parser.add_argument(
        "--confirm-production",
        action="store_true",
        help="Required for execute mode when APP_ENV=production.",
    )
    return parser


async def _run_from_args(args: argparse.Namespace) -> CleanupRunResult:
    settings = get_settings()
    candidates = load_candidate_file(args.candidate_file) if args.candidate_file else None
    options = CleanupOptions(
        execute=bool(args.execute),
        confirm=args.confirm,
        confirm_production=bool(args.confirm_production),
        app_env=settings.app_env,
    )
    async with AsyncSessionLocal() as session:
        return await run_cleanup(session, candidates=candidates, options=options)


def main() -> None:
    args = _parser().parse_args()
    result = asyncio.run(_run_from_args(args))
    print(json.dumps(cleanup_result_to_dict(result), ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
