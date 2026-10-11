from core.services.ServiceManager import ServiceError, ServiceManager


class ServiceController:
    def __init__(self):
        self.manager = ServiceManager()

    def index(self, payload=None):
        return {"status": "ok", "data": self.manager.list_services()}

    def add(self, payload=None):
        return {"status": "ok", "data": self.manager.add_service(payload)}

    def update(self, payload=None):
        return {"status": "ok", "data": self.manager.update_service(payload)}

    def start(self, payload=None):
        if not isinstance(payload, dict):
            raise ServiceError("Service id is required")
        return {"status": "ok", "data": self.manager.start_service(payload.get("id"))}

    def stop(self, payload=None):
        if not isinstance(payload, dict):
            raise ServiceError("Service id is required")
        return {"status": "ok", "data": self.manager.stop_service(payload.get("id"))}

    def delete(self, payload=None):
        if not isinstance(payload, dict):
            raise ServiceError("Service id is required")
        return {"status": "ok", "data": self.manager.delete_service(payload.get("id"))}

    def logs(self, payload=None):
        if not isinstance(payload, dict):
            raise ServiceError("Service id is required")
        return {"status": "ok", "data": self.manager.service_logs(payload.get("id"))}

    def globalLogs(self, payload=None):
        return {"status": "ok", "data": self.manager.global_logs()}
