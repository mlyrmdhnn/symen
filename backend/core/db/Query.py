import json
import os


class Query:

  def __init__(self):
    self.BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    self.CONFIG_FILE = os.path.join(self.BASE_DIR, "config.json")

  def save_config(self, data):
    with open(self.CONFIG_FILE, "w") as f:
      json.dump(data, f, indent=4)

  def all(self):
    if not os.path.exists(self.CONFIG_FILE):
      default_data = {"realtime_chart": "true", "theme": "system"}
      self.save_config(default_data)
      return default_data

    with open(self.CONFIG_FILE, "r") as f:
      return json.load(f)

  def get(self, key, default=None):
    config = self.all()
    return config.get(key, default)

  def set(self, key, value):
    config = self.all()
    config[key] = value
    self.save_config(config)
    return config