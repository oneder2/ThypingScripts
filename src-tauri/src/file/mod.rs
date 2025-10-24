pub mod autosave;
pub mod recovery;

use crate::TempFile;
use std::path::PathBuf;
use std::fs;
use std::io::{self, Write, Read};
use chrono::Utc;
use uuid::Uuid;
use dirs;

/// 临时文件管理器
pub struct TempFileManager {
    pub base_path: PathBuf,
}

impl TempFileManager {
    pub fn new() -> Result<Self, io::Error> {
        let base_path = Self::get_temp_dir()?;
        if !base_path.exists() {
            fs::create_dir_all(&base_path)?;
        }
        Ok(Self { base_path })
    }

    #[cfg(target_os = "windows")]
    fn get_temp_dir() -> Result<PathBuf, io::Error> {
        let mut path = dirs::temp_dir().ok_or_else(|| io::Error::new(io::ErrorKind::NotFound, "Temp directory not found"))?;
        path.push("thypingscripts");
        Ok(path)
    }

    #[cfg(target_os = "macos")]
    fn get_temp_dir() -> Result<PathBuf, io::Error> {
        let mut path = dirs::cache_dir().ok_or_else(|| io::Error::new(io::ErrorKind::NotFound, "Cache directory not found"))?;
        path.push("thypingscripts");
        Ok(path)
    }

    #[cfg(target_os = "linux")]
    fn get_temp_dir() -> Result<PathBuf, io::Error> {
        let mut path = dirs::cache_dir().ok_or_else(|| io::Error::new(io::ErrorKind::NotFound, "Cache directory not found"))?;
        path.push("thypingscripts");
        Ok(path)
    }

    pub fn create_temp_file(&self, content: String, metadata: crate::TempFileMetadata) -> Result<crate::TempFile, io::Error> {
        let id = Uuid::new_v4().to_string();
        let file_path = self.base_path.join(format!("{}.tmp", id));
        let mut file = fs::File::create(&file_path)?;
        file.write_all(content.as_bytes())?;

        let now = Utc::now();
        Ok(crate::TempFile {
            id,
            path: file_path,
            content,
            created_at: now,
            last_modified: now,
            metadata,
        })
    }

    pub fn update_temp_file(&self, id: &str, new_content: String) -> Result<crate::TempFile, io::Error> {
        let file_path = self.base_path.join(format!("{}.tmp", id));
        fs::write(&file_path, new_content.as_bytes())?;

        let mut temp_file = self.load_temp_file(id)?;
        temp_file.content = new_content;
        temp_file.last_modified = Utc::now();
        Ok(temp_file)
    }

    pub fn load_temp_file(&self, id: &str) -> Result<crate::TempFile, io::Error> {
        let file_path = self.base_path.join(format!("{}.tmp", id));
        let mut file = fs::File::open(&file_path)?;
        let mut content = String::new();
        file.read_to_string(&mut content)?;

        // TODO: 从元数据文件读取实际元数据
        let metadata = crate::TempFileMetadata {
            title: "Untitled".to_string(),
            author: "Unknown".to_string(),
            version: "1.0".to_string(),
            word_count: content.split_whitespace().count() as u32,
            character_count: content.chars().count() as u32,
            scene_count: 0,
        };
        let now = Utc::now();
        Ok(crate::TempFile {
            id: id.to_string(),
            path: file_path,
            content,
            created_at: now, // Placeholder
            last_modified: now,
            metadata,
        })
    }

    pub fn delete_temp_file(&self, id: &str) -> Result<(), io::Error> {
        let file_path = self.base_path.join(format!("{}.tmp", id));
        fs::remove_file(&file_path)
    }

    pub fn cleanup_old_files(&self) -> Result<usize, io::Error> {
        // TODO: 实现清理逻辑
        Ok(0)
    }
}

/// 文件管理服务
pub struct FileManager {
    temp_file_manager: TempFileManager,
    autosave_service: autosave::AutosaveService,
    recovery_service: recovery::RecoveryService,
}

impl FileManager {
    /// 创建新的文件管理器
    pub fn new() -> Result<Self, Box<dyn std::error::Error>> {
        let temp_file_manager = TempFileManager::new()?;
        let autosave_service = autosave::AutosaveService::new();
        let recovery_service = recovery::RecoveryService::new(temp_file_manager.base_path.clone());

        Ok(FileManager {
            temp_file_manager,
            autosave_service,
            recovery_service,
        })
    }

    /// 创建新文件
    pub fn create_file(&self, content: String, metadata: crate::TempFileMetadata) -> Result<TempFile, Box<dyn std::error::Error>> {
        Ok(self.temp_file_manager.create_temp_file(content, metadata)?)
    }

    /// 保存文件
    pub fn save_file(&self, id: &str, content: String) -> Result<TempFile, Box<dyn std::error::Error>> {
        Ok(self.temp_file_manager.update_temp_file(id, content)?)
    }

    /// 加载文件
    pub fn load_file(&self, id: &str) -> Result<TempFile, Box<dyn std::error::Error>> {
        Ok(self.temp_file_manager.load_temp_file(id)?)
    }

    /// 删除文件
    pub fn delete_file(&self, id: &str) -> Result<(), Box<dyn std::error::Error>> {
        Ok(self.temp_file_manager.delete_temp_file(id)?)
    }

    /// 检查崩溃恢复
    pub fn check_crash_recovery(&self) -> Result<Vec<recovery::RecoveryFile>, Box<dyn std::error::Error>> {
        self.recovery_service.check_crash_recovery()
    }

    /// 创建恢复文件
    pub fn create_recovery_file(&self, temp_file_id: &str, content: &str, metadata: &str) -> Result<(), Box<dyn std::error::Error>> {
        self.recovery_service.create_recovery_file(temp_file_id, content, metadata)
    }

    /// 从恢复文件恢复
    pub fn restore_from_recovery(&self, recovery_id: &str) -> Result<recovery::RecoveryFile, Box<dyn std::error::Error>> {
        self.recovery_service.restore_from_recovery(recovery_id)
    }

    /// 清理过期文件
    pub fn cleanup_old_files(&self) -> Result<usize, Box<dyn std::error::Error>> {
        Ok(self.temp_file_manager.cleanup_old_files()?)
    }
}
