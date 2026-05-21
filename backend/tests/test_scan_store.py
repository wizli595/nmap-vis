
import pytest

from models.scan import Host, Port, PortState, ScanResult, ScanStatus
from store import history_store, scan_store
from store.event_bus import event_bus


@pytest.fixture(autouse=True)
def clean_store():
    history_store.init_db()
    scan_store._scans.clear()
    yield
    scan_store._scans.clear()


def _make_scan(scan_id: str = "test-1") -> ScanResult:
    return ScanResult(
        scan_id=scan_id,
        status=ScanStatus.RUNNING,
        command="nmap -sS -T3 -oX - 10.0.0.1",
        target="10.0.0.1",
    )


class TestCreateAndGet:
    def test_create_and_get(self):
        scan = _make_scan()
        scan_store.create(scan)
        assert scan_store.get("test-1") is scan

    def test_get_missing_returns_none(self):
        assert scan_store.get("nope") is None

    def test_list_all(self):
        scan_store.create(_make_scan("a"))
        scan_store.create(_make_scan("b"))
        assert len(scan_store.list_all()) == 2


class TestAppendOutput:
    @pytest.mark.anyio
    async def test_appends_to_raw_output(self):
        scan = _make_scan()
        scan_store.create(scan)
        await scan_store.append_output("test-1", "Starting scan...")
        assert "Starting scan..." in scan.raw_output

    @pytest.mark.anyio
    async def test_publishes_output_event(self):
        scan = _make_scan()
        scan_store.create(scan)
        queue = event_bus.subscribe("test-1")
        await scan_store.append_output("test-1", "line 1")
        msg = await queue.get()
        assert msg["type"] == "output"
        assert msg["line"] == "line 1"
        event_bus.unsubscribe("test-1", queue)


class TestHostDiscovery:
    @pytest.mark.anyio
    async def test_adds_host(self):
        scan = _make_scan()
        scan_store.create(scan)
        host = Host(ip="10.0.0.1", status="up", ports=[
            Port(number=80, state=PortState.OPEN, service="http"),
        ])
        await scan_store.add_host("test-1", host)
        assert len(scan.hosts) == 1
        assert scan.hosts[0].ip == "10.0.0.1"

    @pytest.mark.anyio
    async def test_publishes_host_event(self):
        scan = _make_scan()
        scan_store.create(scan)
        queue = event_bus.subscribe("test-1")
        host = Host(ip="10.0.0.2", status="up")
        await scan_store.add_host("test-1", host)
        msg = await queue.get()
        assert msg["type"] == "host_discovered"
        assert msg["host"]["ip"] == "10.0.0.2"
        event_bus.unsubscribe("test-1", queue)


class TestCompletion:
    @pytest.mark.anyio
    async def test_mark_completed(self):
        scan = _make_scan()
        scan_store.create(scan)
        hosts = [Host(ip="10.0.0.1", status="up")]
        await scan_store.mark_completed("test-1", hosts)
        assert scan.status == ScanStatus.COMPLETED
        assert scan.finished_at is not None
        assert len(scan.hosts) == 1

    @pytest.mark.anyio
    async def test_mark_failed(self):
        scan = _make_scan()
        scan_store.create(scan)
        await scan_store.mark_failed("test-1", "timeout")
        assert scan.status == ScanStatus.FAILED
        assert "timeout" in scan.raw_output


class TestSnapshot:
    def test_snapshot_returns_scan_data(self):
        scan = _make_scan()
        scan_store.create(scan)
        snap = scan_store.snapshot("test-1")
        assert snap["type"] == "snapshot"
        assert snap["scan"]["scan_id"] == "test-1"

    def test_snapshot_missing_returns_none(self):
        assert scan_store.snapshot("nope") is None
