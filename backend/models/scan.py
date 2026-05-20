from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


class ScanType(str, Enum):
    SYN = "-sS"
    TCP_CONNECT = "-sT"
    UDP = "-sU"
    FIN = "-sF"
    XMAS = "-sX"
    NULL = "-sN"
    ACK = "-sA"
    PING = "-sn"
    VERSION = "-sV"


class PortState(str, Enum):
    OPEN = "open"
    CLOSED = "closed"
    FILTERED = "filtered"
    OPEN_FILTERED = "open|filtered"


class ScanStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class Port(BaseModel):
    number: int
    protocol: str = "tcp"
    state: PortState
    service: str = ""
    version: str = ""


class Host(BaseModel):
    ip: str
    hostname: str = ""
    status: str = "up"
    ports: list[Port] = Field(default_factory=list)
    os: str = ""


class ScanRequest(BaseModel):
    target: str = Field(min_length=1)
    scan_type: ScanType = ScanType.SYN
    flags: list[str] = Field(default_factory=list)
    ports: str = ""
    scripts: list[str] = Field(default_factory=list)
    timing: int = Field(default=3, ge=0, le=5)


class ScanResult(BaseModel):
    scan_id: str
    status: ScanStatus = ScanStatus.PENDING
    command: str = ""
    target: str = ""
    hosts: list[Host] = Field(default_factory=list)
    raw_output: str = ""
    started_at: datetime = Field(default_factory=datetime.now)
    finished_at: datetime | None = None
