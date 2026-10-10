from core.db.Query import Query

class TestController(Query):
    def __init__(self):
        pass


    def index(self, payload):
        
        return {
            "status" : "ok",
            "message" : "Success",
            "data" : payload
        }