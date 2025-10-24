pub mod autosave;
pub mod recovery;

use std::path::PathBuf;
use crate::{TempFile, TempFileManager};

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
        self.temp_file_manager.create_temp_file(content, metadata)
    }

    /// 保存文件
    pub fn save_file(&self, id: &str, content: String) -> Result<TempFile, Box<dyn std::error::Error>> {
        self.temp_file_manager.update_temp_file(id, content)
    }

    /// 加载文件
    pub fn load_file(&self, id: &str) -> Result<TempFile, Box<dyn std::error::Error>> {
        self.temp_file_manager.load_temp_file(id)
    }

    /// 删除文件
    pub fn delete_file(&self, id: &str) -> Result<(), Box<dyn std::error::Error>> {
        self.temp_file_manager.delete_temp_file(id)
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
        self.temp_file_manager.cleanup_old_files()
    }
}
