import json
import os
import platform
import subprocess
import sys
import uuid
from collections import deque
from datetime import datetime, timezone
from pathlib import Path

import psutil


class ServiceError(Exception):
    pass


class ServiceManager:
    EXECUTABLES = {
        "nginx": ("nginx",),
        "mysql": ("mysqld",),
        "postgresql": ("postgres",),
        "apache": ("httpd",),
        "redis": ("redis-server",),
        "php": ("php-cgi",),
        "custom": (),
    }

    DEFAULT_STARTUP_ARGUMENTS = {
        "nginx": {"arguments": ["-g", "daemon off; error_log stderr;"]},
        "mysql": {"arguments": [], "platform_arguments": {"Windows": ["--console"]}},
        "postgresql": {"arguments": []},
        "apache": {"arguments": ["-DFOREGROUND"]},
        "redis": {"arguments": ["--daemonize", "no"]},
        "php": {"arguments": ["-b", "127.0.0.1:9000"]},
        "custom": {"arguments": []},
    }

    def __init__(self, data_dir=None):
        default_data_dir = os.environ.get("SYMEN_DATA_DIR")
        self.data_dir = (
            Path(data_dir)
            if data_dir
            else Path(default_data_dir)
            if default_data_dir
            else Path(__file__).resolve().parents[1] / "db"
        )
        self.services_file = self.data_dir / "services.json"
        self.logs_dir = self.data_dir / "service-logs"
        self.backend_root = Path(__file__).resolve().parents[2]
        config_dir = os.environ.get("SYMEN_CONFIG_DIR")
        self.startup_arguments_file = (
            Path(config_dir) / "symen.conf" if config_dir else self.backend_root / "symen.conf"
        )
        self.startup_arguments_template = (
            Path(getattr(sys, "_MEIPASS", self.backend_root)) / "symen.conf"
        )
        self._create_startup_arguments_file()

    def _create_startup_arguments_file(self):
        if self.startup_arguments_file.exists():
            return
        try:
            self.startup_arguments_file.parent.mkdir(parents=True, exist_ok=True)
            if self.startup_arguments_template.exists() and (
                self.startup_arguments_template != self.startup_arguments_file
            ):
                self.startup_arguments_file.write_bytes(
                    self.startup_arguments_template.read_bytes()
                )
                return
            with self.startup_arguments_file.open("w", encoding="utf-8") as file:
                json.dump(self.DEFAULT_STARTUP_ARGUMENTS, file, indent=2)
                file.write("\n")
        except OSError as error:
            raise ServiceError(f"Could not create startup arguments config: {error}") from error

    def load_startup_arguments_config(self):
        self._create_startup_arguments_file()
        try:
            with self.startup_arguments_file.open(encoding="utf-8") as file:
                config = json.load(file)
        except (OSError, json.JSONDecodeError) as error:
            raise ServiceError(f"Could not read startup arguments config: {error}") from error

        self._validate_startup_arguments_config(config)
        return config

    def save_startup_arguments_config(self, config):
        self._validate_startup_arguments_config(config)
        self.startup_arguments_file.parent.mkdir(parents=True, exist_ok=True)
        temporary_file = self.startup_arguments_file.with_suffix(".conf.tmp")
        try:
            with temporary_file.open("w", encoding="utf-8") as file:
                json.dump(config, file, indent=2)
                file.write("\n")
            os.replace(temporary_file, self.startup_arguments_file)
        except OSError as error:
            try:
                temporary_file.unlink()
            except FileNotFoundError:
                pass
            raise ServiceError(f"Could not save startup arguments config: {error}") from error

    def _validate_startup_arguments_config(self, config):
        if not isinstance(config, dict):
            raise ServiceError("Startup arguments config must be a JSON object")

        for service_type, service_config in config.items():
            if service_type not in self.EXECUTABLES:
                raise ServiceError(
                    f"Unsupported service type in startup arguments config: {service_type}"
                )
            if not isinstance(service_config, dict):
                raise ServiceError(f"Startup arguments for {service_type} must be an object")
            if set(service_config) - {"arguments", "platform_arguments"}:
                raise ServiceError(f"Startup arguments for {service_type} contain unsupported settings")

            self._validate_arguments(service_config.get("arguments", []))
            platform_arguments = service_config.get("platform_arguments", {})
            if not isinstance(platform_arguments, dict):
                raise ServiceError(f"Platform arguments for {service_type} must be an object")
            for platform_name, arguments in platform_arguments.items():
                if not isinstance(platform_name, str) or not platform_name.strip():
                    raise ServiceError("Platform names must be non-empty text")
                self._validate_arguments(arguments)

    def _default_startup_arguments(self, service_type):
        config = self.load_startup_arguments_config()
        service_config = config.get(service_type, {})
        arguments = self._validate_arguments(service_config.get("arguments", []))
        platform_arguments = service_config.get("platform_arguments", {})
        arguments.extend(
            self._validate_arguments(platform_arguments.get(platform.system(), []))
        )
        return arguments

    @staticmethod
    def _merge_startup_arguments(arguments, defaults):
        default_groups = []
        for argument in defaults:
            if argument.startswith("-") or not default_groups:
                default_groups.append([argument])
            else:
                default_groups[-1].append(argument)

        custom_options = {argument for argument in arguments if argument.startswith("-")}
        merged_arguments = list(arguments)
        for group in default_groups:
            if group[0] not in custom_options:
                merged_arguments.extend(group)
        return merged_arguments

    def _read_services(self):
        if not self.services_file.exists():
            return []
        try:
            with self.services_file.open(encoding="utf-8") as file:
                services = json.load(file)
        except (OSError, json.JSONDecodeError) as error:
            raise ServiceError(f"Could not read saved services: {error}") from error
        if not isinstance(services, list):
            raise ServiceError("Saved services data is invalid")
        return services

    def _write_services(self, services):
        self.data_dir.mkdir(parents=True, exist_ok=True)
        temporary_file = self.services_file.with_suffix(".json.tmp")
        try:
            with temporary_file.open("w", encoding="utf-8") as file:
                json.dump(services, file, indent=2)
            os.replace(temporary_file, self.services_file)
        except OSError as error:
            raise ServiceError(f"Could not save services: {error}") from error

    @staticmethod
    def _find_service(services, service_id):
        service = next((item for item in services if item.get("id") == service_id), None)
        if service is None:
            raise ServiceError("Service not found")
        return service

    @staticmethod
    def _validate_arguments(arguments):
        if not isinstance(arguments, list) or len(arguments) > 100:
            raise ServiceError("Arguments must be a list containing at most 100 items")
        if any(not isinstance(argument, str) or "\0" in argument for argument in arguments):
            raise ServiceError("Service arguments must be valid text")
        return arguments

    @staticmethod
    def _validate_path(path_value):
        if not isinstance(path_value, str) or not path_value.strip():
            raise ServiceError("Select a service folder")
        path = Path(path_value).expanduser().resolve()
        if not path.is_dir():
            raise ServiceError("The selected service folder does not exist")
        return path

    @staticmethod
    def _executable_path(root, service_type, executable_name):
        suffix = ".exe" if platform.system() == "Windows" else ""
        name = executable_name.strip() if isinstance(executable_name, str) else ""
        if name:
            relative_path = Path(name)
            if relative_path.is_absolute():
                raise ServiceError("Executable must be inside the selected service folder")
            candidate_paths = [root / relative_path]
        else:
            executable_names = ServiceManager.EXECUTABLES.get(service_type, ())
            candidate_paths = [
                directory / f"{name}{suffix}"
                for directory in (
                    root,
                    root / "bin",
                    root / "sbin",
                    root / "usr" / "bin",
                    root / "Server" / "bin",
                )
                for name in executable_names
            ]

        for candidate in candidate_paths:
            resolved = candidate.resolve()
            try:
                if os.path.commonpath((str(root), str(resolved))) != str(root):
                    continue
            except ValueError:
                continue
            if resolved.is_file():
                return str(resolved)
        return None

    @staticmethod
    def _status(service):
        if service.get("last_error"):
            return "error"
        executable = service.get("executable")
        if not executable or not Path(executable).is_file():
            return "error"
        pid = service.get("pid")
        started = service.get("process_created_at")
        if not isinstance(pid, int) or not isinstance(started, (int, float)):
            return "stopped"

        try:
            process = psutil.Process(pid)
            if abs(process.create_time() - started) > 2:
                return "error"
            executable_path = os.path.normcase(os.path.realpath(process.exe()))
            registered_path = os.path.normcase(os.path.realpath(executable))
            if executable_path != registered_path:
                return "error"
            if process.status() == psutil.STATUS_ZOMBIE:
                return "error"
            return "running" if process.is_running() else "error"
        except (psutil.NoSuchProcess, psutil.ZombieProcess):
            return "error"
        except psutil.AccessDenied:
            return "error"

    @staticmethod
    def _view(service):
        status = ServiceManager._status(service)
        return {
            "id": service["id"],
            "name": service["name"],
            "serviceType": service["service_type"],
            "path": service["path"],
            "executable": service.get("executable"),
            "executableName": service.get("executable_name", ""),
            "arguments": service.get("arguments", []),
            "status": status,
            "pid": service.get("pid"),
            "startedAt": service.get("started_at"),
            "lastError": service.get("last_error")
            or ("Could not verify the service process" if status == "error" else None),
        }

    def list_services(self):
        return [self._view(service) for service in self._read_services()]

    def add_service(self, payload):
        if not isinstance(payload, dict):
            raise ServiceError("Service details are required")
        name = payload.get("name")
        service_type = payload.get("serviceType")
        if not isinstance(name, str) or not name.strip() or len(name.strip()) > 80:
            raise ServiceError("Enter a service name of 1 to 80 characters")
        if service_type not in self.EXECUTABLES:
            raise ServiceError("Choose a supported service type")

        root = self._validate_path(payload.get("path"))
        executable_name = payload.get("executableName", "")
        if not isinstance(executable_name, str) or "\0" in executable_name:
            raise ServiceError("Executable name must be valid text")
        executable = self._executable_path(root, service_type, executable_name)
        service_id = uuid.uuid4().hex
        service = {
            "id": service_id,
            "name": name.strip(),
            "service_type": service_type,
            "path": str(root),
            "executable": executable,
            "executable_name": executable_name,
            "arguments": self._validate_arguments(payload.get("arguments", [])),
            "log_path": str(self.logs_dir / f"{service_id}.log"),
            "pid": None,
            "process_created_at": None,
            "started_at": None,
            "last_error": None if executable else "Could not find the service executable in this folder",
        }
        services = self._read_services()
        services.append(service)
        self._write_services(services)
        return self._view(service)

    def update_service(self, payload):
        if not isinstance(payload, dict):
            raise ServiceError("Service changes are required")
        services = self._read_services()
        service = self._find_service(services, payload.get("id"))
        status = self._status(service)
        if status == "running" or (status == "error" and service.get("pid") is not None):
            raise ServiceError("Stop the service before changing its folder")

        root = self._validate_path(payload.get("path"))
        executable_name = payload.get("executableName", service.get("executable_name", ""))
        if not isinstance(executable_name, str) or "\0" in executable_name:
            raise ServiceError("Executable name must be valid text")
        service["path"] = str(root)
        service["executable_name"] = executable_name
        service["executable"] = self._executable_path(
            root, service["service_type"], executable_name
        )
        service["last_error"] = (
            None if service["executable"] else "Could not find the service executable in this folder"
        )
        if "arguments" in payload:
            service["arguments"] = self._validate_arguments(payload["arguments"])
        self._write_services(services)
        return self._view(service)

    def start_service(self, service_id):
        services = self._read_services()
        service = self._find_service(services, service_id)
        if self._status(service) == "running":
            return self._view(service)
        if service.get("pid") is not None and self._status(service) == "error":
            raise ServiceError("Stop or clear the previous service process before restarting")

        executable = service.get("executable")
        if not executable or not Path(executable).is_file():
            service["last_error"] = "Service executable is missing; edit the linked folder"
            self._write_services(services)
            raise ServiceError(service["last_error"])

        log_path = Path(service["log_path"])
        log_path.parent.mkdir(parents=True, exist_ok=True)
        arguments = list(service.get("arguments", []))
        default_arguments = self._default_startup_arguments(service["service_type"])
        arguments = self._merge_startup_arguments(arguments, default_arguments)
        process = None
        try:
            with log_path.open("ab") as log_file:
                options = {
                    "cwd": service["path"],
                    "stdin": subprocess.DEVNULL,
                    "stdout": log_file,
                    "stderr": subprocess.STDOUT,
                    "shell": False,
                    "close_fds": True,
                }
                if os.name == "nt":
                    options["creationflags"] = (
                        subprocess.CREATE_NEW_PROCESS_GROUP | subprocess.DETACHED_PROCESS
                    )
                else:
                    options["start_new_session"] = True
                process = subprocess.Popen(
                    [executable, *arguments],
                    **options,
                )
            process_info = psutil.Process(process.pid)
            service["pid"] = process.pid
            service["process_created_at"] = process_info.create_time()
            service["started_at"] = datetime.now(timezone.utc).isoformat()
            service["last_error"] = None
            self._write_services(services)
        except (OSError, psutil.Error, ServiceError) as error:
            if process is not None and process.poll() is None:
                process.terminate()
                try:
                    process.wait(timeout=3)
                except subprocess.TimeoutExpired:
                    process.kill()
            service["pid"] = None
            service["process_created_at"] = None
            service["last_error"] = f"Could not start service: {error}"
            self._write_services(services)
            raise ServiceError(service["last_error"]) from error
        return self._view(service)

    def stop_service(self, service_id):
        services = self._read_services()
        service = self._find_service(services, service_id)
        pid = service.get("pid")
        started = service.get("process_created_at")
        if isinstance(pid, int) and isinstance(started, (int, float)):
            try:
                process = psutil.Process(pid)
                is_registered_process = (
                    abs(process.create_time() - started) <= 2
                    and os.path.normcase(os.path.realpath(process.exe()))
                    == os.path.normcase(os.path.realpath(service["executable"]))
                )
                if is_registered_process:
                    processes = process.children(recursive=True) + [process]
                    for child in processes:
                        try:
                            child.terminate()
                        except psutil.NoSuchProcess:
                            continue
                    _, alive = psutil.wait_procs(processes, timeout=3)
                    for child in alive:
                        try:
                            child.kill()
                        except psutil.NoSuchProcess:
                            continue
            except (psutil.NoSuchProcess, psutil.ZombieProcess):
                pass
            except psutil.AccessDenied as error:
                raise ServiceError(f"Permission denied while stopping service: {error}") from error

        service["pid"] = None
        service["process_created_at"] = None
        service["last_error"] = None
        self._write_services(services)
        return self._view(service)

    def delete_service(self, service_id):
        services = self._read_services()
        service = self._find_service(services, service_id)
        status = self._status(service)
        if status == "running" or (status == "error" and service.get("pid") is not None):
            raise ServiceError("Stop the service before removing it")
        services.remove(service)
        self._write_services(services)
        return {"id": service_id}

    @staticmethod
    def _tail(log_path, limit):
        path = Path(log_path)
        if not path.is_file():
            return []
        try:
            with path.open("r", encoding="utf-8", errors="replace") as log_file:
                return list(deque(log_file, maxlen=limit))
        except OSError as error:
            raise ServiceError(f"Could not read service logs: {error}") from error

    def service_logs(self, service_id, limit=500):
        services = self._read_services()
        service = self._find_service(services, service_id)
        return {
            "service": self._view(service),
            "lines": [line.rstrip("\r\n") for line in self._tail(service["log_path"], limit)],
        }

    def global_logs(self, limit=500):
        running_services = [
            service for service in self._read_services() if self._status(service) == "running"
        ]
        entries = []
        for service in running_services:
            log_path = Path(service["log_path"])
            lines = self._tail(log_path, limit)
            modified_at = log_path.stat().st_mtime if log_path.exists() else 0
            entries.extend(
                (modified_at, f"[{service['name']}] {line.rstrip('\r\n')}")
                for line in lines
            )
        entries.sort(key=lambda entry: entry[0])
        return {
            "services": [service["name"] for service in running_services],
            "lines": [line for _, line in entries[-limit:]],
        }
