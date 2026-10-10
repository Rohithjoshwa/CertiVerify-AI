"""
Pytest configuration and global fixtures for backend unit tests.
Configures an isolated SQLite database so tests run fast without requiring local PostgreSQL.
"""
import os
import pytest
import pytest_asyncio

# Force SQLite test DB URL before importing app modules
os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///./test_certiverify.db"

from app.core.config import settings
settings.DATABASE_URL = "sqlite+aiosqlite:///./test_certiverify.db"

from app.db.database import reinit_engine, init_db, engine
from app.models.models import Base


def find_sample_pdf() -> str:
    """Recursively locates sample_certificate.pdf climbing parent directories."""
    curr = os.path.abspath(__file__)
    for _ in range(6):
        curr = os.path.dirname(curr)
        candidate = os.path.join(curr, "sample_certificate.pdf")
        if os.path.exists(candidate):
            return candidate
    if os.path.exists("./sample_certificate.pdf"):
        return os.path.abspath("./sample_certificate.pdf")
    raise FileNotFoundError("sample_certificate.pdf could not be found.")


@pytest_asyncio.fixture(scope="session", autouse=True)
async def setup_test_db():
    reinit_engine("sqlite+aiosqlite:///./test_certiverify.db")
    await init_db()
    yield
    try:
        if os.path.exists("./test_certiverify.db"):
            os.remove("./test_certiverify.db")
    except Exception:
        pass
