use std::collections::HashMap;

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdaterManifest {
    pub version: String,
    pub notes: Option<String>,
    pub pub_date: Option<String>,
    pub platforms: HashMap<String, PlatformUpdate>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlatformUpdate {
    pub signature: String,
    pub url: String,
}

#[tauri::command]
pub async fn get_versions() -> Result<UpdaterManifest, String> {
    let url = "https://symen.mulyaranadhan.workers.dev/version.json";

    let response = reqwest::get(url)
        .await
        .map_err(|e| format!("Failed to request version information: {e}"))?
        .text()
        .await
        .map_err(|e| format!("Failed to read version response: {e}"))?;

    serde_json::from_str(&response)
        .map_err(|e| format!("Failed to parse Tauri updater manifest: {e}"))
}

#[cfg(test)]
mod tests {
    use super::UpdaterManifest;

    #[test]
    fn deserializes_tauri_v2_updater_manifest() {
        let json = r#"{
            "version": "2.0.0",
            "notes": "- Modern and cleaner user interface\n- Added initial setup layer",
            "pub_date": "2026-11-22T13:46:00+07:00",
            "platforms": {
                "windows-x86_64": {
                    "signature": "signature",
                    "url": "https://example.com/symen-setup.exe"
                }
            }
        }"#;

        let manifest: UpdaterManifest = serde_json::from_str(json).unwrap();

        assert_eq!(manifest.version, "2.0.0");
        assert_eq!(
            manifest.notes.as_deref(),
            Some("- Modern and cleaner user interface\n- Added initial setup layer")
        );
        assert_eq!(
            manifest.pub_date.as_deref(),
            Some("2026-11-22T13:46:00+07:00")
        );
        let windows = manifest.platforms.get("windows-x86_64").unwrap();
        assert_eq!(windows.signature, "signature");
        assert_eq!(windows.url, "https://example.com/symen-setup.exe");
    }
}
