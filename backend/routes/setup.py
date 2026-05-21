import asyncio
import platform
import shutil
import subprocess
from pathlib import Path

from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from logger import get_logger

log = get_logger("setup")

router = APIRouter(prefix="/setup", tags=["setup"])

DOCKERFILE_PATH = Path(__file__).parent.parent.parent / "docker" / "Dockerfile.nmap"
DOCKER_CONTEXT = DOCKERFILE_PATH.parent


@router.get("/status")
async def setup_status() -> dict:
    nmap_local = _check_local_nmap()
    docker_ready = _check_docker_image()
    docker_installed = _check_docker_installed()
    os_info = _detect_os()

    return {
        "nmap_local": nmap_local,
        "docker_ready": docker_ready,
        "docker_installed": docker_installed,
        "os": os_info,
    }


@router.get("/nmap-check")
async def nmap_check() -> dict:
    nmap_path = shutil.which("nmap")
    os_info = _detect_os()

    if nmap_path:
        version = _get_nmap_version()
        return {"installed": True, "path": nmap_path, "version": version, "os": os_info}

    return {"installed": False, "os": os_info, "install_instructions": _install_instructions(os_info)}


@router.post("/docker-build")
async def docker_build():
    return StreamingResponse(
        _stream_docker_build(),
        media_type="text/plain",
    )


async def _stream_docker_build():
    process = await asyncio.create_subprocess_exec(
        "docker", "build",
        "-t", "nmap-vis-nmap",
        "-f", str(DOCKERFILE_PATH),
        str(DOCKER_CONTEXT),
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.STDOUT,
    )

    async for line in process.stdout:
        decoded = line.decode().strip()
        if decoded:
            yield decoded + "\n"

    await process.wait()

    if process.returncode == 0:
        yield "__BUILD_SUCCESS__\n"
    else:
        yield "__BUILD_FAILED__\n"


def _check_local_nmap() -> bool:
    return shutil.which("nmap") is not None


def _check_docker_image() -> bool:
    try:
        result = subprocess.run(
            ["docker", "image", "inspect", "nmap-vis-nmap"],
            capture_output=True, timeout=5,
        )
        return result.returncode == 0
    except (subprocess.TimeoutExpired, FileNotFoundError):
        return False


def _check_docker_installed() -> bool:
    try:
        result = subprocess.run(
            ["docker", "--version"],
            capture_output=True, timeout=5,
        )
        return result.returncode == 0
    except (subprocess.TimeoutExpired, FileNotFoundError):
        return False


def _detect_os() -> dict:
    system = platform.system().lower()
    return {
        "system": system,
        "release": platform.release(),
        "machine": platform.machine(),
    }


def _get_nmap_version() -> str:
    try:
        result = subprocess.run(
            ["nmap", "--version"], capture_output=True, text=True, timeout=5
        )
        first_line = result.stdout.strip().split("\n")[0]
        return first_line
    except (subprocess.TimeoutExpired, FileNotFoundError):
        return "unknown"


def _install_instructions(os_info: dict) -> dict:
    system = os_info["system"]

    if system == "windows":
        return {
            "method": "winget",
            "command": "winget install nmap",
            "alt_method": "Download from https://nmap.org/download.html",
        }
    if system == "darwin":
        return {
            "method": "brew",
            "command": "brew install nmap",
        }
    if system == "linux":
        return {
            "method": "apt/yum",
            "command": "sudo apt install nmap  # Debian/Ubuntu\nsudo yum install nmap  # RHEL/CentOS",
        }
    return {
        "method": "manual",
        "command": "Visit https://nmap.org/download.html",
    }
