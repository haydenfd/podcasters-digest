mod commands;

use commands::{fetch_url, get_api_key, set_api_key, summarize};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            fetch_url,
            summarize,
            get_api_key,
            set_api_key
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
