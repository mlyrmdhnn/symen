pub mod downloader;
pub mod service;
pub mod system;
pub mod version;

pub use service::add_service;

use std::fs;
use std::path::PathBuf;
use std::sync::OnceLock;
use tauri::{AppHandle, Manager};

static APP_HANDLE: OnceLock<AppHandle> = OnceLock::new();

pub fn init_app_handle(app: &AppHandle) {
    let _ = APP_HANDLE.set(app.clone());
}

pub fn app_data_dir() -> Result<PathBuf, String> {
    let handle = APP_HANDLE
        .get()
        .ok_or_else(|| "AppHandle belum diinisialisasi".to_string())?;

    let dir = handle
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to resolve app data directory: {}", e))?;

    if !dir.exists() {
        fs::create_dir_all(&dir)
            .map_err(|e| format!("Failed to create app data directory: {}", e))?;
    }

    Ok(dir)
}
