"""
Test Suite: Duplicate Detection Across Documents
Tests exact duplicate detection vs historical documents:
1. Unique document -> returns UNIQUE (is_duplicate=False, type=NO_DUPLICATE)
2. Exact historical duplicate -> returns DUPLICATE (is_duplicate=True, type=EXACT_FILE_DUPLICATE, matches historical cert_id)
3. Different document -> returns UNIQUE or SIMILAR (compared against stored DB records)
"""
import pytest
import io
import json
import hashlib
from PIL import Image, ImageDraw
from fastapi.testclient import TestClient
from app.main import app

@pytest.fixture
def client():
    return TestClient(app)

def create_sample_doc(text: str = "Unique Document 1") -> bytes:
    """Helper to generate distinct image document bytes with text and visual graphics."""
    doc_img = Image.new("RGB", (800, 1000), color="white")
    draw = ImageDraw.Draw(doc_img)
    draw.text((100, 100), f"CERTIFICATE DOCUMENT: {text}", fill="black")
    
    # Render unique graphic shapes based on text hash to ensure distinct dHash
    h = int(hashlib.sha256(text.encode()).hexdigest()[:8], 16)
    x1 = 50 + (h % 200)
    y1 = 200 + ((h >> 4) % 200)
    x2 = x1 + 300
    y2 = y1 + 300
    draw.rectangle([x1, y1, x2, y2], fill=((h >> 8) % 255, (h >> 16) % 255, (h >> 24) % 255))

    buf = io.BytesIO()
    doc_img.save(buf, format="PNG")
    return buf.getvalue()

def test_duplicate_detection_flow(client):
    import uuid
    rnd = uuid.uuid4().hex[:8]
    email = f"dup_user_{rnd}@example.com"
    password = "TestPassword123!"
    client.post("/api/v1/auth/register", json={
        "full_name": "Duplicate Test User",
        "email": email,
        "password": password,
        "role": "student"
    })
    login_res = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # ── 1. Upload Unique Document 1 ───────────────────────────────────────────
    doc1_bytes = create_sample_doc("Document 1 Payload Alpha")
    files1 = {"files": ("unique_doc1.png", io.BytesIO(doc1_bytes), "image/png")}
    upload1 = client.post("/api/v1/certificates/upload", files=files1, headers=headers)
    assert upload1.status_code == 201
    cert1_id = upload1.json()["certificates"][0]["id"]

    dup1_res = client.post(f"/api/v1/certificates/{cert1_id}/verify-duplicate", headers=headers)
    assert dup1_res.status_code == 200
    dup1_data = dup1_res.json()

    # Verify Document 1 is UNIQUE and NOT a duplicate of itself
    assert dup1_data["certificate_id"] == cert1_id
    assert dup1_data["is_duplicate"] is False
    assert dup1_data["duplicate_of_certificate_id"] is None
    detail1 = dup1_data["duplicate_detail"]
    assert detail1["duplicate_status"] == "NO_DUPLICATE"
    assert detail1["duplicate_type"] == "NO_DUPLICATE"

    # ── 2. Upload Exact Historical Duplicate of Document 1 ───────────────────
    files2 = {"files": ("exact_duplicate_doc.png", io.BytesIO(doc1_bytes), "image/png")}
    upload2 = client.post("/api/v1/certificates/upload", files=files2, headers=headers)
    assert upload2.status_code == 201
    cert2_id = upload2.json()["certificates"][0]["id"]
    assert cert2_id != cert1_id

    dup2_res = client.post(f"/api/v1/certificates/{cert2_id}/verify-duplicate", headers=headers)
    assert dup2_res.status_code == 200
    dup2_data = dup2_res.json()

    # Verify Document 2 is detected as an EXACT HISTORICAL DUPLICATE of Document 1
    assert dup2_data["certificate_id"] == cert2_id
    assert dup2_data["is_duplicate"] is True
    assert dup2_data["duplicate_of_certificate_id"] == cert1_id
    detail2 = dup2_data["duplicate_detail"]
    assert detail2["duplicate_type"] == "EXACT_FILE_DUPLICATE"
    assert detail2["file_hash_match"] is True
    assert detail2["matched_certificate_id"] == cert1_id

    # ── 3. Upload Different Document 3 ─────────────────────────────────────────
    doc3_bytes = create_sample_doc("Document 3 Completely Different Beta Spectrum")
    files3 = {"files": ("different_doc3.png", io.BytesIO(doc3_bytes), "image/png")}
    upload3 = client.post("/api/v1/certificates/upload", files=files3, headers=headers)
    assert upload3.status_code == 201
    cert3_id = upload3.json()["certificates"][0]["id"]
    assert cert3_id not in (cert1_id, cert2_id)

    dup3_res = client.post(f"/api/v1/certificates/{cert3_id}/verify-duplicate", headers=headers)
    assert dup3_res.status_code == 200
    dup3_data = dup3_res.json()

    # Verify Document 3 is evaluated against stored records and is NOT an exact duplicate of Document 1 or 2
    assert dup3_data["certificate_id"] == cert3_id
    detail3 = dup3_data["duplicate_detail"]
    assert detail3["duplicate_type"] != "EXACT_FILE_DUPLICATE"
    assert dup3_data["duplicate_of_certificate_id"] != cert3_id  # never duplicate of itself
