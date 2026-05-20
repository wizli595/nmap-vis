import pytest

from services.command_builder import CommandBuilder


class TestBasicCommand:
    def test_minimal_command(self):
        cmd = CommandBuilder().target("192.168.1.1").build()
        assert cmd == "nmap -sS -T3 -oX - 192.168.1.1"

    def test_with_scan_type(self):
        cmd = CommandBuilder().target("10.0.0.1").scan_type("-sT").build()
        assert cmd == "nmap -sT -T3 -oX - 10.0.0.1"

    def test_with_timing(self):
        cmd = CommandBuilder().target("10.0.0.1").timing(4).build()
        assert cmd == "nmap -sS -T4 -oX - 10.0.0.1"

    def test_with_ports(self):
        cmd = CommandBuilder().target("10.0.0.1").ports("1-1000").build()
        assert cmd == "nmap -sS -T3 -p 1-1000 -oX - 10.0.0.1"

    def test_with_specific_ports(self):
        cmd = CommandBuilder().target("10.0.0.1").ports("22,80,443").build()
        assert cmd == "nmap -sS -T3 -p 22,80,443 -oX - 10.0.0.1"


class TestFlags:
    def test_single_flag(self):
        cmd = CommandBuilder().target("10.0.0.1").add_flag("-O").build()
        assert "-O" in cmd

    def test_multiple_flags(self):
        cmd = (
            CommandBuilder()
            .target("10.0.0.1")
            .add_flag("-O")
            .add_flag("-A")
            .add_flag("--traceroute")
            .build()
        )
        assert "-O" in cmd
        assert "-A" in cmd
        assert "--traceroute" in cmd

    def test_flag_with_value(self):
        cmd = CommandBuilder().target("10.0.0.1").add_flag("-D", "RND:5").build()
        assert "-D RND:5" in cmd

    def test_verbose_flag(self):
        cmd = CommandBuilder().target("10.0.0.1").add_flag("-v").build()
        assert "-v" in cmd


class TestScripts:
    def test_single_script(self):
        cmd = CommandBuilder().target("10.0.0.1").add_script("vulners").build()
        assert "--script=vulners" in cmd

    def test_multiple_scripts(self):
        cmd = (
            CommandBuilder()
            .target("10.0.0.1")
            .add_script("vulners")
            .add_script("http-title")
            .build()
        )
        assert "--script=vulners,http-title" in cmd


class TestFullCommand:
    def test_complete_scan(self):
        cmd = (
            CommandBuilder()
            .target("192.168.1.0/24")
            .scan_type("-sV")
            .timing(4)
            .ports("1-1000")
            .add_flag("-O")
            .add_flag("--open")
            .add_script("vulners")
            .build()
        )
        assert cmd == "nmap -sV -T4 -p 1-1000 -O --open --script=vulners -oX - 192.168.1.0/24"

    def test_xml_output_always_present(self):
        cmd = CommandBuilder().target("10.0.0.1").build()
        assert "-oX -" in cmd

    def test_target_always_last(self):
        cmd = CommandBuilder().target("scanme.nmap.org").add_flag("-A").build()
        assert cmd.endswith("scanme.nmap.org")


class TestValidation:
    def test_empty_target_raises(self):
        with pytest.raises(ValueError, match="Target is required"):
            CommandBuilder().build()

    def test_invalid_target_raises(self):
        with pytest.raises(ValueError, match="Invalid target"):
            CommandBuilder().target("$(rm -rf /)").build()

    def test_semicolon_injection_raises(self):
        with pytest.raises(ValueError, match="Invalid target"):
            CommandBuilder().target("10.0.0.1; rm -rf /").build()

    def test_pipe_injection_raises(self):
        with pytest.raises(ValueError, match="Invalid target"):
            CommandBuilder().target("10.0.0.1 | cat /etc/passwd").build()

    def test_invalid_scan_type_raises(self):
        with pytest.raises(ValueError, match="Invalid scan type"):
            CommandBuilder().target("10.0.0.1").scan_type("-sZ").build()

    def test_invalid_flag_raises(self):
        with pytest.raises(ValueError, match="Invalid flag"):
            CommandBuilder().target("10.0.0.1").add_flag("--evil").build()

    def test_timing_too_low_raises(self):
        with pytest.raises(ValueError, match="Timing must be 0-5"):
            CommandBuilder().target("10.0.0.1").timing(-1).build()

    def test_timing_too_high_raises(self):
        with pytest.raises(ValueError, match="Timing must be 0-5"):
            CommandBuilder().target("10.0.0.1").timing(6).build()

    def test_invalid_value_flag_raises(self):
        with pytest.raises(ValueError, match="does not accept values"):
            CommandBuilder().target("10.0.0.1").add_flag("-O", "bad").build()

    def test_script_injection_raises(self):
        with pytest.raises(ValueError, match="Invalid value"):
            CommandBuilder().target("10.0.0.1").add_script("$(whoami)").build()


class TestChaining:
    def test_fluent_returns_self(self):
        builder = CommandBuilder()
        assert builder.target("10.0.0.1") is builder
        assert builder.scan_type("-sT") is builder
        assert builder.timing(4) is builder
        assert builder.ports("80") is builder
        assert builder.add_flag("-O") is builder
        assert builder.add_script("vulners") is builder

    def test_empty_ports_ignored(self):
        cmd = CommandBuilder().target("10.0.0.1").ports("").build()
        assert "-p" not in cmd
