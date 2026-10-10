from core.db.Query import Query
import platform
import psutil

class DashboardController(Query):

    def __init__(self):
        pass

    def index(self, payload=None):
        ram = psutil.virtual_memory()
        ram_total = round(ram.total / (1024 ** 3), 2)
        used_ram = round(ram.used / (1024 ** 3), 2)
        available_ram = round(ram.available / (1024 ** 3), 2)
        ram_percent = ram.percent

        cpu_percent = psutil.cpu_percent(interval=0.1)

        return {
            "status": "ok",
            "message": "success",
            "data": {
                "ram": {
                    "ramTotal": ram_total,
                    "usedRam": used_ram,
                    "availableRam": available_ram,
                    "usagePercent": ram_percent
                },
                "cpu": {
                    "usagePercent": cpu_percent
                }
            }
        }