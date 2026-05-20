import json

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from logger import get_logger
from store import scan_store
from store.event_bus import event_bus

log = get_logger("stream")

router = APIRouter(tags=["stream"])


@router.websocket("/scan/{scan_id}/stream")
async def stream_scan(websocket: WebSocket, scan_id: str):
    snapshot = scan_store.snapshot(scan_id)
    if not snapshot:
        await websocket.close(code=4004, reason="Scan not found")
        return

    await websocket.accept()
    log.info(f"WebSocket connected: {scan_id}")

    await _send_json(websocket, snapshot)

    if snapshot["scan"]["status"] in ("completed", "failed"):
        await websocket.close()
        return

    await _stream_deltas(websocket, scan_id)


async def _stream_deltas(websocket: WebSocket, scan_id: str) -> None:
    queue = event_bus.subscribe(scan_id)

    try:
        while True:
            message = await queue.get()
            if message is None:
                break
            await _send_json(websocket, message)
    except WebSocketDisconnect:
        log.info(f"WebSocket disconnected: {scan_id}")
    finally:
        event_bus.unsubscribe(scan_id, queue)
        try:
            await websocket.close()
        except RuntimeError:
            pass


async def _send_json(websocket: WebSocket, data: dict) -> None:
    await websocket.send_text(json.dumps(data, default=str))
