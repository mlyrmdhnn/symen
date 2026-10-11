import json
import os
from pathlib import Path


class InitializeConfig:

  BASE_DIR = os.path.dirname(os.path.abspath(__file__))
  CONFIG_FILE = os.path.join(
    os.environ.get("SYMEN_DATA_DIR", BASE_DIR), "config.json"
  )

  def __init__(self):
    pass

  def save_config(self, data):
    Path(self.CONFIG_FILE).parent.mkdir(parents=True, exist_ok=True)
    with open(self.CONFIG_FILE, "w") as f:
      json.dump(data, f, indent=4)

  def load_config(self):
    if not os.path.exists(self.CONFIG_FILE):
      default_config = {"realtime_chart": True, "theme": "system"}
      self.save_config(default_config)
     