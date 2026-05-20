from fastapi import APIRouter, HTTPException

from models.scan import ScanRequest, ScanResult
from services import scanner

router = APIRouter(prefix="/scan", tags=["scan"])


@router.post("", response_model=ScanResult)
async def create_scan(request: ScanRequest) -> ScanResult:
    return await scanner.start_scan(request)


@router.get("", response_model=list[ScanResult])
async def list_scans() -> list[ScanResult]:
    return scanner.list_scans()


@router.get("/{scan_id}", response_model=ScanResult)
async def get_scan(scan_id: str) -> ScanResult:
    result = scanner.get_scan(scan_id)
    if not result:
        raise HTTPException(status_code=404, detail="Scan not found")
    return result
