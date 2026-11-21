pub mod services;
use std::sync::Mutex;
use sysinfo::System;

use services::downloader::{
    DownloadCancellationState, cancel_service_package, get_service_manifest,
    install_service_package,
};
use services::service::{
    add_service, delete_service, edit_name, edit_service, get_name, get_service_logs, service_all,
    start_service, stop_service,
};
use services::system::{SystemMonitorState, get_device_specs, get_system_info};
use services::version::get_versions;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let mut sys = System::new().expect("Failed initializrd sysinfo");
    sys.refresh_cpu_usage();

    tauri::Builder::default()
        .manage(SystemMonitorState(Mutex::new(sys)))
        .manage(DownloadCancellationState::default())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .invoke_handler(tauri::generate_handler![
            add_service,
            service_all,
            get_service_logs,
            edit_service,
            delete_service,
            start_service,
            stop_service,
            get_system_info,
            get_device_specs,
            edit_name,
            get_name,
            get_service_manifest,
            install_service_package,
            cancel_service_package,
            get_versions
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
