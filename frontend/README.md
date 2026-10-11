# .

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Build the Windows production package

The backend is packaged as a PyInstaller onedir executable and copied into the
Electron resources folder. Install the backend build requirements before packaging:

```powershell
..\backend\venv\Scripts\python.exe -m pip install -r ..\backend\requirements-build.txt
npm run package:win
```

This creates `frontend/release-prod/win-unpacked`. The optional Inno Setup
installer script is not included in this repository. In production, backend settings,
service data, logs, and the editable `symen.conf` are stored in Electron's
per-user application data directory; the bundled installation remains read-only.
On Windows, this is normally `%APPDATA%\Symen`. The Settings page shows the exact
`symen.conf` path and lets users edit service startup arguments after confirmation.
