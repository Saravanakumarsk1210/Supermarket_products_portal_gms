"""Start the GMS World Foods servers (customer site + admin portal)."""

import argparse
import multiprocessing
import socket
import subprocess
import sys
import time

import uvicorn

from app.config import get_settings


def _port_in_use(host: str, port: int) -> bool:
    """True if something is already accepting connections on host:port."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.settimeout(0.4)
        try:
            return sock.connect_ex((host, port)) == 0
        except OSError:
            return False


def _pids_on_port(port: int) -> list[int]:
    """Return PIDs listening on a TCP port (Windows netstat)."""
    pids: list[int] = []
    try:
        out = subprocess.check_output(
            ["netstat", "-ano", "-p", "tcp"],
            text=True,
            encoding="utf-8",
            errors="ignore",
        )
        needle = f":{port}"
        for line in out.splitlines():
            if "LISTENING" not in line or needle not in line:
                continue
            parts = line.split()
            if parts and parts[-1].isdigit():
                pid = int(parts[-1])
                if pid and pid not in pids:
                    pids.append(pid)
    except (subprocess.SubprocessError, OSError):
        pass
    return pids


def _stop_ports(ports: list[int]) -> None:
    """Stop processes listening on the given ports (Windows)."""
    stopped: set[int] = set()
    for port in ports:
        for pid in _pids_on_port(port):
            if pid in stopped or pid == 0:
                continue
            stopped.add(pid)
            print(f"  Stopping PID {pid} (port {port})…")
            subprocess.run(
                ["taskkill", "/PID", str(pid), "/F"],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                check=False,
            )
    if stopped:
        time.sleep(1.0)


def _run_server() -> None:
    settings = get_settings()
    uvicorn.run(
        "app.main:app",
        host=settings.app_host,
        port=settings.app_port,
        reload=False,
        log_level="info",
    )


def _report_port_conflict(label: str, port: int, host: str) -> None:
    pids = _pids_on_port(port)
    print(f"ERROR: Port {port} ({label}) is already in use.")
    if pids:
        print(f"       Process ID(s): {', '.join(str(p) for p in pids)}")
    print()
    print("  Fix options:")
    print("    1. Run:  python run.py --stop")
    print("    2. Or manually stop the old server (Ctrl+C in its terminal)")
    print(f"    3. Or change the port in .env (currently {port})")


if __name__ == "__main__":
    multiprocessing.freeze_support()

    parser = argparse.ArgumentParser(description="Start GMS World Foods servers")
    parser.add_argument(
        "--stop",
        action="store_true",
        help="Stop any process using the server port, then start fresh",
    )
    args = parser.parse_args()

    settings = get_settings()
    host = settings.app_host
    site_url = f"http://{host}:{settings.app_port}"
    ports = [settings.app_port]

    if args.stop:
        print("Stopping existing server on port", settings.app_port, "…")
        _stop_ports(ports)

    if _port_in_use(host, settings.app_port):
        print("=" * 60)
        _report_port_conflict("GMS server", settings.app_port, host)
        print("=" * 60)
        sys.exit(1)

    print("=" * 60)
    print("  GMS World Foods — Server Starting")
    print("=" * 60)
    print(f"  Customer site:  {site_url}")
    print(f"  Admin portal:   {site_url}/admin")
    print(f"  API docs:       {site_url}/docs")
    print("=" * 60)
    print("  Press Ctrl+C to stop")
    print("=" * 60)

    server_proc = multiprocessing.Process(target=_run_server, name="gms-server", daemon=True)
    server_proc.start()
    time.sleep(0.6)

    if not server_proc.is_alive():
        print("\nERROR: Server failed to start on port", settings.app_port)
        _report_port_conflict("GMS server", settings.app_port, host)
        sys.exit(1)

    try:
        while server_proc.is_alive():
            time.sleep(0.5)
        print("\nServer stopped unexpectedly.")
    except KeyboardInterrupt:
        print("\nShutting down…")
    finally:
        if server_proc.is_alive():
            server_proc.terminate()
            server_proc.join(timeout=5)
        sys.exit(0)
