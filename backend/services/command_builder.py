import re

SAFE_TARGET_PATTERN = re.compile(r'^[a-zA-Z0-9./:\-]+$')
SAFE_FLAG_PATTERN = re.compile(r'^-[a-zA-Z0-9\-]+$')
SAFE_VALUE_PATTERN = re.compile(r'^[a-zA-Z0-9,.\-:/ ]+$')

ALLOWED_SCAN_TYPES = {
    "-sS", "-sT", "-sU", "-sF", "-sX", "-sN", "-sA", "-sn", "-sV",
}

ALLOWED_FLAGS = {
    "-O", "-A", "-F", "-f", "-v", "-vv", "-Pn", "-p-",
    "--traceroute", "--reason", "--open",
}

VALUE_FLAGS = {
    "-p", "--top-ports", "-D", "--data-length",
    "--script", "--script-args", "-PS", "-PA", "-PU",
}


class CommandBuilder:
    def __init__(self):
        self._target = ""
        self._scan_type = "-sS"
        self._timing = 3
        self._flags: list[str] = []
        self._ports = ""
        self._scripts: list[str] = []

    def target(self, value: str) -> 'CommandBuilder':
        _validate_target(value)
        self._target = value
        return self

    def scan_type(self, value: str) -> 'CommandBuilder':
        _validate_scan_type(value)
        self._scan_type = value
        return self

    def timing(self, value: int) -> 'CommandBuilder':
        _validate_timing(value)
        self._timing = value
        return self

    def ports(self, value: str) -> 'CommandBuilder':
        if not value:
            return self
        _validate_value(value, "ports")
        self._ports = value
        return self

    def add_flag(self, flag: str, value: str = "") -> 'CommandBuilder':
        if value:
            _validate_value_flag(flag, value)
            self._flags.append(f"{flag} {value}")
        else:
            _validate_flag(flag)
            self._flags.append(flag)
        return self

    def add_script(self, script: str) -> 'CommandBuilder':
        _validate_value(script, "script")
        self._scripts.append(script)
        return self

    def build(self) -> str:
        if not self._target:
            raise ValueError("Target is required")

        parts = ["nmap", self._scan_type, f"-T{self._timing}"]

        if self._ports:
            parts.append(f"-p {self._ports}")

        parts.extend(self._flags)

        if self._scripts:
            joined = ",".join(self._scripts)
            parts.append(f"--script={joined}")

        parts.extend(["-oX", "-", self._target])

        return " ".join(parts)


def _validate_target(value: str) -> None:
    if not value:
        raise ValueError("Target cannot be empty")
    if not SAFE_TARGET_PATTERN.match(value):
        raise ValueError(f"Invalid target: {value}")


def _validate_scan_type(value: str) -> None:
    if value not in ALLOWED_SCAN_TYPES:
        raise ValueError(f"Invalid scan type: {value}")


def _validate_timing(value: int) -> None:
    if not 0 <= value <= 5:
        raise ValueError(f"Timing must be 0-5, got {value}")


def _validate_flag(flag: str) -> None:
    if flag not in ALLOWED_FLAGS:
        raise ValueError(f"Invalid flag: {flag}")


def _validate_value_flag(flag: str, value: str) -> None:
    if flag not in VALUE_FLAGS:
        raise ValueError(f"Flag {flag} does not accept values")
    _validate_value(value, flag)


def _validate_value(value: str, context: str) -> None:
    if not SAFE_VALUE_PATTERN.match(value):
        raise ValueError(f"Invalid value for {context}: {value}")
