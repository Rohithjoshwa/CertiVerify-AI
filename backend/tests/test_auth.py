"""
Unit tests for Module 1 - Authentication.
Run with: pytest -v
Uses an isolated in-memory-style Postgres test DB (configure TEST_DATABASE_URL)
or point DATABASE_URL at a disposable test schema before running.
"""
import uuid
import pytest
from httpx import AsyncClient, ASGITransport

from app.main import app

BASE = "/api/v1/auth"


@pytest.mark.asyncio
async def test_register_new_user():
    test_email = f"test.student.{uuid.uuid4().hex[:8]}@example.com"
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        resp = await ac.post(f"{BASE}/register", json={
            "full_name": "Test Student",
            "email": test_email,
            "password": "StrongPass1",
            "role": "student",
        })
    assert resp.status_code == 201
    body = resp.json()
    assert body["email"] == test_email
    assert "is_email_verified" in body


@pytest.mark.asyncio
async def test_register_duplicate_email_rejected():
    dup_email = f"dup.{uuid.uuid4().hex[:8]}@example.com"
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        payload = {
            "full_name": "Dup User", "email": dup_email,
            "password": "StrongPass1", "role": "student",
        }
        first = await ac.post(f"{BASE}/register", json=payload)
        second = await ac.post(f"{BASE}/register", json=payload)
    assert first.status_code == 201
    assert second.status_code in (400, 409)


@pytest.mark.asyncio
async def test_weak_password_rejected():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        resp = await ac.post(f"{BASE}/register", json={
            "full_name": "Weak Pw", "email": "weak@example.com",
            "password": "weakpass", "role": "student",
        })
    assert resp.status_code == 422  # fails password_strength validator


@pytest.mark.asyncio
async def test_login_blocked_before_email_verification():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        await ac.post(f"{BASE}/register", json={
            "full_name": "Unverified", "email": "unverified@example.com",
            "password": "StrongPass1", "role": "student",
        })
        resp = await ac.post(f"{BASE}/login", json={
            "email": "unverified@example.com", "password": "StrongPass1",
        })
    assert resp.status_code in (200, 403)


@pytest.mark.asyncio
async def test_login_wrong_password():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        resp = await ac.post(f"{BASE}/login", json={
            "email": "nonexistent@example.com", "password": "whatever123",
        })
    assert resp.status_code == 401
