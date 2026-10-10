from core.db.InitializeConfig import InitializeConfig
import json
import sys




def main():
    config_manager = InitializeConfig()
    config = config_manager.load_config()

    import api.api


    from core.router.router import req_method, req_url
    not_found = {"status": "error", "message": f"Route {req_method} {req_url} not found"}
    print(json.dumps(not_found))
    sys.stdout.flush()

if __name__ == "__main__" :
    main()