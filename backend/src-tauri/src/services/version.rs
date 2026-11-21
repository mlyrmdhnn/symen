use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReleaseInfo {
    pub latest_version: String,
    pub download_url: String,
    pub release_date: String,
    pub compatibility: String,
    pub about_version: Vec<String>,
}

#[tauri::command]
pub async fn get_versions() -> Result<Vec<ReleaseInfo>, String> {
    let url = "https://pub-2d96730c227e4b95b37c19eac13b91e0.r2.dev/version.json";

    let response = reqwest::get(url)
        .await
        .map_err(|e| format!("Failed to request version information: {e}"))?
        .text()
        .await
        .map_err(|e| format!("Failed to read version response: {e}"))?;

    let json: serde_json::Value = serde_json::from_str(&response)
        .map_err(|e| format!("Failed to parse version JSON: {e}"))?;

    if json.is_array() {
        return serde_json::from_value(json)
            .map_err(|e| format!("Failed to parse legacy version list: {e}"));
    }

    let version = json
        .get("version")
        .and_then(serde_json::Value::as_str)
        .ok_or_else(|| "Updater manifest is missing its version.".to_string())?;
    let platform = json
        .pointer("/platforms/windows-x86_64")
        .ok_or_else(|| "Updater manifest is missing platforms.windows-x86_64.".to_string())?;
    let download_url = platform
        .get("url")
        .and_then(serde_json::Value::as_str)
        .ok_or_else(|| "Updater manifest is missing the Windows download URL.".to_string())?;
    let release_date = json
        .get("pub_date")
        .and_then(serde_json::Value::as_str)
        .unwrap_or("Date unavailable");
    let notes = json
        .get("notes")
        .and_then(serde_json::Value::as_str)
        .unwrap_or_default()
        .lines()
        .map(str::trim)
        .filter(|note| !note.is_empty())
        .map(str::to_string)
        .collect();

    Ok(vec![ReleaseInfo {
        latest_version: version.to_string(),
        download_url: download_url.to_string(),
        release_date: release_date.to_string(),
        compatibility: "Windows x86_64".to_string(),
        about_version: notes,
    }])
}
