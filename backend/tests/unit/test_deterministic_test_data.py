from tests.support.deterministic_test_data import build_dataset, can_seed_via_api


def test_backend_deterministic_dataset_generation_is_repeatable() -> None:
    first = build_dataset("places-20", namespace="QA Stable Dataset")
    second = build_dataset("places-20", namespace="QA Stable Dataset")

    assert first == second
    assert len(first.places) == 20
    assert first.places[0].fixture_id == "qa-stable-dataset-place-0001"
    assert first.places[0].type == "restaurant"
    assert first.places[1].type == "cafe"
    assert first.places[2].type == "ice_cream"


def test_backend_deterministic_dataset_supports_large_and_feature_fixtures() -> None:
    large = build_dataset("places-1000")
    place_004 = build_dataset("feature-place-004")

    assert len(large.places) == 1000
    assert len(large.lists[0].place_fixture_ids) == 8
    assert len(place_004.places) == 12
    assert {place.type for place in place_004.places} == {"cafe"}
    assert {place.subtype for place in place_004.places} == {"coffee", "tea"}


def test_backend_deterministic_dataset_supports_qa_only_edge_scenarios() -> None:
    malformed = build_dataset("malformed-responses")
    deleted = build_dataset("deleted-places")
    long_arabic = build_dataset("long-arabic-names")

    assert [fixture.fixture_id for fixture in malformed.malformed_responses] == [
        "qa-malformed-responses-malformed-json",
        "qa-malformed-responses-empty-body",
        "qa-malformed-responses-private-field-response",
    ]
    assert {place.visibility_state for place in deleted.places} == {"deleted"}
    assert "مطعم الاختبار الطويل" in long_arabic.places[0].name
    assert not can_seed_via_api("deleted-places")
    assert not can_seed_via_api("duplicate-names")
    assert can_seed_via_api("places-20")
