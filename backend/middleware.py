import time

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from logger import get_logger

log = get_logger("http")


class RequestLogMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        start = time.perf_counter()
        method = request.method
        path = request.url.path

        log.info(f"--> {method} {path}")

        try:
            response = await call_next(request)
        except Exception as exc:
            duration = _elapsed_ms(start)
            log.error(f"<-- {method} {path} 500 ({duration}ms) {exc}")
            raise

        duration = _elapsed_ms(start)
        status = response.status_code
        level = _level_for_status(status)

        log.log(level, f"<-- {method} {path} {status} ({duration}ms)")
        return response


def _elapsed_ms(start: float) -> int:
    return int((time.perf_counter() - start) * 1000)


def _level_for_status(status: int) -> int:
    if status >= 500:
        return 40  # ERROR
    if status >= 400:
        return 30  # WARNING
    return 20  # INFO
