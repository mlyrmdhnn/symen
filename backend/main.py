import sys
from router.router import Route
import json

# route = Route()



def main():

    Route.get('/settings', ['SettingsController', 'index'])
    Route.post('/test', ['TestController', 'index'])

    from router.router import req_method, req_url
    not_found = {"status": "error", "message": f"Route {req_method} {req_url} tidak ditemukan"}
    # print(json.dumps(not_found))
    sys.stdout.flush()

if __name__ == "__main__" :
    main()