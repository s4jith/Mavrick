"""Neat, colourful console logging shared by the app and uvicorn."""
from __future__ import annotations

import logging
import sys

_RESET = "\033[0m"
_DIM = "\033[2m"
_LEVEL_COLOURS = {
    "DEBUG": "\033[36m",     # cyan
    "INFO": "\033[32m",      # green
    "WARNING": "\033[33m",   # yellow
    "ERROR": "\033[31m",     # red
    "CRITICAL": "\033[97;41m",  # white on red
}


class CleanFormatter(logging.Formatter):
    """`HH:MM:SS  LEVEL  logger.name  message` with a coloured level."""

    def __init__(self, use_colour: bool = True) -> None:
        super().__init__(datefmt="%H:%M:%S")
        self.use_colour = use_colour

    def format(self, record: logging.LogRecord) -> str:
        ts = self.formatTime(record, self.datefmt)
        level = record.levelname
        name = record.name.replace("mavrick.", "")
        msg = record.getMessage()

        if self.use_colour:
            colour = _LEVEL_COLOURS.get(level, "")
            level_str = f"{colour}{level:<7}{_RESET}"
            name_str = f"{_DIM}{name:<10}{_RESET}"
            ts_str = f"{_DIM}{ts}{_RESET}"
        else:
            level_str = f"{level:<7}"
            name_str = f"{name:<10}"
            ts_str = ts

        line = f"{ts_str}  {level_str}  {name_str}  {msg}"
        if record.exc_info:
            line += "\n" + self.formatException(record.exc_info)
        return line


def setup_logging(level: str = "INFO") -> None:
    use_colour = sys.stderr.isatty()
    handler = logging.StreamHandler(sys.stderr)
    handler.setFormatter(CleanFormatter(use_colour=use_colour))

    root = logging.getLogger()
    root.handlers.clear()
    root.addHandler(handler)
    root.setLevel(level)

    # Route uvicorn through the same clean handler.
    for name in ("uvicorn", "uvicorn.error", "uvicorn.access"):
        lg = logging.getLogger(name)
        lg.handlers.clear()
        lg.propagate = True

    logging.getLogger("mavrick").setLevel(level)


def get_logger(name: str) -> logging.Logger:
    return logging.getLogger(f"mavrick.{name}")
