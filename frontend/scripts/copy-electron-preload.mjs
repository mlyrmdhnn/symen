import { copyFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const frontendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outputDirectory = path.join(frontendRoot, 'dist-electron')

await mkdir(outputDirectory, { recursive: true })
await copyFile(
  path.join(frontendRoot, 'src', 'electron', 'preload.cjs'),
  path.join(outputDirectory, 'preload.cjs'),
)
