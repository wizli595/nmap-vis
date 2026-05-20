from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from logger import get_logger
from middleware import RequestLogMiddleware
from routes.health import router as health_router
from routes.scan import router as scan_router
from routes.stream import router as stream_router
from services.docker_manager import docker_manager

log = get_logger("app")


@asynccontextmanager
async def lifespan(app: FastAPI):
    log.info("Starting nmap-vis backend")
    await docker_manager.connect()
    log.info("Docker connection established")
    yield
    await docker_manager.disconnect()
    log.info("Shutdown complete")


app = FastAPI(title="nmap-vis", version="0.1.0", lifespan=lifespan)

app.add_middleware(RequestLogMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(scan_router)
app.include_router(stream_router)
