from pathlib import Path

import pytest

from scripts import start_e2e_api


def sqlite_url(path: Path) -> str:
    return f"sqlite+aiosqlite:///{path.as_posix()}"


def test_defaults_to_disposable_sqlite_file(
    monkeypatch: pytest.MonkeyPatch, tmp_path: Path
) -> None:
    e2e_dir = tmp_path / ".e2e"
    monkeypatch.setattr(start_e2e_api, "BACKEND_ROOT", tmp_path)
    monkeypatch.setattr(start_e2e_api, "E2E_DIR", e2e_dir)

    resolved = start_e2e_api.resolve_e2e_database_url({})

    assert resolved == sqlite_url(e2e_dir / "api.db")


def test_accepts_local_postgresql_test_database() -> None:
    resolved = start_e2e_api.resolve_e2e_database_url(
        {"E2E_DATABASE_URL": "postgresql+asyncpg://user:pass@localhost:5432/restaurant_test"}
    )

    assert resolved == "postgresql+asyncpg://user:pass@localhost:5432/restaurant_test"


def test_generic_database_url_is_ignored(monkeypatch: pytest.MonkeyPatch, tmp_path: Path) -> None:
    e2e_dir = tmp_path / ".e2e"
    monkeypatch.setattr(start_e2e_api, "BACKEND_ROOT", tmp_path)
    monkeypatch.setattr(start_e2e_api, "E2E_DIR", e2e_dir)

    resolved = start_e2e_api.resolve_e2e_database_url(
        {"DATABASE_URL": "postgresql+asyncpg://user:pass@localhost:5432/production"}
    )

    assert resolved == sqlite_url(e2e_dir / "api.db")


@pytest.mark.parametrize(
    ("url", "message"),
    [
        (
            "postgresql+asyncpg://user:pass@localhost:5432/restaurant",
            "database name",
        ),
        (
            "postgresql+asyncpg://user:pass@db.example.test:5432/restaurant_test",
            "host",
        ),
        ("mysql+aiomysql://user:pass@localhost:3306/restaurant_test", "unsupported dialect"),
        ("sqlite+aiosqlite:///:memory:", "in-memory"),
    ],
)
def test_rejects_unsafe_database_urls(url: str, message: str) -> None:
    with pytest.raises(ValueError, match=message):
        start_e2e_api.resolve_e2e_database_url({"E2E_DATABASE_URL": url})


def test_rejects_sqlite_path_outside_e2e_directory(tmp_path: Path) -> None:
    with pytest.raises(ValueError, match="inside"):
        start_e2e_api.resolve_e2e_database_url(
            {"E2E_DATABASE_URL": sqlite_url(tmp_path / "outside.db")}
        )
