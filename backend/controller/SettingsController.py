import platform
import psutil
import time
import datetime

def index(payload=None):
    os_name = platform.system()
    os_release = platform.release()
    node_name = platform.node()
    processor = platform.processor()
    architecture = platform.architecture()[0]   

    local_timezone = time.tzname[time.daylight] if time.daylight < len(time.tzname) else time.tzname[0]

    virtual_mem = psutil.virtual_memory()
    ram_total = round(virtual_mem.total / (1024 ** 3), 2)

    cpu_count_logical = psutil.cpu_count(logical=True)
    cpu_count_physical = psutil.cpu_count(logical=False)

    disk_list = []
    for partition in psutil.disk_partitions():
        try:
            if 'cdrom' in partition.opts or partition.fstype == '':
                continue
                
            usage = psutil.disk_usage(partition.mountpoint)
            disk_list.append({
                "device": partition.device,
                "mountpoint": partition.mountpoint,
                "fileSystem": partition.fstype,
                "totalGb": round(usage.total / (1024 ** 3), 2),
                "usedGb": round(usage.used / (1024 ** 3), 2),
                "freeGb": round(usage.free / (1024 ** 3), 2),
                "usagePercent": usage.percent
            })
        except PermissionError:
            continue

    return {
        "status": "success",
        "message": "Success get complete device info with timezone & theme",
        "data": {
            "deviceName": node_name,
            "os": f"{os_name} {os_release} ({architecture})",
            "processor": processor,
            "timezone": {
                "name": local_timezone,
            },
            "cpu": {
                "physicalCores": cpu_count_physical,
                "logicalCores": cpu_count_logical,
            },
            "ram": {
                "totalGb": ram_total,
            },
            "disks": disk_list
        }
    }