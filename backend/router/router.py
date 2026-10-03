import importlib
import sys
import json


# 1. Tangkap request dari Electron
try:
    raw_arg = sys.argv[1]
    request = json.loads(raw_arg)
    req_method = request.get("method", "GET").upper()
    req_url = request.get("url", "")
    req_payload = request.get("data", {})
except Exception:
    req_method = "GET"
    req_url = ""
    req_payload = {}

def execute_route(target_method, target_url, controller_name, method_name):
    # Cek apakah HTTP Method DAN URL-nya cocok
    if req_method != target_method or req_url != target_url:
        return None # Bukan rute yang dicari, lewati

    try:
        # Import file controller secara dinamis
        full_controller_name = f"controller.{controller_name}"
        controller = importlib.import_module(full_controller_name)
        
        if hasattr(controller, method_name):
            func = getattr(controller, method_name)
            # Jalankan fungsi controllernya dan kirim payload (bisa berupa data body atau params)
            result = func(req_payload)
            return result
        else:
            return {"status": "error", "message": f"Method '{method_name}' tidak ditemukan di {controller_name}"}
            
    except ModuleNotFoundError:
        return {"status": "error", "message": f"Controller '{controller_name}' tidak ditemukan"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

class Route:
    @staticmethod
    def get(url, array):
        response = execute_route("GET", url, array[0], array[1])
        if response is not None:
            print(json.dumps(response))
            sys.stdout.flush()
            sys.exit(0)

    @staticmethod
    def post(url, array):
        response = execute_route("POST", url, array[0], array[1])
        if response is not None:
            print(json.dumps(response))
            sys.stdout.flush()
            sys.exit(0)

    @staticmethod
    def put(url, array):
        response = execute_route("PUT", url, array[0], array[1])
        if response is not None:
            print(json.dumps(response))
            sys.stdout.flush()
            sys.exit(0)

    @staticmethod
    def delete(url, array):
        response = execute_route("DELETE", url, array[0], array[1])
        if response is not None:
            print(json.dumps(response))
            sys.stdout.flush()
            sys.exit(0)

# route = Route()

# if __name__ == "__main__":
#     # GET Endpoints
#     Route.get('/device-information', ['SettingsController', 'index'])
#     Route.get('/cpu-status', ['SystemController', 'get_cpu'])

#     # POST Endpoints (contoh kirim data config/setting baru)
#     Route.post('/settings', ['SettingsController', 'store'])

#     # PUT Endpoints (contoh update data)
#     Route.put('/settings', ['SettingsController', 'update'])

#     # DELETE Endpoints (contoh hapus data/log)
#     Route.delete('/logs', ['SystemController', 'clear_logs'])

#     # Fallback kalau rute tidak terdaftar sama sekali
#     not_found = {"status": "error", "message": f"Route {req_method} {req_url} tidak ditemukan"}
#     print(json.dumps(not_found))
#     sys.stdout.flush()