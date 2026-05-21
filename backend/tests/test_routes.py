from unittest.mock import AsyncMock, patch

import pytest
from httpx import ASGITransport, AsyncClient

from main import app
from models.scan import ScanResult, ScanStatus


@pytest.fixture
def anyio_backend():
    return "asyncio"


@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


class TestHealthRoute:
    @pytest.mark.anyio
    async def test_health_returns_ok(self, client):
        response = await client.get("/health")
        assert response.status_code == 200
        assert response.json() == {"status": "ok"}


class TestScanRoutes:
    @pytest.mark.anyio
    async def test_create_scan_returns_scan_id(self, client):
        mock_result = ScanResult(
            scan_id="test-123",
            status=ScanStatus.RUNNING,
            command="nmap -sS -T3 -oX - 10.0.0.1",
            target="10.0.0.1",
        )

        with patch("routes.scan.scanner.start_scan", new_callable=AsyncMock, return_value=mock_result):
            response = await client.post("/scan", json={
                "target": "10.0.0.1",
                "scan_type": "-sS",
                "flags": [],
                "ports": "",
                "scripts": [],
                "timing": 3,
            })

        assert response.status_code == 200
        data = response.json()
        assert data["scan_id"] == "test-123"
        assert data["status"] == "running"

    @pytest.mark.anyio
    async def test_create_scan_validates_target(self, client):
        response = await client.post("/scan", json={
            "target": "",
            "scan_type": "-sS",
        })
        assert response.status_code == 422

    @pytest.mark.anyio
    async def test_get_scan_not_found(self, client):
        with patch("routes.scan.scanner.get_scan", return_value=None):
            response = await client.get("/scan/nonexistent")
        assert response.status_code == 404

    @pytest.mark.anyio
    async def test_get_scan_returns_result(self, client):
        mock_result = ScanResult(
            scan_id="test-456",
            status=ScanStatus.COMPLETED,
            command="nmap -sS -T3 -oX - 10.0.0.1",
            target="10.0.0.1",
        )

        with patch("routes.scan.scanner.get_scan", return_value=mock_result):
            response = await client.get("/scan/test-456")

        assert response.status_code == 200
        assert response.json()["scan_id"] == "test-456"
        assert response.json()["status"] == "completed"

    @pytest.mark.anyio
    async def test_list_scans_empty(self, client):
        with patch("routes.scan.scanner.list_scans", return_value=[]):
            response = await client.get("/scan")
        assert response.status_code == 200
        assert response.json() == []

    @pytest.mark.anyio
    async def test_list_scans_returns_all(self, client):
        scans = [
            ScanResult(scan_id="a", status=ScanStatus.RUNNING, target="10.0.0.1"),
            ScanResult(scan_id="b", status=ScanStatus.COMPLETED, target="10.0.0.2"),
        ]

        with patch("routes.scan.scanner.list_scans", return_value=scans):
            response = await client.get("/scan")

        assert response.status_code == 200
        assert len(response.json()) == 2
