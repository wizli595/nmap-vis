import json
from pathlib import Path

from fastapi import APIRouter

router = APIRouter(prefix="/scripts", tags=["scripts"])

SCRIPTS_PATH = Path(__file__).parent.parent / "data" / "scripts.json"


@router.get("")
async def list_scripts() -> list[dict]:
    with open(SCRIPTS_PATH) as f:
        return json.load(f)
