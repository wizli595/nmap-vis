import pytest

from services.parser import parse_nmap_xml
from models.scan import PortState


SINGLE_HOST_XML = """<?xml version="1.0"?>
<nmaprun>
  <host>
    <status state="up"/>
    <address addr="192.168.1.1" addrtype="ipv4"/>
    <hostnames>
      <hostname name="router.local" type="PTR"/>
    </hostnames>
    <ports>
      <port protocol="tcp" portid="22">
        <state state="open"/>
        <service name="ssh" product="OpenSSH" version="8.9"/>
      </port>
      <port protocol="tcp" portid="80">
        <state state="open"/>
        <service name="http" product="nginx" version="1.18"/>
      </port>
      <port protocol="tcp" portid="443">
        <state state="filtered"/>
        <service name="https"/>
      </port>
    </ports>
    <os>
      <osmatch name="Linux 5.4" accuracy="95"/>
    </os>
  </host>
</nmaprun>"""

MULTIPLE_HOSTS_XML = """<?xml version="1.0"?>
<nmaprun>
  <host>
    <status state="up"/>
    <address addr="10.0.0.1" addrtype="ipv4"/>
    <ports>
      <port protocol="tcp" portid="80">
        <state state="open"/>
        <service name="http"/>
      </port>
    </ports>
  </host>
  <host>
    <status state="up"/>
    <address addr="10.0.0.2" addrtype="ipv4"/>
    <ports>
      <port protocol="tcp" portid="22">
        <state state="open"/>
        <service name="ssh"/>
      </port>
    </ports>
  </host>
  <host>
    <status state="down"/>
    <address addr="10.0.0.3" addrtype="ipv4"/>
  </host>
</nmaprun>"""

MINIMAL_XML = """<?xml version="1.0"?>
<nmaprun>
  <host>
    <status state="up"/>
    <address addr="10.0.0.1" addrtype="ipv4"/>
  </host>
</nmaprun>"""

IPV6_XML = """<?xml version="1.0"?>
<nmaprun>
  <host>
    <status state="up"/>
    <address addr="fe80::1" addrtype="ipv6"/>
  </host>
</nmaprun>"""

EMPTY_XML = """<?xml version="1.0"?>
<nmaprun></nmaprun>"""


class TestSingleHost:
    def test_parses_ip(self):
        hosts = parse_nmap_xml(SINGLE_HOST_XML)
        assert hosts[0].ip == "192.168.1.1"

    def test_parses_hostname(self):
        hosts = parse_nmap_xml(SINGLE_HOST_XML)
        assert hosts[0].hostname == "router.local"

    def test_parses_status(self):
        hosts = parse_nmap_xml(SINGLE_HOST_XML)
        assert hosts[0].status == "up"

    def test_parses_os(self):
        hosts = parse_nmap_xml(SINGLE_HOST_XML)
        assert hosts[0].os == "Linux 5.4"

    def test_parses_port_count(self):
        hosts = parse_nmap_xml(SINGLE_HOST_XML)
        assert len(hosts[0].ports) == 3

    def test_parses_open_port(self):
        hosts = parse_nmap_xml(SINGLE_HOST_XML)
        ssh = hosts[0].ports[0]
        assert ssh.number == 22
        assert ssh.protocol == "tcp"
        assert ssh.state == PortState.OPEN
        assert ssh.service == "ssh"

    def test_parses_version(self):
        hosts = parse_nmap_xml(SINGLE_HOST_XML)
        ssh = hosts[0].ports[0]
        assert ssh.version == "OpenSSH 8.9"

    def test_parses_filtered_port(self):
        hosts = parse_nmap_xml(SINGLE_HOST_XML)
        https = hosts[0].ports[2]
        assert https.state == PortState.FILTERED


class TestMultipleHosts:
    def test_parses_all_hosts(self):
        hosts = parse_nmap_xml(MULTIPLE_HOSTS_XML)
        assert len(hosts) == 3

    def test_each_host_has_correct_ip(self):
        hosts = parse_nmap_xml(MULTIPLE_HOSTS_XML)
        ips = [h.ip for h in hosts]
        assert ips == ["10.0.0.1", "10.0.0.2", "10.0.0.3"]

    def test_down_host_has_no_ports(self):
        hosts = parse_nmap_xml(MULTIPLE_HOSTS_XML)
        assert hosts[2].status == "down"
        assert len(hosts[2].ports) == 0


class TestEdgeCases:
    def test_empty_scan(self):
        hosts = parse_nmap_xml(EMPTY_XML)
        assert hosts == []

    def test_host_without_ports(self):
        hosts = parse_nmap_xml(MINIMAL_XML)
        assert hosts[0].ip == "10.0.0.1"
        assert hosts[0].ports == []

    def test_host_without_hostname(self):
        hosts = parse_nmap_xml(MINIMAL_XML)
        assert hosts[0].hostname == ""

    def test_host_without_os(self):
        hosts = parse_nmap_xml(MINIMAL_XML)
        assert hosts[0].os == ""

    def test_ipv6_address(self):
        hosts = parse_nmap_xml(IPV6_XML)
        assert hosts[0].ip == "fe80::1"

    def test_malformed_xml_raises(self):
        with pytest.raises(Exception):
            parse_nmap_xml("not xml at all")

    def test_service_with_product_only(self):
        xml = """<?xml version="1.0"?>
        <nmaprun>
          <host>
            <status state="up"/>
            <address addr="10.0.0.1" addrtype="ipv4"/>
            <ports>
              <port protocol="tcp" portid="80">
                <state state="open"/>
                <service name="http" product="Apache"/>
              </port>
            </ports>
          </host>
        </nmaprun>"""
        hosts = parse_nmap_xml(xml)
        assert hosts[0].ports[0].version == "Apache"
