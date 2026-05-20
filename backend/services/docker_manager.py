from collections.abc import AsyncIterator

import aiodocker

from config import settings
from logger import get_logger

log = get_logger("docker")


class DockerManager:
    def __init__(self):
        self._docker: aiodocker.Docker | None = None

    async def connect(self) -> None:
        self._docker = aiodocker.Docker()
        log.info(f"Connected to Docker, nmap image: {settings.nmap_image}")

    async def disconnect(self) -> None:
        if self._docker:
            await self._docker.close()
            log.info("Docker connection closed")

    async def run_nmap(self, command: str) -> AsyncIterator[str]:
        docker = self._require_connection()
        args = command.split()[1:]
        log.info(f"Running container: nmap {' '.join(args)}")

        container = await self._create_container(docker, args)

        try:
            await container.start()
            log.debug(f"Container started for: {command}")
            async for line in self._stream_logs(container):
                yield line
        finally:
            await self._cleanup(container)

    async def is_image_available(self) -> bool:
        docker = self._require_connection()
        try:
            await docker.images.inspect(settings.nmap_image)
            return True
        except aiodocker.exceptions.DockerError:
            log.warning(f"Image not found: {settings.nmap_image}")
            return False

    def _require_connection(self) -> aiodocker.Docker:
        if not self._docker:
            raise RuntimeError("DockerManager not connected. Call connect() first.")
        return self._docker

    async def _create_container(
        self, docker: aiodocker.Docker, args: list[str]
    ) -> aiodocker.docker.DockerContainer:
        config = {
            "Image": settings.nmap_image,
            "Cmd": args,
            "HostConfig": {
                "NetworkMode": "host",
                "AutoRemove": False,
            },
        }
        return await docker.containers.create_or_replace(
            name=f"nmap-scan-{id(args)}", config=config
        )

    async def _stream_logs(
        self, container: aiodocker.docker.DockerContainer
    ) -> AsyncIterator[str]:
        log_stream = container.log(stdout=True, stderr=True, follow=True)
        async for line in log_stream:
            stripped = line.strip()
            if stripped:
                yield stripped

    async def _cleanup(self, container: aiodocker.docker.DockerContainer) -> None:
        try:
            await container.stop()
        except aiodocker.exceptions.DockerError:
            pass
        try:
            await container.delete(force=True)
        except aiodocker.exceptions.DockerError:
            pass
        log.debug("Container cleaned up")


docker_manager = DockerManager()
