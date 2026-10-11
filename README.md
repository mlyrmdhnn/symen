# Symen

[Download Symen Installer (v1.0.0)](https://github.com/mlyrmdhnn/symen/releases/download/v1.0.0/Symen-Setup-.exe)

Symen is a Windows desktop app for monitoring a computer and managing local
services. It is built with Vue, Electron, and a Python backend.

## Features

- View system information and live dashboard charts.
- Add and manage services such as Nginx, MySQL, PostgreSQL, Apache, Redis, PHP,
  and custom executables.
- Start and stop services and inspect their logs.
- Choose the app theme and edit the default service startup arguments in
  Settings.

## Development

Install Node.js 22.18 or newer (or Node.js 24.12 or newer) and Python. From the
repository root, set up the Python environment and frontend dependencies:

```powershell
py -m venv backend\venv
backend\venv\Scripts\python.exe -m pip install -r backend\requirements-build.txt
cd frontend
npm install
npm run dev
```

The Python environment is used by the backend during development. The build
requirements include PyInstaller for packaging the backend.

## Windows package

Build the unpacked Windows app from `frontend`:

```powershell
npm run package:win
```

The build output is `frontend\release-prod\win-unpacked`. Build dependencies
must first be installed in `backend\venv` as shown above. The optional Inno
Setup installer script and generated installer files are not included in this
repository.

## Configuration and user data

In a packaged app, Symen stores its preferences, service registrations, logs,
and editable `symen.conf` in Electron's per-user application data directory.
On Windows this is normally `%APPDATA%\Symen`. The Settings page displays the
exact `symen.conf` path and lets you edit service startup arguments after
confirmation. Changes apply the next time a service starts.

During development, backend data and the default service arguments file are
stored under `backend\core\db` and `backend\symen.conf`, respectively.
