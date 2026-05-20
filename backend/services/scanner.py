import asyncio
from uuid import uuid4

from logger import get_logger
from models.scan import ScanRequest, ScanResult, ScanStatus
from services.command_builder import CommandBuilder
from services.docker_manager import docker_manager
from services.parser import parse_nmap_xml
from store import scan_store

log = get_logger("scanner")


def build_command(request: ScanRequest) -> str:
    builder = CommandBuilder().target(request.target)
    builder.scan_type(request.scan_type.value)
    builder.timing(request.timing)

    if request.ports:
        builder.ports(request.ports)

    for flag in request.flags:
        builder.add_flag(flag)

    for script in request.scripts:
        builder.add_script(script)

    return builder.build()


async def start_scan(request: ScanRequest) -> ScanResult:
    command = build_command(request)
    scan_id = str(uuid4())

    log.info(f"Starting scan {scan_id} -> {request.target}")
    log.debug(f"Command: {command}")

    result = ScanResult(
        scan_id=scan_id,
        status=ScanStatus.RUNNING,
        command=command,
        target=request.target,
    )
    scan_store.create(result)

    asyncio.create_task(_execute_scan(scan_id, command))
    return result


def get_scan(scan_id: str) -> ScanResult | None:
    return scan_store.get(scan_id)


def list_scans() -> list[ScanResult]:
    return scan_store.list_all()


async def _execute_scan(scan_id: str, command: str) -> None:
    xml_buffer = []

    try:
        async for line in docker_manager.run_nmap(command):
            await scan_store.append_output(scan_id, line)
            xml_buffer.append(line)

        xml_content = "\n".join(xml_buffer)
        hosts = parse_nmap_xml(xml_content)
        await scan_store.mark_completed(scan_id, hosts)

    except Exception as err:
        await scan_store.mark_failed(scan_id, str(err))
        log.error(f"Scan {scan_id} failed: {err}")
