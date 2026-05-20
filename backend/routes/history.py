from fastapi import APIRouter, HTTPException

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
