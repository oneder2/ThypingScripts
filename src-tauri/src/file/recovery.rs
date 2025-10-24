use std::path::PathBuf;
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

/// 崩溃恢复服务
#[derive(Debug, Clone)]
pub struct RecoveryService {
    pub recovery_file: PathBuf,
    pub max_recovery_files: usize,
}

/// 恢复文件信息
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RecoveryFile {
    pub id: String,
    pub temp_file_id: String,
    pub created_at: DateTime<Utc>,
    pub content: String,
    pub metadata: String,
}

impl RecoveryService {
    /// 创建新的恢复服务
    pub fn new(base_path: PathBuf) -> Self {
        Self {
            recovery_file: base_path.join("crash_recovery.json"),
            max_recovery_files: 10,
        }
    }

    /// 检查崩溃恢复文件
    pub fn check_crash_recovery(&self) -> Result<Vec<RecoveryFile>, Box<dyn std::error::Error>> {
        if !self.recovery_file.exists() {
            return Ok(Vec::new());
        }

        let content = std::fs::read_to_string(&self.recovery_file)?;
        let recovery_files: Vec<RecoveryFile> = serde_json::from_str(&content)?;
        Ok(recovery_files)
    }

    /// 创建恢复文件
    pub fn create_recovery_file(
        &self,
        temp_file_id: &str,
        content: &str,
        metadata: &str,
    ) -> Result<(), Box<dyn std::error::Error>> {
        let recovery_file = RecoveryFile {
            id: uuid::Uuid::new_v4().to_string(),
            temp_file_id: temp_file_id.to_string(),
            created_at: Utc::now(),
            content: content.to_string(),
            metadata: metadata.to_string(),
        };

        // 读取现有的恢复文件
        let mut recovery_files = self.check_crash_recovery().unwrap_or_default();
        
        // 添加新的恢复文件
        recovery_files.push(recovery_file);
        
        // 限制恢复文件数量
        if recovery_files.len() > self.max_recovery_files {
            recovery_files.sort_by(|a, b| a.created_at.cmp(&b.created_at));
            recovery_files.truncate(self.max_recovery_files);
        }

        // 保存恢复文件
        let content = serde_json::to_string_pretty(&recovery_files)?;
        std::fs::write(&self.recovery_file, content)?;

        Ok(())
    }

    /// 从恢复文件恢复
    pub fn restore_from_recovery(
        &self,
        recovery_id: &str,
    ) -> Result<RecoveryFile, Box<dyn std::error::Error>> {
        let recovery_files = self.check_crash_recovery()?;
        
        for recovery_file in recovery_files {
            if recovery_file.id == recovery_id {
                return Ok(recovery_file);
            }
        }

        Err("恢复文件未找到".into())
    }

    /// 清理恢复文件
    pub fn cleanup_recovery_files(&self) -> Result<usize, Box<dyn std::error::Error>> {
        let mut recovery_files = self.check_crash_recovery()?;
        let original_count = recovery_files.len();
        
        // 按创建时间排序，保留最新的文件
        recovery_files.sort_by(|a, b| b.created_at.cmp(&a.created_at));
        recovery_files.truncate(self.max_recovery_files);
        
        // 保存清理后的恢复文件
        let content = serde_json::to_string_pretty(&recovery_files)?;
        std::fs::write(&self.recovery_file, content)?;
        
        Ok(original_count - recovery_files.len())
    }

    /// 删除特定的恢复文件
    pub fn delete_recovery_file(&self, recovery_id: &str) -> Result<(), Box<dyn std::error::Error>> {
        let mut recovery_files = self.check_crash_recovery()?;
        recovery_files.retain(|rf| rf.id != recovery_id);
        
        let content = serde_json::to_string_pretty(&recovery_files)?;
        std::fs::write(&self.recovery_file, content)?;
        
        Ok(())
    }

    /// 清理所有恢复文件
    pub fn clear_all_recovery_files(&self) -> Result<(), Box<dyn std::error::Error>> {
        if self.recovery_file.exists() {
            std::fs::remove_file(&self.recovery_file)?;
        }
        Ok(())
    }
}
