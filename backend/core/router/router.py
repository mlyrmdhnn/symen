import importlib
import json
import sys

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
  if req_method != target_method or req_url != target_url:
    return None

  try:
    full_controller_name = f"controller.{controller_name}"
    module = importlib.import_module(full_controller_name)

   
    if not hasattr(module, controller_name):
      return {
          "status": "error",
          "message": f"Class '{controller_name}' tidak ditemukan di {controller_name}.py",
      }

    controller_class = getattr(module, controller_name)

    controller_instance = controller_class()

    if hasattr(controller_instance, method_name):
      func = getattr(controller_instance, method_name)
      result = func(req_payload)
      return result
    else:
      return {
          "status": "error",
          "message": (
              f"Method '{method_name}' tidak ditemukan di class"
              f" '{controller_name}'"
          ),
      }

  except ModuleNotFoundError:
    return {
        "status": "error",
        "message": f"Controller file '{controller_name}.py' tidak ditemukan",
    }
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

