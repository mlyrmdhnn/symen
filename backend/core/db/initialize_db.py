import sqlite3
import os

class InitializeDb:
    def init_db():
        BASE_DIR = os.path.dirname(os.path.abspath(__file__))

        db_path = os.path.join(BASE_DIR, 'symen.db')


        os.makedirs(os.path.dirname(db_path), exist_ok=True)
        
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        cursor.execute('''
        CREATE TABLE IF NOT EXISTS settings(
            id TEXT PRIMARY KEY,
            value TEXT
        )
        ''')

        conn.commit()
        conn.close()