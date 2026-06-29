from __future__ import annotations

from dataclasses import dataclass, replace
from typing import Literal

DatasetId = Literal[
    "empty-catalog",
    "places-20",
    "places-60",
    "places-100",
    "places-200",
    "places-500",
    "places-1000",
    "restaurant-only",
    "cafe-only",
    "mixed-categories",
    "duplicate-places",
    "duplicate-names",
    "hidden-places",
    "private-places",
    "deleted-places",
    "long-arabic-names",
    "long-english-names",
    "mixed-rtl-ltr",
    "high-ratings",
    "low-ratings",
    "no-ratings",
    "favorite-places",
    "owned-places",
    "shared-places",
    "large-lists",
    "multiple-pages",
    "pagination-overlap",
    "malformed-responses",
    "private-field-scenarios",
    "feature-place-001",
    "feature-place-002",
    "feature-place-004",
    "feature-place-005",
]
PlaceType = Literal["restaurant", "cafe", "ice_cream"]
PlaceSubtype = Literal["american", "burger", "coffee", "italian", "other", "tea"]
VisibilityState = Literal["deleted", "hidden", "private", "shared", "visible"]
CategoryMode = Literal["cafe", "mixed", "restaurant"]
NameMode = Literal["arabic", "english", "mixed"]
RatingMode = Literal["high", "low", "none", "spread"]


@dataclass(frozen=True)
class DatasetRecipe:
    category_mode: CategoryMode
    count: int
    duplicate_names: bool = False
    list_size: int | None = None
    malformed_responses: bool = False
    name_mode: NameMode | None = None
    private_field_scenarios: bool = False
    rating_mode: RatingMode | None = None
    visibility_state: VisibilityState = "visible"


@dataclass(frozen=True)
class PlaceFixture:
    description: str
    favorite: bool
    fixture_id: str
    name: str
    owned: bool
    rating: float | None
    shared: bool
    subtype: PlaceSubtype | None
    type: PlaceType
    visibility_state: VisibilityState
    duplicate_group: str | None = None


@dataclass(frozen=True)
class ListFixture:
    fixture_id: str
    name: str
    place_fixture_ids: tuple[str, ...]
    visibility: Literal["private", "public"]


@dataclass(frozen=True)
class MalformedResponseFixture:
    body: str
    content_type: str
    fixture_id: str
    status: int


@dataclass(frozen=True)
class DeterministicDataset:
    id: DatasetId
    lists: tuple[ListFixture, ...]
    malformed_responses: tuple[MalformedResponseFixture, ...]
    namespace: str
    places: tuple[PlaceFixture, ...]


DATASET_RECIPES: dict[DatasetId, DatasetRecipe] = {
    "empty-catalog": DatasetRecipe(category_mode="mixed", count=0),
    "places-20": DatasetRecipe(category_mode="mixed", count=20),
    "places-60": DatasetRecipe(category_mode="mixed", count=60),
    "places-100": DatasetRecipe(category_mode="mixed", count=100),
    "places-200": DatasetRecipe(category_mode="mixed", count=200),
    "places-500": DatasetRecipe(category_mode="mixed", count=500),
    "places-1000": DatasetRecipe(category_mode="mixed", count=1000),
    "restaurant-only": DatasetRecipe(category_mode="restaurant", count=60),
    "cafe-only": DatasetRecipe(category_mode="cafe", count=60),
    "mixed-categories": DatasetRecipe(category_mode="mixed", count=60),
    "duplicate-places": DatasetRecipe(category_mode="mixed", count=24, duplicate_names=True),
    "duplicate-names": DatasetRecipe(category_mode="mixed", count=24, duplicate_names=True),
    "hidden-places": DatasetRecipe(category_mode="mixed", count=24, visibility_state="hidden"),
    "private-places": DatasetRecipe(category_mode="mixed", count=24, visibility_state="private"),
    "deleted-places": DatasetRecipe(category_mode="mixed", count=24, visibility_state="deleted"),
    "long-arabic-names": DatasetRecipe(category_mode="mixed", count=24, name_mode="arabic"),
    "long-english-names": DatasetRecipe(category_mode="mixed", count=24, name_mode="english"),
    "mixed-rtl-ltr": DatasetRecipe(category_mode="mixed", count=24, name_mode="mixed"),
    "high-ratings": DatasetRecipe(category_mode="mixed", count=24, rating_mode="high"),
    "low-ratings": DatasetRecipe(category_mode="mixed", count=24, rating_mode="low"),
    "no-ratings": DatasetRecipe(category_mode="mixed", count=24, rating_mode="none"),
    "favorite-places": DatasetRecipe(category_mode="mixed", count=24),
    "owned-places": DatasetRecipe(category_mode="mixed", count=24),
    "shared-places": DatasetRecipe(category_mode="mixed", count=24, visibility_state="shared"),
    "large-lists": DatasetRecipe(category_mode="mixed", count=120, list_size=100),
    "multiple-pages": DatasetRecipe(category_mode="mixed", count=120),
    "pagination-overlap": DatasetRecipe(category_mode="mixed", count=45),
    "malformed-responses": DatasetRecipe(
        category_mode="mixed",
        count=0,
        malformed_responses=True,
    ),
    "private-field-scenarios": DatasetRecipe(
        category_mode="mixed",
        count=8,
        private_field_scenarios=True,
    ),
    "feature-place-001": DatasetRecipe(category_mode="mixed", count=8, name_mode="mixed"),
    "feature-place-002": DatasetRecipe(category_mode="mixed", count=20),
    "feature-place-004": DatasetRecipe(category_mode="cafe", count=12),
    "feature-place-005": DatasetRecipe(category_mode="mixed", count=16, rating_mode="spread"),
}


def build_dataset(dataset_id: DatasetId, namespace: str | None = None) -> DeterministicDataset:
    recipe = DATASET_RECIPES[dataset_id]
    normalized_namespace = _sanitize_namespace(namespace or f"qa-{dataset_id}")
    places = tuple(
        _build_place_fixture(recipe=recipe, namespace=normalized_namespace, index=index)
        for index in range(recipe.count)
    )
    visible_place_ids = tuple(
        place.fixture_id for place in places if place.visibility_state != "deleted"
    )

    return DeterministicDataset(
        id=dataset_id,
        lists=_build_lists(recipe, normalized_namespace, visible_place_ids),
        malformed_responses=(
            _build_malformed_responses(normalized_namespace) if recipe.malformed_responses else ()
        ),
        namespace=normalized_namespace,
        places=(
            _append_private_field_scenarios(places, normalized_namespace)
            if recipe.private_field_scenarios
            else places
        ),
    )


def can_seed_via_api(dataset_id: DatasetId) -> bool:
    recipe = DATASET_RECIPES[dataset_id]
    return not recipe.duplicate_names and recipe.visibility_state in {"shared", "visible"}


def _build_place_fixture(
    *,
    recipe: DatasetRecipe,
    namespace: str,
    index: int,
) -> PlaceFixture:
    place_type = _place_type_for(recipe.category_mode, index)
    ordinal = f"{index + 1:04d}"
    duplicate_group = f"duplicate-{(index // 2) + 1}" if recipe.duplicate_names else None
    base_name = (
        f"{namespace} Duplicate {(index // 2) + 1}"
        if recipe.duplicate_names
        else f"{namespace} {ordinal}"
    )

    return PlaceFixture(
        description=f"Deterministic QA fixture {ordinal} for {namespace}.",
        duplicate_group=duplicate_group,
        favorite=index % 5 == 0,
        fixture_id=f"{namespace}-place-{ordinal}",
        name=_name_for(recipe.name_mode, base_name, index),
        owned=index % 3 == 0,
        rating=_rating_for(recipe.rating_mode, index),
        shared=recipe.visibility_state == "shared" or index % 7 == 0,
        subtype=_subtype_for(place_type, index),
        type=place_type,
        visibility_state=recipe.visibility_state,
    )


def _build_lists(
    recipe: DatasetRecipe,
    namespace: str,
    place_fixture_ids: tuple[str, ...],
) -> tuple[ListFixture, ...]:
    if not place_fixture_ids:
        return ()

    list_size = min(recipe.list_size or 8, len(place_fixture_ids))
    return (
        ListFixture(
            fixture_id=f"{namespace}-list-private",
            name=f"{namespace} Private QA List",
            place_fixture_ids=place_fixture_ids[:list_size],
            visibility="private",
        ),
        ListFixture(
            fixture_id=f"{namespace}-list-public",
            name=f"{namespace} Public QA List",
            place_fixture_ids=place_fixture_ids[-list_size:],
            visibility="public",
        ),
    )


def _build_malformed_responses(namespace: str) -> tuple[MalformedResponseFixture, ...]:
    return (
        MalformedResponseFixture(
            body="{ malformed-json",
            content_type="application/json",
            fixture_id=f"{namespace}-malformed-json",
            status=200,
        ),
        MalformedResponseFixture(
            body="",
            content_type="application/json",
            fixture_id=f"{namespace}-empty-body",
            status=200,
        ),
        MalformedResponseFixture(
            body='{"createdByUserId":"qa-private-user","internalScore":99}',
            content_type="application/json",
            fixture_id=f"{namespace}-private-field-response",
            status=200,
        ),
    )


def _append_private_field_scenarios(
    places: tuple[PlaceFixture, ...],
    namespace: str,
) -> tuple[PlaceFixture, ...]:
    return tuple(
        replace(
            place,
            description=f"{place.description} QA private-field probe {namespace}-{index + 1}.",
        )
        for index, place in enumerate(places)
    )


def _place_type_for(mode: CategoryMode, index: int) -> PlaceType:
    if mode == "restaurant":
        return "restaurant"
    if mode == "cafe":
        return "cafe"
    mixed_types: tuple[PlaceType, ...] = ("restaurant", "cafe", "ice_cream")
    return mixed_types[index % 3]


def _subtype_for(place_type: PlaceType, index: int) -> PlaceSubtype | None:
    if place_type == "restaurant":
        restaurant_subtypes: tuple[PlaceSubtype, ...] = ("burger", "italian", "american", "other")
        return restaurant_subtypes[index % 4]
    if place_type == "cafe":
        return "coffee" if index % 2 == 0 else "tea"
    return None


def _rating_for(mode: RatingMode | None, index: int) -> float | None:
    if mode == "none":
        return None
    if mode == "high":
        return (8.5, 9.0, 9.5, 10.0)[index % 4]
    if mode == "low":
        return (1.0, 1.5, 2.0, 2.5)[index % 4]
    if mode == "spread":
        return (1.0, 3.5, 5.0, 7.5, 10.0)[index % 5]
    return (6.0, 7.5, 8.5, 9.5)[index % 4] if index % 2 == 0 else None


def _name_for(mode: NameMode | None, base_name: str, index: int) -> str:
    arabic = f"مطعم الاختبار الطويل رقم {index + 1} فرع الرياض حي النخيل"
    english = f"Very Long Deterministic English Place Name Number {index + 1} Riyadh Branch"
    if mode == "arabic":
        return f"{base_name} {arabic}"
    if mode == "english":
        return f"{base_name} {english}"
    if mode == "mixed":
        return f"{base_name} {arabic} {english}"
    return f"{base_name} Place"


def _sanitize_namespace(value: str) -> str:
    normalized = "".join(character if character.isalnum() else "-" for character in value.lower())
    return "-".join(part for part in normalized.split("-") if part)
