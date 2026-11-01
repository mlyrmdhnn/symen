use axum::{routing::get, Json, Router};
use serde::Serialize;
use std::thread;
use tower_http::cors::CorsLayer;

#[derive(Serialize)]
struct SystemStats {
    cpu_usage: f32,
    ram_usage: f32,
}

async fn get_stats_handler() -> Json<SystemStats> {
    Json(SystemStats {
        cpu_usage: 12.5,
        ram_usage: 45.8,
    })
}

// Testing
#[derive(Serialize)]
struct TestResponse {
    status : String, 
    message : String,
    code : u16
}

async fn test_handler() -> Json<TestResponse> {
    Json(TestResponse { status: "Success".to_string(), message: "Halo bre, ini dari backend rust Axum".to_string(), code: 200 })
}


fn start_http_server() -> Result<(), Box<dyn std::error::Error>> {
    let listener = std::net::TcpListener::bind(("127.0.0.1", 3541))?;
    listener.set_nonblocking(true)?;

    thread::Builder::new()
        .name("api-server".into())
        .spawn(move || {
            let runtime = tokio::runtime::Builder::new_multi_thread()
                .enable_all()
                .build()
                .expect("failed to start API server runtime");

            runtime.block_on(async move {
                let listener = tokio::net::TcpListener::from_std(listener)
                    .expect("failed to initialize API server listener");
                let app = Router::new()
                    .route("/api/stats", get(get_stats_handler))
                    .route("/api/test", get(test_handler))
                    .layer(CorsLayer::permissive());

                axum::serve(listener, app)
                    .await
                    .expect("API server failed");
            });
        })?;

    println!("HTTP backend running on http://127.0.0.1:3541");
    Ok(())
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|_| {
            start_http_server()?;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}



