import asyncio
import subprocess
import threading
from collections.abc import AsyncIterator
from queue import Queue, Empty

from config import settings
from logger import get_logger

log = get_logger("docker")

SENTINEL = None


class DockerManager:
    async def connect(self) -> None:
        available = self._check_image()
        if available:
            log.info(f"Docker ready, nmap image: {settings.nmap_image}")
        else:
            log.warning(f"Image not found: {settings.nmap_image}. Run: make docker-build")

    async def disconnect(self) -> None:
        log.info("Docker manager shutdown")

    async def run_nmap(self, command: str) -> AsyncIterator[str]:
        args = command.split()[1:]
        docker_cmd = [
            "docker", "run", "--rm", "--privileged",
            settings.nmap_image, *args,
        ]
        log.info(f"Running: {' '.join(docker_cmd)}")

        line_queue: Queue[str | None] = Queue()
        thread = threading.Thread(
            target=_run_and_stream, args=(docker_cmd, line_queue), daemon=True
        )
        thread.start()

        while True:
            line = await asyncio.to_thread(_get_line, line_queue)
            if line is SENTINEL:
                break
            yield line

        thread.join(timeout=5)
        log.info("Container finished")

    def _check_image(self) -> bool:
        try:
            result = subprocess.run(
                ["docker", "image", "inspect", settings.nmap_image],
                capture_output=True, timeout=5,
            )
            return result.returncode == 0
        except (subprocess.TimeoutExpired, FileNotFoundError):
            return False


def _run_and_stream(docker_cmd: list[str], line_queue: Queue) -> None:
    try:
        process = subprocess.Popen(
            docker_cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
        )

        for line in iter(process.stdout.readline, ""):
            stripped = line.strip()
            if stripped:
                line_queue.put(stripped)

        process.wait()

        if process.returncode != 0:
            log.warning(f"Container exited with code {process.returncode}")

    except Exception as err:
        log.error(f"Docker run failed: {err}")
        line_queue.put(f"Error: {err}")
    finally:
        line_queue.put(SENTINEL)


def _get_line(q: Queue) -> str | None:
    return q.get()


docker_manager = DockerManager()
