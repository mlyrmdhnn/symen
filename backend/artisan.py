import argparse
import os


def make_controller(name):
  name = name.capitalize()

  os.makedirs("controller", exist_ok=True)
  filename = f"controller/{name}.py"

  if os.path.exists(filename):
    print(f" Controller {filename} already exists!")
    return

  template = f"""
  
class {name}():
    def __init__(self):
        pass

    def index(self, payload=None):
        pass
    
    def store(self, payload=None):
        pass
    
    def edit(self, payload=None):
        pass
    
    def destroy(self, payload=None):
        pass
"""

  with open(filename, "w") as f:
    f.write(template)

  print(f"{filename} Created successfully!")


def main():
  parser = argparse.ArgumentParser(description="CLI symen")

  subparsers = parser.add_subparsers(dest="cmd", required=True)

  controller_parser = subparsers.add_parser(
      "make:controller", help="Buat file controller baru"
  )
  controller_parser.add_argument("name", type=str, help="Nama controller")

  args = parser.parse_args()

  if args.cmd == "make:controller":
    make_controller(args.name)


if __name__ == "__main__":
  main()