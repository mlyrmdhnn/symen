from core.db.initialize_db import InitializeDb
import sys

InitializeDb.init_db()

def main():

    import api.api

    from core.router.router import req_method, req_url
    not_found = {"status": "error", "message": f"Route {req_method} {req_url} tidak ditemukan"}
    sys.stdout.flush()

if __name__ == "__main__" :
    main()