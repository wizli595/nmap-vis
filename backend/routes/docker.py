import asyncio
import subprocess
from pathlib import Path

from fastapi import APIRouter

from logger import get_logger
from services.docker_manager import docker_manager

log = get_logger("docker_route")

router = APIRouter(prefix="/docker", tags=["docker"])

DOCKERFILE_PATH = Path(__file__).parent.parent.parent / "docker" / "Dockerfile.nmap"
DOCKER_CONTEXT = DOCKERFILE_PATH.parent


@router.get("/status")
async def docker_status() -> dict:
    image_ready = docker_manager._check_image()
    return {"image_ready": image_ready}


@router.post("/build")
async def build_image() -> dict:
    log.info("Building nmap Docker image...")

    result = await asyncio.to_thread(_build_image)
    return result


def _build_image() -> dict:
    try:
        process = subprocess.run(
            [
                "docker", "build",
                "-t", "nmap-vis-nmap",
                "-f", str(DOCKERFILE_PATH),
                str(DOCKER_CONTEXT),
            ],
            capture_output=True,
            text=True,
            timeout=600,
        )

        if process.returncode == 0:
            log.info("Docker image built successfully")
            return {"success": True, "message": "Image built successfully"}

        log.error(f"Build failed: {process.stderr}")
        return {"success": False, "message": process.stderr.strip()}

    except subprocess.TimeoutExpired:
        return {"success": False, "message": "Build timed out after 10 minutes"}
    except FileNotFoundError:
        return {"success": False, "message": "Docker not found. Is Docker Desktop running?"}
