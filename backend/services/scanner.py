import asyncio
import re
from uuid import uuid4

from logger import get_logger
from models.scan import Host, Port, PortState, ScanRequest, ScanResult, ScanStatus
from services.command_builder import CommandBuilder
from services.docker_manager import docker_manager
from services.parser import parse_nmap_xml
from store import scan_store

log = get_logger("scanner")

XML_START = "__XML_START__"
XML_END = "__XML_END__"

DISCOVERED_PORT_RE = re.compile(
    r"Discovered open port (\d+)/(tcp|udp) on ([\d.]+)"
)


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
    xml_content = ""
    reading_xml = False
    xml_lines: list[str] = []
    live_hosts: dict[str, Host] = {}

    try:
        async for line in docker_manager.run_nmap(command):
            if line.startswith(XML_START):
                reading_xml = True
                continue
            if line.startswith(XML_END):
                reading_xml = False
                xml_content = "\n".join(xml_lines)
                continue
            if reading_xml:
                xml_lines.append(line)
                continue

            await scan_store.append_output(scan_id, line)
            await _detect_live_host(scan_id, line, live_hosts)

        hosts = parse_nmap_xml(xml_content) if xml_content else []
        await scan_store.mark_completed(scan_id, hosts)

    except Exception as err:
        await scan_store.mark_failed(scan_id, str(err))
        log.error(f"Scan {scan_id} failed: {err}")


async def _detect_live_host(
    scan_id: str, line: str, live_hosts: dict[str, Host]
) -> None:
    match = DISCOVERED_PORT_RE.search(line)
    if not match:
        return

    port_num = int(match.group(1))
    protocol = match.group(2)
    ip = match.group(3)

    port = Port(number=port_num, protocol=protocol, state=PortState.OPEN)

    if ip in live_hosts:
        host = live_hosts[ip]
        if not any(p.number == port_num for p in host.ports):
            host.ports.append(port)
    else:
        host = Host(ip=ip, status="up", ports=[port])
        live_hosts[ip] = host

    await scan_store.add_host(scan_id, host)
