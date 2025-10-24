// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn open_file(file_path: String) -> Result<String, String> {
    // TODO: 实现文件打开逻辑
    Ok(format!("文件已打开: {}", file_path))
}

#[tauri::command]
fn save_file(temp_file_id: String, save_path: String) -> Result<(), String> {
    // TODO: 实现文件保存逻辑
    println!("保存文件: {} 到 {}", temp_file_id, save_path);
    Ok(())
}

#[tauri::command]
fn parse_fountain(content: String) -> Result<Vec<String>, String> {
    // TODO: 实现Fountain解析逻辑
    Ok(vec!["解析成功".to_string()])
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            greet,
            open_file,
            save_file,
            parse_fountain
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
