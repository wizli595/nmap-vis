import asyncio
from datetime import datetime
from uuid import uuid4

from logger import get_logger
from models.scan import ScanRequest, ScanResult, ScanStatus
from services.command_builder import CommandBuilder
from services.docker_manager import docker_manager
from services.parser import parse_nmap_xml

log = get_logger("scanner")

ACTIVE_SCANS: dict[str, ScanResult] = {}


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
    ACTIVE_SCANS[scan_id] = result

    asyncio.create_task(_execute_scan(scan_id, command))
    return result


def get_scan(scan_id: str) -> ScanResult | None:
    return ACTIVE_SCANS.get(scan_id)


def list_scans() -> list[ScanResult]:
    return list(ACTIVE_SCANS.values())


async def _execute_scan(scan_id: str, command: str) -> None:
    scan = ACTIVE_SCANS[scan_id]
    xml_buffer = []

    try:
        async for line in docker_manager.run_nmap(command):
            scan.raw_output += line + "\n"
            xml_buffer.append(line)

        xml_content = "\n".join(xml_buffer)
        scan.hosts = parse_nmap_xml(xml_content)
        scan.status = ScanStatus.COMPLETED

        host_count = len(scan.hosts)
        port_count = sum(len(h.ports) for h in scan.hosts)
        log.info(f"Scan {scan_id} completed: {host_count} hosts, {port_count} ports")

    except Exception as err:
        scan.status = ScanStatus.FAILED
        scan.raw_output += f"\nError: {err}"
        log.error(f"Scan {scan_id} failed: {err}")

    finally:
        scan.finished_at = datetime.now()
