<p align="center">
  <img src="./backend/src-tauri/icons/128x128@2x.png" alt="Symen Logo" width="84" height="84" />
</p>

<h1 align="center">Symen</h1>

<p align="center">
  A lightweight Windows desktop app for system monitoring and local service management.
</p>

<p align="center">
  <a href="https://github.com/mlyrmdhnn/symen/releases/download/2.0.0/symen_2.0.0_x64-setup.exe">Download Symen Installer (v2.0.0)</a>
</p>

Symen is a Windows desktop application for monitoring system resources and managing local development services. Version 2 is rebuilt with **Vue 3**, **TypeScript**, and a native **Rust (Tauri v2)** backend for a smaller footprint and faster startup.

## Features

- **System Monitoring:** View real-time CPU, memory, and system metrics with live dashboard charts.
- **One-Click Service Downloader:** Download, verify, and configure PHP, Nginx, Apache, Node.js, MySQL, and PostgreSQL directly inside the app.
- **Service Lifecycle & Logs:** Start, stop, and manage local services or custom executables while inspecting live parsed logs.
- **Built-in Updater & Settings:** Check for signed releases, customize startup arguments, and switch app themes.

## Development

Install **Node.js 22.18+** (or **Node.js 24+**) and the **Rust toolchain** (`rustup`). From the repository root, install dependencies and start the Tauri development window:

```powershell
npm install
npm run tauri dev
```
