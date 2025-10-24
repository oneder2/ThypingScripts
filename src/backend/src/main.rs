// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::sync::Mutex;
use tauri::State;
use thypingscripts::{TempFile, TempFileMetadata};
use thypingscripts::file::FileManager;

// 应用状态
struct AppState {
    file_manager: Mutex<FileManager>,
}

// Tauri命令实现
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn create_file(
    content: String,
    title: String,
    author: String,
    state: State<AppState>,
) -> Result<TempFile, String> {
    let metadata = TempFileMetadata {
        title,
        author,
        version: "1.0".to_string(),
        word_count: content.split_whitespace().count() as u32,
        character_count: content.chars().count() as u32,
        scene_count: 0, // TODO: 实现场景计数
    };

    let file_manager = state.file_manager.lock().unwrap();
    file_manager.create_file(content, metadata).map_err(|e| e.to_string())
}

#[tauri::command]
fn save_file(
    id: String,
    content: String,
    state: State<AppState>,
) -> Result<TempFile, String> {
    let file_manager = state.file_manager.lock().unwrap();
    file_manager.save_file(&id, content).map_err(|e| e.to_string())
}

#[tauri::command]
fn load_file(
    id: String,
    state: State<AppState>,
) -> Result<TempFile, String> {
    let file_manager = state.file_manager.lock().unwrap();
    file_manager.load_file(&id).map_err(|e| e.to_string())
}

#[tauri::command]
fn delete_file(
    id: String,
    state: State<AppState>,
) -> Result<(), String> {
    let file_manager = state.file_manager.lock().unwrap();
    file_manager.delete_file(&id).map_err(|e| e.to_string())
}

#[tauri::command]
fn check_crash_recovery(
    state: State<AppState>,
) -> Result<Vec<thypingscripts::file::recovery::RecoveryFile>, String> {
    let file_manager = state.file_manager.lock().unwrap();
    file_manager.check_crash_recovery().map_err(|e| e.to_string())
}

#[tauri::command]
fn restore_from_recovery(
    recovery_id: String,
    state: State<AppState>,
) -> Result<thypingscripts::file::recovery::RecoveryFile, String> {
    let file_manager = state.file_manager.lock().unwrap();
    file_manager.restore_from_recovery(&recovery_id).map_err(|e| e.to_string())
}

#[tauri::command]
fn cleanup_old_files(
    state: State<AppState>,
) -> Result<usize, String> {
    let file_manager = state.file_manager.lock().unwrap();
    file_manager.cleanup_old_files().map_err(|e| e.to_string())
}

fn main() {
    // 初始化文件管理器
    let file_manager = FileManager::new()
        .expect("Failed to initialize file manager");

    let app_state = AppState {
        file_manager: Mutex::new(file_manager),
    };

    tauri::Builder::default()
        .manage(app_state)
        .invoke_handler(tauri::generate_handler![
            greet,
            create_file,
            save_file,
            load_file,
            delete_file,
            check_crash_recovery,
            restore_from_recovery,
            cleanup_old_files
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
