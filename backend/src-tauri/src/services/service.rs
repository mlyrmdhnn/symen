use serde::{Deserialize, Serialize};
use serde_json::json;
use std::fs::{self, File, OpenOptions};
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};
use std::thread;
use std::time::Duration;
use uuid::Uuid;

fn get_log_file_path(id: &str) -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("src")
        .join("services")
        .join("logs")
        .join(format!("{}.log", id))
}

fn open_log_file(log_path: &Path) -> Result<File, String> {
    if let Some(parent) = log_path.parent() {
        fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create logs directory: {}", e))?;
    }

    OpenOptions::new()
        .create(true)
        .append(true)
        .open(log_path)
        .map_err(|e| format!("Failed to open log file: {}", e))
}

fn remove_log_file(log_path: &Path) -> Result<(), String> {
    match fs::remove_file(log_path) {
        Ok(()) => Ok(()),
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => Ok(()),
        Err(error) => Err(format!("Failed to delete service log: {}", error)),
    }
}

fn startup_failure_message(
    service_name: &str,
    exit_status: &str,
    log_path: &Path,
    log_start: u64,
) -> Result<String, String> {
    let log = fs::read(log_path).map_err(|e| format!("Failed to read service log: {}", e))?;
    let log_start = usize::try_from(log_start)
        .map_err(|e| format!("Failed to locate startup log output: {}", e))?
        .min(log.len());
    let output = String::from_utf8_lossy(&log[log_start..]);
    let output = output.trim();

    if output.is_empty() {
        Ok(format!(
            "Service '{}' exited during startup with status {}",
            service_name, exit_status
        ))
    } else {
        Ok(format!(
            "Service '{}' exited during startup with status {}:\n{}",
            service_name, exit_status, output
        ))
    }
}

#[cfg(target_os = "windows")]
use std::os::windows::process::CommandExt;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ServicesDB {
    pub id: String,
    pub executable: String,
    pub is_run: bool,
    pub name: String,
    pub optional_command: String,
    pub path: String,
    pub pid: u32,
    pub port: u32,
}

// Get All Service
#[tauri::command]
pub fn service_all() -> Result<Vec<ServicesDB>, String> {
    let db_path = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("src")
        .join("services")
        .join("services.json");

    if !Path::new(&db_path).exists() {
        return Ok(Vec::new());
    }
    let data =
        fs::read_to_string(db_path).map_err(|e| format!("Gagal membaca services : {}", e))?;

    let result: Vec<ServicesDB> =
        serde_json::from_str(&data).map_err(|e| format!("Gagal parsing services {}", e))?;

    Ok(result)
}

#[tauri::command]
pub fn add_service(
    path: String,
    name: String,
    command: String,
    executable: String,
) -> Result<(), String> {
    let file_path = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("src")
        .join("services")
        .join("services.json");

    let content = match fs::read_to_string(&file_path) {
        Ok(content) => content,
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => "[]".to_string(),
        Err(error) => return Err(format!("Failed to read services: {error}")),
    };

    let mut json_data: serde_json::Value = serde_json::from_str(&content)
        .map_err(|error| format!("Failed to parse services: {error}"))?;

    let id = Uuid::new_v4().simple().to_string();

    let services = json_data
        .as_array_mut()
        .ok_or_else(|| "Services data must be a JSON array".to_string())?;

    let validated_data: Vec<ServicesDB> =
        serde_json::from_str(&content).map_err(|e| format!("Failed parsing data : {}", e))?;

    if !content.is_empty()
        && let Some(existing) = validated_data
            .iter()
            .find(|s| s.path == path || s.executable == executable)
    {
        return Err(format!("Service '{}' already exists", existing.name));
    }

    services.push(json!({
        "id": id,
        "name" : name,
        "executable" : executable,
        "path" : path,
        "port" : 0,
        "pid" : 0,
        "optional_command" : command,
        "is_run" : false
    }));

    let content = serde_json::to_string_pretty(&json_data)
        .map_err(|error| format!("Failed to serialize services: {error}"))?;
    fs::write(file_path, content).map_err(|error| format!("Failed to save services: {error}"))?;
    Ok(())
}

#[tauri::command]
pub fn edit_service(updated_service: ServicesDB) -> Result<(), String> {
    let db_path = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("src")
        .join("services")
        .join("services.json");

    let data = fs::read_to_string(&db_path).map_err(|e| format!("Failed read services: {}", e))?;

    let mut services: Vec<ServicesDB> =
        serde_json::from_str(&data).map_err(|e| format!("Failed parsing data : {}", e))?;

    if let Some(target) = services.iter_mut().find(|s| s.id == updated_service.id) {
        *target = updated_service.clone();
    } else {
        return Err(format!(
            "Service with name : '{}' not found",
            updated_service.name
        ));
    }

    let new_json = serde_json::to_string_pretty(&services)
        .map_err(|e| format!("Gagal serialize JSON: {}", e))?;

    fs::write(&db_path, new_json).map_err(|e| format!("Gagal menyimpan ke file: {}", e))?;

    Ok(())
}

#[tauri::command]
pub fn delete_service(id: String) -> Result<(), String> {
    let db_path = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("src")
        .join("services")
        .join("services.json");

    let data = fs::read_to_string(&db_path)
        .map_err(|e| format!("Failed to load services data : {}", e))?;

    let mut services: Vec<ServicesDB> = serde_json::from_str(&data).map_err(|e| e.to_string())?;

    let early = services.len();

    services.retain(|s| s.id != id);

    if services.len() == early {
        return Err(format!("Could not found services ID : {}", id));
    }

    let new_json = serde_json::to_string_pretty(&services).map_err(|e| e.to_string())?;
    fs::write(&db_path, &new_json).map_err(|e| e.to_string())?;
    remove_log_file(&get_log_file_path(&id))?;

    Ok(())
}

// fn write_log() {}

#[tauri::command]
pub fn start_service(id: String) -> Result<u32, String> {
    let db_path = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("src")
        .join("services")
        .join("services.json");

    let data =
        fs::read_to_string(&db_path).map_err(|e| format!("Failed to read services: {}", e))?;

    let mut services: Vec<ServicesDB> =
        serde_json::from_str(&data).map_err(|e| format!("Failed parsing data: {}", e))?;

    let target = services
        .iter_mut()
        .find(|s| s.id == id)
        .ok_or_else(|| "Service not found".to_string())?;

    if target.is_run {
        return Err(format!("Service '{}' is already running", target.name));
    }

    let log_path = get_log_file_path(&target.id);
    let stdout_file = open_log_file(&log_path)?;

    let stderr_file = stdout_file
        .try_clone()
        .map_err(|e| format!("Failed to clone log file handle: {}", e))?;
    let log_start = stdout_file
        .metadata()
        .map_err(|e| format!("Failed to read log file metadata: {}", e))?
        .len();

    let exe_path = PathBuf::from(&target.path).join(&target.executable);

    let mut cmd = Command::new(&exe_path);

    cmd.current_dir(&target.path)
        .stdout(Stdio::from(stdout_file))
        .stderr(Stdio::from(stderr_file));

    if !target.optional_command.trim().is_empty() {
        let args: Vec<&str> = target.optional_command.split_whitespace().collect();
        cmd.args(args);
    }

    #[cfg(target_os = "windows")]
    {
        cmd.creation_flags(0x08000000);
    }

    let mut child = cmd
        .spawn()
        .map_err(|e| format!("Failed to start '{}': {}", target.name, e))?;

    let pid = child.id();

    thread::sleep(Duration::from_millis(500));

    if let Some(status) = child
        .try_wait()
        .map_err(|e| format!("Failed to check '{}' startup: {}", target.name, e))?
    {
        return Err(startup_failure_message(
            &target.name,
            &status.to_string(),
            &log_path,
            log_start,
        )?);
    }

    let port = detect_port_for_pid_tree(pid).unwrap_or(0);

    target.pid = pid;
    target.port = port as u32;
    target.is_run = true;

    let new_json = serde_json::to_string_pretty(&services)
        .map_err(|e| format!("Failed serialize JSON: {}", e))?;

    fs::write(&db_path, new_json).map_err(|e| format!("Failed save to file: {}", e))?;

    Ok(pid)
}

fn detect_port_for_pid_tree(root_pid: u32) -> Option<u16> {
    let mut target_pids = vec![root_pid.to_string()];

    #[cfg(target_os = "windows")]
    {
        let mut ps_cmd = Command::new("powershell");
        ps_cmd
            .args([
                "-NoProfile",
                "-Command",
                &format!(
                    "Get-CimInstance Win32_Process -Filter \"ParentProcessId={}\" | Select-Object -ExpandProperty ProcessId",
                    root_pid
                ),
            ])
            .creation_flags(0x08000000);

        if let Ok(out) = ps_cmd.output() {
            let stdout = String::from_utf8_lossy(&out.stdout);
            for line in stdout.lines() {
                let child_pid = line.trim();
                if !child_pid.is_empty() {
                    target_pids.push(child_pid.to_string());
                }
            }
        }
    }

    // Cek port LISTENING di netstat yang cocok dengan salah satu PID di atas
    let mut netstat = Command::new("netstat");
    netstat.args(["-ano", "-p", "TCP"]);

    #[cfg(target_os = "windows")]
    {
        netstat.creation_flags(0x08000000);
    }

    let output = netstat.output().ok()?;
    let stdout = String::from_utf8_lossy(&output.stdout);

    for line in stdout.lines() {
        let parts: Vec<&str> = line.split_whitespace().collect();
        // Format baris: TCP    0.0.0.0:8080    0.0.0.0:0    LISTENING    12345
        if parts.len() >= 5
            && parts[3] == "LISTENING"
            && target_pids.contains(&parts[4].to_string())
        {
            if let Some(port_str) = parts[1].rsplit(':').next() {
                if let Ok(port) = port_str.parse::<u16>() {
                    return Some(port);
                }
            }
        }
    }

    None
}

#[tauri::command]
pub fn stop_service(pid: u32) -> Result<(), String> {
    let db_path = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("src")
        .join("services")
        .join("services.json");

    let data =
        fs::read_to_string(&db_path).map_err(|e| format!("Failed to read services: {}", e))?;

    let mut services: Vec<ServicesDB> =
        serde_json::from_str(&data).map_err(|e| format!("Failed parsing data: {}", e))?;

    let target = services
        .iter_mut()
        .find(|s| s.pid as u32 == pid)
        .ok_or_else(|| format!("Service with PID {} not found", pid))?;

    if pid > 0 {
        let mut cmd = Command::new("taskkill");
        cmd.args(["/F", "/IM", &target.executable.to_string()]);

        #[cfg(target_os = "windows")]
        {
            cmd.creation_flags(0x08000000);
        }

        let output = cmd
            .output()
            .map_err(|e| format!("Failed to execute taskkill: {}", e))?;

        if !output.status.success() {
            let err_msg = String::from_utf8_lossy(&output.stderr);
            eprintln!("Warning taskkill PID {}: {}", pid, err_msg);
        }
    }

    target.pid = 0;
    target.port = 0;
    target.is_run = false;

    let new_json = serde_json::to_string_pretty(&services)
        .map_err(|e| format!("Failed to serialize JSON: {}", e))?;

    fs::write(&db_path, new_json).map_err(|e| format!("Failed to save services: {}", e))?;

    Ok(())
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Conf {
    id: i32,
    is_early: bool,
    name: String,
}

#[tauri::command]
pub fn edit_name(name: String) -> Result<(), String> {
    let name = name.trim();
    if name.is_empty() {
        return Err("Name cannot be empty".to_string());
    }

    let file_path = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("src")
        .join("services")
        .join("config.json");

    let data = fs::read_to_string(&file_path).map_err(|e| format!("Failed read conf: {}", e))?;

    let mut conf: Vec<Conf> =
        serde_json::from_str(&data).map_err(|e| format!("Failed parsing data : {}", e))?;

    let conf_update = Conf {
        id: 1,
        is_early: false,
        name: name.to_string(),
    };

    if let Some(target) = conf.iter_mut().find(|s| s.id == 1) {
        *target = conf_update.clone();
    } else {
        return Err(format!("Cannot update name"));
    }

    let new_json =
        serde_json::to_string_pretty(&conf).map_err(|e| format!("Gagal serialize JSON: {}", e))?;

    fs::write(&file_path, new_json).map_err(|e| format!("Gagal menyimpan ke file: {}", e))?;

    Ok(())
}

#[tauri::command]
pub fn get_name() -> Result<Option<Conf>, String> {
    let file_path = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("src")
        .join("services")
        .join("config.json");

    if !Path::new(&file_path).exists() {
        return Ok(None);
    }

    let data = fs::read_to_string(file_path).map_err(|e| format!("Gagal membaca config: {}", e))?;

    let result: Vec<Conf> =
        serde_json::from_str(&data).map_err(|e| format!("Gagal parsing config: {}", e))?;

    Ok(result.into_iter().next())
}

#[cfg(test)]
mod tests {
    use super::{open_log_file, remove_log_file, startup_failure_message};
    use std::fs;
    use std::io::Write;
    use uuid::Uuid;

    #[test]
    fn creates_log_file_and_preserves_previous_output() {
        let log_dir = std::env::temp_dir().join(format!("symen-logs-{}", Uuid::new_v4()));
        let log_path = log_dir.join("logs").join("service-id.log");

        {
            let mut log_file = open_log_file(&log_path).expect("log file should be created");
            writeln!(log_file, "first run").expect("first log write should succeed");
        }

        assert!(log_path.is_file());

        {
            let mut log_file = open_log_file(&log_path).expect("existing log file should open");
            writeln!(log_file, "second run").expect("second log write should succeed");
        }

        let contents = fs::read_to_string(&log_path).expect("log file should be readable");
        assert_eq!(contents, "first run\nsecond run\n");

        fs::remove_dir_all(log_dir).expect("temporary log directory should be removed");
    }

    #[test]
    fn startup_failure_includes_only_current_run_log_output() {
        let log_dir = std::env::temp_dir().join(format!("symen-logs-{}", Uuid::new_v4()));
        let log_path = log_dir.join("service-id.log");
        let previous_output = b"previous run output\n";
        let current_output = b"configuration error\n";
        fs::create_dir_all(&log_dir).expect("temporary log directory should be created");
        fs::write(
            &log_path,
            [previous_output.as_slice(), current_output.as_slice()].concat(),
        )
        .expect("log file should be written");

        let message = startup_failure_message(
            "Example",
            "exit code: 1",
            &log_path,
            previous_output.len() as u64,
        )
        .expect("startup failure should include log output");

        assert!(message.contains("configuration error"));
        assert!(!message.contains("previous run output"));
        fs::remove_dir_all(log_dir).expect("temporary log directory should be removed");
    }

    #[test]
    fn removes_existing_log_and_ignores_missing_log() {
        let log_dir = std::env::temp_dir().join(format!("symen-logs-{}", Uuid::new_v4()));
        let log_path = log_dir.join("service-id.log");
        fs::create_dir_all(&log_dir).expect("temporary log directory should be created");
        fs::write(&log_path, "service output").expect("log file should be written");

        remove_log_file(&log_path).expect("existing log file should be removed");
        assert!(!log_path.exists());
        remove_log_file(&log_path).expect("missing log file should be ignored");

        fs::remove_dir_all(log_dir).expect("temporary log directory should be removed");
    }
}
