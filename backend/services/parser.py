from xml.etree import ElementTree

from models.scan import Host, Port, PortState


def parse_nmap_xml(xml_content: str) -> list[Host]:
    root = ElementTree.fromstring(xml_content)
    return [_parse_host(host_el) for host_el in root.findall("host")]


def _parse_host(element: ElementTree.Element) -> Host:
    return Host(
        ip=_extract_ip(element),
        hostname=_extract_hostname(element),
        status=_extract_status(element),
        ports=_extract_ports(element),
        os=_extract_os(element),
    )


def _extract_ip(element: ElementTree.Element) -> str:
    addr = element.find("address[@addrtype='ipv4']")
    if addr is None:
        addr = element.find("address[@addrtype='ipv6']")
    return addr.get("addr", "") if addr is not None else ""


def _extract_hostname(element: ElementTree.Element) -> str:
    hostname = element.find("hostnames/hostname")
    return hostname.get("name", "") if hostname is not None else ""


def _extract_status(element: ElementTree.Element) -> str:
    status = element.find("status")
    return status.get("state", "unknown") if status is not None else "unknown"


def _extract_ports(element: ElementTree.Element) -> list[Port]:
    ports_el = element.find("ports")
    if ports_el is None:
        return []
    return [_parse_port(port_el) for port_el in ports_el.findall("port")]


def _parse_port(element: ElementTree.Element) -> Port:
    state_el = element.find("state")
    service_el = element.find("service")

    return Port(
        number=int(element.get("portid", "0")),
        protocol=element.get("protocol", "tcp"),
        state=_normalize_port_state(state_el),
        service=_attr_or_default(service_el, "name"),
        version=_build_version_string(service_el),
    )


def _normalize_port_state(state_el: ElementTree.Element | None) -> PortState:
    if state_el is None:
        return PortState.FILTERED
    raw = state_el.get("state", "filtered")
    try:
        return PortState(raw)
    except ValueError:
        return PortState.FILTERED


def _extract_os(element: ElementTree.Element) -> str:
    os_match = element.find("os/osmatch")
    return os_match.get("name", "") if os_match is not None else ""


def _attr_or_default(
    element: ElementTree.Element | None, attr: str, default: str = ""
) -> str:
    if element is None:
        return default
    return element.get(attr, default)


def _build_version_string(service_el: ElementTree.Element | None) -> str:
    if service_el is None:
        return ""
    product = service_el.get("product", "")
    version = service_el.get("version", "")
    if product and version:
        return f"{product} {version}"
    return product or version
