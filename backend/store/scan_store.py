from datetime import datetime
from typing import Any

from logger import get_logger
from models.scan import ScanResult, ScanStatus, Host
from store.event_bus import event_bus
from store import history_store

log = get_logger("scan_store")

_scans: dict[str, ScanResult] = {}


def create(scan: ScanResult) -> None:
    _scans[scan.scan_id] = scan
    log.info(f"Scan created: {scan.scan_id}")


def get(scan_id: str) -> ScanResult | None:
    return _scans.get(scan_id)


def list_all() -> list[ScanResult]:
    return list(_scans.values())


async def append_output(scan_id: str, line: str) -> None:
    scan = _scans.get(scan_id)
    if not scan:
        return
    scan.raw_output += line + "\n"
    await _publish(scan_id, {"type": "output", "line": line})


async def add_host(scan_id: str, host: Host) -> None:
    scan = _scans.get(scan_id)
    if not scan:
        return

    existing = next((h for h in scan.hosts if h.ip == host.ip), None)
    if existing:
        existing.ports = host.ports
    else:
        scan.hosts.append(host)

    await _publish(scan_id, {
        "type": "host_discovered",
        "host": host.model_dump(),
    })


async def mark_completed(scan_id: str, hosts: list[Host]) -> None:
    scan = _scans.get(scan_id)
    if not scan:
        return
    scan.hosts = hosts
    scan.status = ScanStatus.COMPLETED
    scan.finished_at = datetime.now()
    await _publish(scan_id, {"type": "completed", "host_count": len(hosts)})
    await event_bus.close_channel(scan_id)
    history_store.save(scan)
    log.info(f"Scan {scan_id} completed: {len(hosts)} hosts")


async def mark_failed(scan_id: str, error: str) -> None:
    scan = _scans.get(scan_id)
    if not scan:
        return
    scan.status = ScanStatus.FAILED
    scan.raw_output += f"\nError: {error}"
    scan.finished_at = datetime.now()
    await _publish(scan_id, {"type": "failed", "error": error})
    await event_bus.close_channel(scan_id)
    log.error(f"Scan {scan_id} failed: {error}")


def snapshot(scan_id: str) -> dict[str, Any] | None:
    scan = _scans.get(scan_id)
    if not scan:
        return None
    return {
        "type": "snapshot",
        "scan": scan.model_dump(mode="json"),
    }


async def _publish(scan_id: str, message: dict[str, Any]) -> None:
    await event_bus.publish(scan_id, message)
