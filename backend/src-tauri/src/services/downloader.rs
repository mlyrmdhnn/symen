use serde::{Deserialize, Serialize};
use serde_json::json;
use sha2::{Digest, Sha256};
use std::collections::HashMap;
use std::io;
use std::path::{Component, Path, PathBuf};
use std::process::Command;
use std::sync::Mutex;
use tauri::{Emitter, Manager, State};
use tokio::fs;
use tokio::io::AsyncWriteExt;
use tokio::sync::watch;

#[cfg(target_os = "windows")]
use std::os::windows::process::CommandExt;

const MANIFEST_URL: &str =
    "https://raw.githubusercontent.com/mlyrmdhnn/repo-manifest/master/manifest.json";
const ALLOWED_DOWNLOAD_HOSTS: &[&str] = &[
    "windows.php.net",
    "nodejs.org",
    "nginx.org",
    "www.apachelounge.com",
    "dev.mysql.com",
    "get.enterprisedb.com",
    "github.com",
    "objects.githubusercontent.com",
    "release-assets.githubusercontent.com",
    "cdn.mysql.com",
];

// Fallback bawaan jika user pertama kali buka aplikasi dalam kondisi offline
const BUNDLED_MANIFEST: &str = include_str!("manifest.json");

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ManifestInstance {
    pub schema_version: u32,
    pub updated_at: String,
    pub services: HashMap<String, Vec<ServiceDetail>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ServiceDetail {
    pub id: String,
    pub name: String,
    pub channel: String,
    pub version: String,
    pub url: String,
    pub sha256: Option<String>,
    pub strip_prefix: Option<String>,
    pub bin_subpath: String,
    pub executable: String,
    pub default_port: Option<u16>,
    pub needs_init: bool,
    pub vc_redist_required: bool,

    #[serde(default)]
    pub variant: Option<String>,
    #[serde(default)]
    pub recommended_for: Option<Vec<String>>,
    #[serde(default)]
    pub cli_executable: Option<String>,
    #[serde(default)]
    pub apache_module: Option<String>,
}

#[derive(Default)]
pub struct DownloadCancellationState {
    active_downloads: Mutex<HashMap<String, watch::Sender<bool>>>,
}

impl DownloadCancellationState {
    fn register(&self, key: String) -> Result<watch::Receiver<bool>, String> {
        let mut active_downloads = self
            .active_downloads
            .lock()
            .map_err(|error| format!("Failed to lock download state: {error}"))?;
        if active_downloads.contains_key(&key) {
            return Err("This service package is already downloading".to_string());
        }

        let (sender, receiver) = watch::channel(false);
        active_downloads.insert(key, sender);
        Ok(receiver)
    }

    fn cancel(&self, key: &str) -> Result<(), String> {
        let active_downloads = self
            .active_downloads
            .lock()
            .map_err(|error| format!("Failed to lock download state: {error}"))?;
        let sender = active_downloads
            .get(key)
            .ok_or_else(|| "No active download found for this service package".to_string())?;
        sender
            .send(true)
            .map_err(|error| format!("Failed to cancel service download: {error}"))
    }

    fn finish(&self, key: &str) -> Result<(), String> {
        let mut active_downloads = self
            .active_downloads
            .lock()
            .map_err(|error| format!("Failed to lock download state: {error}"))?;
        active_downloads.remove(key);
        Ok(())
    }
}

fn download_key(service_key: &str, package_id: &str) -> String {
    format!("{service_key}:{package_id}")
}

#[tauri::command]
pub fn cancel_service_package(
    cancellation: State<'_, DownloadCancellationState>,
    service_key: String,
    package_id: String,
) -> Result<(), String> {
    cancellation.cancel(&download_key(&service_key, &package_id))
}

fn is_allowed_download_url(url: &reqwest::Url) -> bool {
    url.scheme() == "https"
        && url.host_str().is_some_and(|host| {
            ALLOWED_DOWNLOAD_HOSTS.contains(&host)
                || host == "php.net"
                || host.ends_with(".php.net")
                || host == "mysql.com"
                || host.ends_with(".mysql.com")
        })
}

fn is_safe_relative_path(path: &Path) -> bool {
    !path.as_os_str().is_empty()
        && path
            .components()
            .all(|component| matches!(component, Component::Normal(_)))
}

fn emit_download_progress(
    app: &tauri::AppHandle,
    service_key: &str,
    package_id: &str,
    stage: &str,
    progress: u8,
) -> Result<(), String> {
    app.emit(
        "download-progress",
        json!({
            "service_key": service_key,
            "package_id": package_id,
            "stage": stage,
            "progress": progress,
        }),
    )
    .map_err(|error| format!("Failed to emit download progress: {error}"))
}

#[tauri::command]
pub async fn install_service_package(
    app: tauri::AppHandle,
    cancellation: State<'_, DownloadCancellationState>,
    service_key: String,
    package: ServiceDetail,
    target_path: String,
) -> Result<(), String> {
    let download_url = reqwest::Url::parse(&package.url)
        .map_err(|error| format!("Invalid package URL: {error}"))?;
    if !is_allowed_download_url(&download_url) {
        return Err("Package URL must use HTTPS and an approved download host".to_string());
    }

    let archive_name = Path::new(&package.id);
    if !is_safe_relative_path(archive_name)
        || archive_name.components().count() != 1
        || !package
            .id
            .chars()
            .all(|character| character.is_ascii_alphanumeric() || "-_.".contains(character))
        || !download_url.path().to_ascii_lowercase().ends_with(".zip")
    {
        return Err("Package ID or URL is not a valid ZIP package".to_string());
    }

    let target_path = PathBuf::from(target_path);
    if target_path.as_os_str().is_empty() {
        return Err("Installation path cannot be empty".to_string());
    }
    let bin_subpath = Path::new(&package.bin_subpath);
    if !package.bin_subpath.is_empty() && !is_safe_relative_path(bin_subpath) {
        return Err("Package binary path is invalid".to_string());
    }
    let executable = Path::new(&package.executable);
    if !is_safe_relative_path(executable) {
        return Err("Package executable path is invalid".to_string());
    }

    let expected_hash = package
        .sha256
        .as_deref()
        .ok_or_else(|| "Package manifest does not provide a SHA256 hash".to_string())?;
    if expected_hash.len() != 64 || hex::decode(expected_hash).is_err() {
        return Err("Package manifest contains an invalid SHA256 hash".to_string());
    }

    let mut default_headers = reqwest::header::HeaderMap::new();
    default_headers.insert(
        reqwest::header::USER_AGENT,
        reqwest::header::HeaderValue::from_static(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        ),
    );
    default_headers.insert(
        reqwest::header::ACCEPT,
        reqwest::header::HeaderValue::from_static(
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        ),
    );
    default_headers.insert(
        reqwest::header::HeaderName::from_static("accept-language"),
        reqwest::header::HeaderValue::from_static("en-US,en;q=0.9"),
    );
    default_headers.insert(
        reqwest::header::REFERER,
        reqwest::header::HeaderValue::from_static("https://dev.mysql.com/downloads/mysql/"),
    );

    let client = reqwest::Client::builder()
        .default_headers(default_headers)
        .cookie_store(true)
        .connect_timeout(std::time::Duration::from_secs(30))
        .redirect(reqwest::redirect::Policy::custom(|attempt| {
            if attempt.previous().len() >= 10 {
                attempt.error("too many redirects")
            } else if attempt.url().scheme() == "https" {
                attempt.follow()
            } else {
                attempt.error("download redirects must use HTTPS")
            }
        }))
        .build()
        .map_err(|error| format!("Failed to create download client: {error}"))?;

    let download_key = download_key(&service_key, &package.id);
    let mut cancellation_receiver = cancellation.register(download_key.clone())?;
    let downloads_dir = std::env::temp_dir().join("symen-downloads");
    if let Err(error) = fs::create_dir_all(&downloads_dir).await {
        cancellation.finish(&download_key)?;
        return Err(format!("Failed to create download directory: {error}"));
    }
    let archive_path = downloads_dir.join(format!(
        "{}-{}.zip",
        package.id,
        uuid::Uuid::new_v4().simple()
    ));

    let result = async {
        let response = tokio::select! {
            response = client.get(download_url).send() => {
                response.map_err(|error| format!("Failed to download package: {error}"))?
            }
            _ = cancellation_receiver.changed() => {
                return Err("Service download cancelled".to_string());
            }
        };
        if !response.status().is_success() {
            return Err(format!(
                "Package download returned HTTP status {}",
                response.status()
            ));
        }
        let total_size = response.content_length();
        let mut stream = response.bytes_stream();
        let mut archive = fs::File::create(&archive_path)
            .await
            .map_err(|error| format!("Failed to create temporary archive: {error}"))?;
        let mut hasher = Sha256::new();
        let mut downloaded = 0_u64;
        let mut last_progress = 0_u8;

        emit_download_progress(&app, &service_key, &package.id, "downloading", 0)?;
        use futures_util::StreamExt;
        loop {
            let next_chunk = tokio::select! {
                chunk = stream.next() => chunk,
                _ = cancellation_receiver.changed() => {
                    return Err("Service download cancelled".to_string());
                }
            };
            let Some(chunk) = next_chunk else {
                break;
            };
            let chunk = chunk.map_err(|error| format!("Package download failed: {error}"))?;
            archive
                .write_all(&chunk)
                .await
                .map_err(|error| format!("Failed to write package archive: {error}"))?;
            hasher.update(&chunk);
            downloaded += chunk.len() as u64;

            if let Some(total_size) = total_size {
                let progress = ((downloaded.saturating_mul(85) / total_size.max(1)).min(85)) as u8;
                if progress > last_progress {
                    emit_download_progress(
                        &app,
                        &service_key,
                        &package.id,
                        "downloading",
                        progress,
                    )?;
                    last_progress = progress;
                }
            }
        }
        if *cancellation_receiver.borrow() {
            return Err("Service download cancelled".to_string());
        }
        archive
            .flush()
            .await
            .map_err(|error| format!("Failed to flush package archive: {error}"))?;
        drop(archive);

        emit_download_progress(&app, &service_key, &package.id, "verifying", 90)?;
        let actual_hash = hex::encode(hasher.finalize());
        if !actual_hash.eq_ignore_ascii_case(expected_hash) {
            return Err(format!("SHA256 verification failed for '{}'", package.name));
        }

        if let Ok(metadata) = fs::symlink_metadata(&target_path).await {
            let remove_result = if metadata.is_dir() {
                fs::remove_dir_all(&target_path).await
            } else {
                fs::remove_file(&target_path).await
            };
            remove_result.map_err(|error| {
                format!("Failed to clean existing installation directory: {error}")
            })?;
        }
        fs::create_dir_all(&target_path)
            .await
            .map_err(|error| format!("Failed to create installation directory: {error}"))?;

        emit_download_progress(&app, &service_key, &package.id, "extracting", 95)?;
        let extraction_target = target_path.clone();
        let archive_for_extraction = archive_path.clone();
        let strip_prefix = package.strip_prefix.clone();
        tokio::task::spawn_blocking(move || {
            extract_archive(
                &archive_for_extraction,
                &extraction_target,
                strip_prefix.as_deref(),
            )
        })
        .await
        .map_err(|error| format!("Package extraction task failed: {error}"))??;

        let executable_path = target_path.join(bin_subpath).join(executable);
        if !executable_path.is_file() {
            return Err(format!(
                "Installed executable was not found: {}",
                executable_path.display()
            ));
        }
        if package.needs_init {
            let initialization_target = target_path.clone();
            let initialization_service = service_key.clone();
            tokio::task::spawn_blocking(move || {
                initialize_service_package(&initialization_service, &initialization_target)
            })
            .await
            .map_err(|error| format!("Service initialization task failed: {error}"))??;
        }

        let executable_relative_path = executable_path
            .strip_prefix(&target_path)
            .map_err(|error| format!("Installed executable path is invalid: {error}"))?
            .to_string_lossy()
            .replace('/', "\\");
        let (startup_command, stop_command) = service_commands(&service_key, &target_path);
        crate::services::service::add_service_with_stop_command(
            target_path.to_string_lossy().into_owned(),
            package.name.clone(),
            startup_command,
            executable_relative_path,
            stop_command,
        )?;

        emit_download_progress(&app, &service_key, &package.id, "done", 100)?;
        Ok(())
    }
    .await;

    if let Err(error) = fs::remove_file(&archive_path).await {
        if error.kind() != io::ErrorKind::NotFound && result.is_ok() {
            cancellation.finish(&download_key)?;
            return Err(format!(
                "Failed to remove temporary package archive: {error}"
            ));
        }
    }
    cancellation.finish(&download_key)?;

    result
}

fn service_commands(service_key: &str, target_path: &Path) -> (String, String) {
    match service_key {
        "postgresql" => {
            let data_path = target_path.join("data").to_string_lossy().into_owned();
            let log_path = target_path
                .join("postgresql.log")
                .to_string_lossy()
                .into_owned();
            (
                format!("-D \"{data_path}\" -l \"{log_path}\" start"),
                format!("-D \"{data_path}\" stop -m fast"),
            )
        }
        "mysql" => {
            let config_path = target_path.join("my.ini").to_string_lossy().into_owned();
            (format!("--defaults-file=\"{config_path}\""), String::new())
        }
        _ => (String::new(), String::new()),
    }
}

fn initialize_service_package(service_key: &str, target_path: &Path) -> Result<(), String> {
    match service_key {
        "postgresql" => {
            let data_path = target_path.join("data");
            if !data_path.exists() {
                let initdb_path = target_path.join("bin").join("initdb.exe");
                let mut command = Command::new(initdb_path);
                command.args([
                    "-D",
                    data_path.to_string_lossy().as_ref(),
                    "-U",
                    "postgres",
                    "-A",
                    "trust",
                    "--encoding=UTF8",
                ]);
                run_initialization_command(&mut command, "PostgreSQL initdb")
            } else {
                Ok(())
            }
        }
        "mysql" => {
            let data_path = target_path.join("data");
            std::fs::create_dir_all(&data_path)
                .map_err(|error| format!("Failed to create MySQL data directory: {error}"))?;

            let config_path = target_path.join("my.ini");
            let basedir = target_path.to_string_lossy().replace('\\', "/");
            let datadir = data_path.to_string_lossy().replace('\\', "/");
            let config =
                format!("[mysqld]\nbasedir=\"{basedir}\"\ndatadir=\"{datadir}\"\nport=3306\n");
            std::fs::write(&config_path, config)
                .map_err(|error| format!("Failed to write MySQL configuration: {error}"))?;

            let mut entries = std::fs::read_dir(&data_path)
                .map_err(|error| format!("Failed to inspect MySQL data directory: {error}"))?;
            if entries
                .next()
                .transpose()
                .map_err(|error| format!("Failed to inspect MySQL data directory: {error}"))?
                .is_none()
            {
                let mysqld_path = target_path.join("bin").join("mysqld.exe");
                let mut command = Command::new(mysqld_path);
                command
                    .arg(format!("--defaults-file={}", config_path.display()))
                    .arg("--initialize-insecure");
                run_initialization_command(&mut command, "MySQL initialization")?;
            }
            Ok(())
        }
        "apache" => update_apache_server_root(target_path),
        _ => Err(format!(
            "Initialization is not supported for service '{service_key}'"
        )),
    }
}

fn run_initialization_command(command: &mut Command, label: &str) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        command.creation_flags(0x08000000);
    }

    let output = command
        .output()
        .map_err(|error| format!("Failed to run {label}: {error}"))?;
    if output.status.success() {
        return Ok(());
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    let stderr = String::from_utf8_lossy(&output.stderr);
    let details = format!("{stdout}{stderr}").trim().to_string();
    Err(if details.is_empty() {
        format!("{label} failed with status {}", output.status)
    } else {
        format!("{label} failed with status {}: {details}", output.status)
    })
}

fn update_apache_server_root(target_path: &Path) -> Result<(), String> {
    let config_path = target_path.join("conf").join("httpd.conf");
    let config = std::fs::read_to_string(&config_path)
        .map_err(|error| format!("Failed to read Apache configuration: {error}"))?;
    let server_root = target_path.to_string_lossy().replace('\\', "/");
    if server_root.contains(['"', '\r', '\n']) {
        return Err("Apache installation path contains unsupported characters".to_string());
    }

    let mut found = false;
    let mut updated = String::with_capacity(config.len());
    for line in config.split_inclusive('\n') {
        let line_content = line.trim_end_matches(['\r', '\n']);
        let line_ending = &line[line_content.len()..];
        let mut words = line_content.split_whitespace();
        if words.next() == Some("Define") && words.next() == Some("SRVROOT") {
            updated.push_str(&format!("Define SRVROOT \"{server_root}\"{line_ending}"));
            found = true;
        } else {
            updated.push_str(line);
        }
    }
    if !found {
        return Err("Apache configuration does not define SRVROOT".to_string());
    }
    std::fs::write(config_path, updated)
        .map_err(|error| format!("Failed to update Apache server root: {error}"))
}

fn extract_archive(
    archive_path: &Path,
    target_path: &Path,
    strip_prefix: Option<&str>,
) -> Result<(), String> {
    use std::io::copy;
    use zip::ZipArchive;

    let strip_prefix = strip_prefix.map(Path::new);
    if let Some(prefix) = strip_prefix {
        if !is_safe_relative_path(prefix) {
            return Err("Package archive prefix is invalid".to_string());
        }
    }

    let file = std::fs::File::open(archive_path)
        .map_err(|error| format!("Failed to open package archive: {error}"))?;
    let mut archive =
        ZipArchive::new(file).map_err(|error| format!("Invalid ZIP archive: {error}"))?;
    for index in 0..archive.len() {
        let mut entry = archive
            .by_index(index)
            .map_err(|error| format!("Failed to read ZIP entry: {error}"))?;
        let archived_path = entry
            .enclosed_name()
            .ok_or_else(|| "ZIP entry has an unsafe path".to_string())?
            .to_path_buf();
        let relative_path = if let Some(prefix) = strip_prefix {
            match archived_path.strip_prefix(prefix) {
                Ok(path) => path,
                Err(_) if archived_path == prefix => Path::new(""),
                Err(_) => {
                    return Err(format!(
                        "ZIP entry is outside the expected '{}' directory",
                        prefix.display()
                    ));
                }
            }
        } else {
            archived_path.as_path()
        };
        if relative_path.as_os_str().is_empty() {
            continue;
        }
        if !relative_path
            .components()
            .all(|component| matches!(component, Component::Normal(_)))
        {
            return Err(format!(
                "ZIP entry has an unsafe extraction path: {}",
                relative_path.display()
            ));
        }

        let output_path = target_path.join(relative_path);
        if entry.is_dir() {
            std::fs::create_dir_all(&output_path)
                .map_err(|error| format!("Failed to create package directory: {error}"))?;
        } else {
            if let Some(parent) = output_path.parent() {
                std::fs::create_dir_all(parent)
                    .map_err(|error| format!("Failed to create package directory: {error}"))?;
            }
            let mut output = std::fs::File::create(&output_path)
                .map_err(|error| format!("Failed to create package file: {error}"))?;
            copy(&mut entry, &mut output)
                .map_err(|error| format!("Failed to extract package file: {error}"))?;
        }
    }
    Ok(())
}

#[tauri::command]
pub async fn get_service_manifest(app: tauri::AppHandle) -> Result<ManifestInstance, String> {
    let cache_path: PathBuf = app
        .path()
        .app_cache_dir()
        .map_err(|e| e.to_string())?
        .join("manifest.cache.json");

    let client = reqwest::Client::builder()
        .user_agent("Symen-Service-Manager/2.0")
        .timeout(std::time::Duration::from_secs(10))
        .build()
        .map_err(|e| e.to_string())?;

    if let Ok(resp) = client.get(MANIFEST_URL).send().await {
        if resp.status().is_success() {
            if let Ok(text) = resp.text().await {
                if let Ok(manifest) = serde_json::from_str::<ManifestInstance>(&text) {
                    if let Some(parent) = cache_path.parent() {
                        let _ = fs::create_dir_all(parent).await;
                    }
                    let _ = fs::write(&cache_path, &text).await;
                    return Ok(manifest);
                }
            }
        }
    }

    if let Ok(cached) = fs::read_to_string(&cache_path).await {
        if let Ok(manifest) = serde_json::from_str::<ManifestInstance>(&cached) {
            return Ok(manifest);
        }
    }

    serde_json::from_str::<ManifestInstance>(BUNDLED_MANIFEST)
        .map_err(|e| format!("Failed to parse bundled manifest: {e}"))
}

#[cfg(test)]
mod tests {
    use super::{extract_archive, is_allowed_download_url};
    use std::io::{Cursor, Write};
    use std::path::Path;
    use uuid::Uuid;
    use zip::ZipWriter;
    use zip::write::SimpleFileOptions;

    fn write_archive(entries: &[(&str, &[u8])], path: &Path) {
        let mut writer = ZipWriter::new(Cursor::new(Vec::new()));
        for (name, contents) in entries {
            writer
                .start_file(name, SimpleFileOptions::default())
                .expect("ZIP entry should be created");
            writer
                .write_all(contents)
                .expect("ZIP entry should be written");
        }
        let archive = writer.finish().expect("ZIP archive should be finalized");
        std::fs::write(path, archive.into_inner()).expect("ZIP archive should be saved");
    }

    #[test]
    fn accepts_only_https_urls_on_exactly_allowed_hosts() {
        assert!(is_allowed_download_url(
            &reqwest::Url::parse("https://windows.php.net/package.zip").unwrap()
        ));
        assert!(is_allowed_download_url(
            &reqwest::Url::parse("https://downloads.php.net/package.zip").unwrap()
        ));
        assert!(is_allowed_download_url(
            &reqwest::Url::parse("https://cdn.mysql.com/package.zip").unwrap()
        ));
        assert!(!is_allowed_download_url(
            &reqwest::Url::parse("http://windows.php.net/package.zip").unwrap()
        ));
        assert!(!is_allowed_download_url(
            &reqwest::Url::parse("https://evil-windows.php.net/package.zip").unwrap()
        ));
    }

    #[test]
    fn extracts_under_strip_prefix_without_traversal() {
        let root = std::env::temp_dir().join(format!("symen-zip-{}", Uuid::new_v4()));
        let archive_path = root.join("package.zip");
        let target_path = root.join("installed");
        std::fs::create_dir_all(&root).expect("temporary directory should be created");
        write_archive(&[("Apache24/bin/httpd.exe", b"binary")], &archive_path);

        extract_archive(&archive_path, &target_path, Some("Apache24"))
            .expect("archive should extract with its prefix stripped");

        assert_eq!(
            std::fs::read(target_path.join("bin/httpd.exe"))
                .expect("extracted executable should exist"),
            b"binary"
        );
        std::fs::remove_dir_all(root).expect("temporary directory should be removed");
    }

    #[test]
    fn rejects_zip_slip_entries() {
        let root = std::env::temp_dir().join(format!("symen-zip-{}", Uuid::new_v4()));
        let archive_path = root.join("package.zip");
        let target_path = root.join("installed");
        std::fs::create_dir_all(&root).expect("temporary directory should be created");
        write_archive(&[("../outside.exe", b"malicious")], &archive_path);

        assert!(extract_archive(&archive_path, &target_path, None).is_err());
        assert!(!root.join("outside.exe").exists());
        std::fs::remove_dir_all(root).expect("temporary directory should be removed");
    }
}
