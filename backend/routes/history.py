from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse

from models.scan import ScanResult
from store import history_store

router = APIRouter(prefix="/history", tags=["history"])


@router.get("")
async def list_history() -> list[dict]:
    return history_store.list_all()


@router.get("/{scan_id}", response_model=ScanResult)
async def get_history_scan(scan_id: str) -> ScanResult:
    result = history_store.get(scan_id)
    if not result:
        raise HTTPException(status_code=404, detail="Scan not found in history")
    return result


@router.get("/{scan_id}/export")
async def export_scan(scan_id: str) -> JSONResponse:
    result = history_store.get(scan_id)
    if not result:
        raise HTTPException(status_code=404, detail="Scan not found in history")

    export = {
        "scan_id": result.scan_id,
        "target": result.target,
        "command": result.command,
        "status": result.status.value,
        "started_at": result.started_at.isoformat(),
        "finished_at": result.finished_at.isoformat() if result.finished_at else None,
        "hosts": [h.model_dump() for h in result.hosts],
    }

    return JSONResponse(
        content=export,
        headers={
            "Content-Disposition": f'attachment; filename="nmap-vis-{result.target}-{result.scan_id[:8]}.json"'
        },
    )
