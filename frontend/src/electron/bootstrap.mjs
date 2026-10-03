import { register } from 'tsx/esm/api'

// Register tsx so Electron can import the TypeScript main process below.
register()
await import('./main.ts')
