use serde::Serialize;

#[derive(Serialize)]
struct SystemStats {
    cpu_usage: f32,
    ram_usage: f32,
}

#[derive(Serialize)]
struct TestResponse {
    status: String,
    message: String,
    code: u16,
}



// 1. method to tauri command
#[tauri::command]
fn get_stats() -> SystemStats {
    SystemStats { cpu_usage: 12.5, ram_usage: 45.8 }
}

#[tauri::command]
fn get_test() -> TestResponse {
    TestResponse { 
        status: "Success".to_string(), 
        message: "Halo bre, ini dari backend Rust murni via Tauri IPC!".to_string(), 
        code: 200 
    }
}

#[tauri::command]
fn post_test(message: String) -> Result<String, String> {
 println!("Payload dari fe diterima {}", message);

 // Verification to fe
 Ok(format!("Rust berhasil membalas : {}", message))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        // register plugin
        .invoke_handler(tauri::generate_handler![
            get_stats, 
            get_test,
            post_test
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}