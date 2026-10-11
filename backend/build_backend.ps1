$ErrorActionPreference = "Stop"

$BackendRoot = $PSScriptRoot
$Python = Join-Path $BackendRoot "venv\Scripts\python.exe"

if (-not (Test-Path $Python)) {
    throw "Backend virtual environment not found: $Python"
}

& $Python -m PyInstaller --version
if ($LASTEXITCODE -ne 0) {
    throw "Backend build dependencies are missing. Install them with: $Python -m pip install -r $(Join-Path $BackendRoot 'requirements-build.txt')"
}

$BuildDirectory = Join-Path $BackendRoot "build"
New-Item -ItemType Directory -Force -Path $BuildDirectory | Out-Null

$Arguments = @(
    "--noconfirm",
    "--clean",
    "--onedir",
    "--console",
    "--name", "symen-backend",
    "--distpath", (Join-Path $BackendRoot "dist"),
    "--workpath", $BuildDirectory,
    "--specpath", $BuildDirectory,
    "--add-data", "$(Join-Path $BackendRoot 'symen.conf');.",
    "--collect-submodules", "api",
    "--collect-submodules", "controller",
    "--collect-submodules", "core",
    (Join-Path $BackendRoot "main.py")
)

Push-Location $BackendRoot
try {
    & $Python -m PyInstaller @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw "PyInstaller failed with exit code $LASTEXITCODE"
    }
}
finally {
    Pop-Location
}
