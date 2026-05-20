import logging
import sys
from datetime import datetime, timezone


class StructuredFormatter(logging.Formatter):
    LEVEL_COLORS = {
        "DEBUG": "\033[36m",
        "INFO": "\033[32m",
        "WARNING": "\033[33m",
        "ERROR": "\033[31m",
        "CRITICAL": "\033[35m",
    }
    RESET = "\033[0m"

    def format(self, record: logging.LogRecord) -> str:
        timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
        color = self.LEVEL_COLORS.get(record.levelname, "")
        level = f"{color}{record.levelname:<8}{self.RESET}"
        module = f"{record.name}:{record.lineno}"

        base = f"{timestamp} {level} {module:<30} {record.getMessage()}"

        if record.exc_info and record.exc_info[0]:
            base += f"\n{self.formatException(record.exc_info)}"

        return base


def get_logger(name: str) -> logging.Logger:
    logger = logging.getLogger(f"nmap-vis.{name}")

    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(StructuredFormatter())
        logger.addHandler(handler)
        logger.setLevel(logging.DEBUG)
        logger.propagate = False

    return logger
