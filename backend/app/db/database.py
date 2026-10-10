"""
Async SQLAlchemy engine/session setup for PostgreSQL with SQLite fallback.
"""
import logging
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base

from app.core.config import settings

logger = logging.getLogger("certiverify.db")

def _create_engine_and_session(db_url: str):
    connect_args = {}
    if db_url.startswith("sqlite"):
        connect_args["check_same_thread"] = False
    eng = create_async_engine(db_url, echo=settings.DEBUG, future=True, connect_args=connect_args)
    sess_factory = async_sessionmaker(bind=eng, expire_on_commit=False, class_=AsyncSession)
    return eng, sess_factory

engine, AsyncSessionLocal = _create_engine_and_session(settings.DATABASE_URL)
Base = declarative_base()

def reinit_engine(db_url: str):
    """Utility function to switch DB engine (e.g. for testing with SQLite)."""
    global engine, AsyncSessionLocal
    engine, AsyncSessionLocal = _create_engine_and_session(db_url)
    return engine, AsyncSessionLocal

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

async def init_db():
    """Create all tables. If PostgreSQL connection fails, fall back to SQLite."""
    global engine, AsyncSessionLocal
    try:
        async with engine.begin() as conn:
            from app.models import models  # noqa: F401 ensures models are registered
            await conn.run_sync(Base.metadata.create_all)
    except Exception as exc:
        if "postgresql" in settings.DATABASE_URL or "postgres" in settings.DATABASE_URL:
            logger.warning("PostgreSQL unreachable (%s). Falling back to SQLite dev database.", exc)
            fallback_url = "sqlite+aiosqlite:///./certiverify_dev.db"
            reinit_engine(fallback_url)
            async with engine.begin() as conn:
                from app.models import models  # noqa: F401
                await conn.run_sync(Base.metadata.create_all)
        else:
            raise exc

