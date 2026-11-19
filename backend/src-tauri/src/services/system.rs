use serde::Serialize;
use std::sync::Mutex;
use std::thread;
use sysinfo::Disks;
use sysinfo::System;

pub struct SystemMonitorState(pub Mutex<System>);

#[derive(Serialize)]
pub struct SystemInfo {
    pub total_mb: u64,
    pub used_mb: u64,
    pub free_mb: u64,
    pub ram_percent: f32,
    pub cpu_percent: f32,
    pub cpu_cores: usize,
}

#[tauri::command]
pub fn get_system_info(state: tauri::State<'_, SystemMonitorState>) -> Result<SystemInfo, String> {
    let mut sys = state
        .0
        .lock()
        .map_err(|_| "Failed to lock system monitor state".to_string())?;

    sys.refresh_memory();
    sys.refresh_cpu_usage();

    let mut cpu_usage = sys.global_cpu_usage();
    if cpu_usage == 0.0 {
        thread::sleep(sysinfo::MINIMUM_CPU_UPDATE_INTERVAL);
        sys.refresh_cpu_usage();
        cpu_usage = sys.global_cpu_usage();
    }

    let total_bytes = sys.total_memory();
    let used_bytes = sys.used_memory();
    let free_bytes = sys.available_memory();

    let to_mb = |bytes: u64| bytes / (1024 * 1024);

    let ram_percent = if total_bytes > 0 {
        (used_bytes as f32 / total_bytes as f32) * 100.0
    } else {
        0.0
    };

    Result::Ok(SystemInfo {
        total_mb: to_mb(total_bytes),
        used_mb: to_mb(used_bytes),
        free_mb: to_mb(free_bytes),
        ram_percent: (ram_percent * 10.0).round() / 10.0,
        cpu_percent: (cpu_usage * 10.0).round() / 10.0,
        cpu_cores: sys.cpus().len(),
    })
}

#[derive(Serialize)]
pub struct DiskItem {
    pub name: String,
    pub mount_point: String,
    pub file_system: String,
    pub total_gb: f64,
    pub available_gb: f64,
    pub used_gb: f64,
}

#[derive(Serialize)]
pub struct DeviceSpecs {
    pub device_name: String,
    pub os_name: String,
    pub os_version: String,
    pub processor: String,
    pub cpu_cores: usize,
    pub total_ram_gb: f64,
    pub disks: Vec<DiskItem>,
}

#[tauri::command]
pub fn get_device_specs() -> Result<DeviceSpecs, String> {
    let mut sys = System::new().map_err(|e| format!("Failed to init sysinfo: {}", e))?;
    sys.refresh_cpu_all();
    sys.refresh_memory();

    let device_name = System::host_name().unwrap_or_else(|_| "Unknown Device".to_string());
    let os_name = System::name().unwrap_or_else(|_| "Unknown OS".to_string());
    let os_version = System::os_version().unwrap_or_default();

    let processor = sys
        .cpus()
        .first()
        .map(|cpu| cpu.brand().trim().to_string())
        .unwrap_or_else(|| "Unknown Processor".to_string());
    let cpu_cores = sys.cpus().len();

    let to_gb = |bytes: u64| ((bytes as f64 / 1_073_741_824.0) * 10.0).round() / 10.0;
    let total_ram_gb = to_gb(sys.total_memory());

    let disks_list =
        Disks::new_with_refreshed_list().map_err(|e| format!("Failed to read disks: {}", e))?;

    let disks: Vec<DiskItem> = disks_list
        .iter()
        .map(|disk| {
            let total = disk.total_space();
            let available = disk.available_space();
            let used = total.saturating_sub(available);

            DiskItem {
                name: disk.name().to_string_lossy().to_string(),
                mount_point: disk.mount_point().to_string_lossy().to_string(),
                file_system: disk.file_system().to_string_lossy().to_string(),
                total_gb: to_gb(total),
                available_gb: to_gb(available),
                used_gb: to_gb(used),
            }
        })
        .collect();

    Result::Ok(DeviceSpecs {
        device_name,
        os_name,
        os_version,
        processor,
        cpu_cores,
        total_ram_gb,
        disks,
    })
}
