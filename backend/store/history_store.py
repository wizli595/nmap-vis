import json
import sqlite3
from datetime import datetime
from pathlib import Path

from logger import get_logger
from models.scan import Host, ScanResult, ScanStatus

log = get_logger("history")

DB_PATH = Path(__file__).parent.parent / "data" / "history.db"


def init_db() -> None:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = _connect()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS scans (
            scan_id TEXT PRIMARY KEY,
            target TEXT NOT NULL,
            command TEXT NOT NULL,
            status TEXT NOT NULL,
            hosts_json TEXT NOT NULL DEFAULT '[]',
            raw_output TEXT NOT NULL DEFAULT '',
            started_at TEXT NOT NULL,
            finished_at TEXT
        )
    """)
    conn.commit()
    conn.close()
    log.info(f"History DB initialized at {DB_PATH}")


def save(scan: ScanResult) -> None:
    conn = _connect()
    hosts_json = json.dumps([h.model_dump() for h in scan.hosts])
    conn.execute(
        """INSERT OR REPLACE INTO scans
           (scan_id, target, command, status, hosts_json, raw_output, started_at, finished_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
        (
            scan.scan_id,
            scan.target,
            scan.command,
            scan.status.value,
            hosts_json,
            scan.raw_output,
            scan.started_at.isoformat(),
            scan.finished_at.isoformat() if scan.finished_at else None,
        ),
    )
    conn.commit()
    conn.close()
    log.info(f"Saved scan {scan.scan_id} to history")


def list_all() -> list[dict]:
    conn = _connect()
    rows = conn.execute(
        """SELECT scan_id, target, command, status, hosts_json, started_at, finished_at
           FROM scans ORDER BY started_at DESC LIMIT 100"""
    ).fetchall()
    conn.close()

    return [_row_to_summary(row) for row in rows]


def get(scan_id: str) -> ScanResult | None:
    conn = _connect()
    row = conn.execute(
        "SELECT * FROM scans WHERE scan_id = ?", (scan_id,)
    ).fetchone()
    conn.close()

    if not row:
        return None

    return _row_to_scan(row)


def _connect() -> sqlite3.Connection:
    return sqlite3.connect(str(DB_PATH))


def _row_to_summary(row: tuple) -> dict:
    hosts = json.loads(row[4])
    host_count = len(hosts)
    port_count = sum(len(h.get("ports", [])) for h in hosts)

    return {
        "scan_id": row[0],
        "target": row[1],
        "command": row[2],
        "status": row[3],
        "host_count": host_count,
        "port_count": port_count,
        "started_at": row[5],
        "finished_at": row[6],
    }


def _row_to_scan(row: tuple) -> ScanResult:
    hosts_data = json.loads(row[4])
    hosts = [Host.model_validate(h) for h in hosts_data]

    return ScanResult(
        scan_id=row[0],
        target=row[1],
        command=row[2],
        status=ScanStatus(row[3]),
        hosts=hosts,
        raw_output=row[5],
        started_at=datetime.fromisoformat(row[6]),
        finished_at=datetime.fromisoformat(row[7]) if row[7] else None,
    )
