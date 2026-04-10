#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[tauri::command]
fn open_external_url(url: String) -> Result<(), String> {
  open::that(url).map_err(|e| e.to_string())
}

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![open_external_url])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
