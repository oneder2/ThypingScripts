pub mod file;
pub mod fountain;
pub mod pdf;

use std::path::PathBuf;
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

/// 临时文件管理器核心结构
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TempFileManager {
    pub base_path: PathBuf,
    pub permissions: FilePermissions,
    pub cleanup_policy: CleanupPolicy,
}

/// 文件权限配置
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FilePermissions {
    pub read: bool,
    pub write: bool,
    pub execute: bool,
}

/// 清理策略配置
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CleanupPolicy {
    pub max_age_days: u32,
    pub max_files: usize,
    pub auto_cleanup: bool,
}

/// 临时文件信息
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TempFile {
    pub id: String,
    pub content: String,
    pub save_path: Option<String>,
    pub is_saved: bool,
    pub created_at: DateTime<Utc>,
    pub modified_at: DateTime<Utc>,
    pub autosave_enabled: bool,
    pub metadata: TempFileMetadata,
}

/// 临时文件元数据
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TempFileMetadata {
    pub title: String,
    pub author: String,
    pub version: String,
    pub word_count: u32,
    pub character_count: u32,
    pub scene_count: u32,
}

impl TempFileManager {
    /// 创建新的临时文件管理器
    pub fn new() -> Result<Self, Box<dyn std::error::Error>> {
        let base_path = Self::get_temp_dir()?;
        let permissions = FilePermissions {
            read: true,
            write: true,
            execute: false,
        };
        let cleanup_policy = CleanupPolicy {
            max_age_days: 7,
            max_files: 100,
            auto_cleanup: true,
        };

        Ok(TempFileManager {
            base_path,
            permissions,
            cleanup_policy,
        })
    }

    /// 获取跨平台临时目录
    fn get_temp_dir() -> Result<PathBuf, Box<dyn std::error::Error>> {
        let temp_dir = if cfg!(target_os = "windows") {
            std::env::var("TEMP")
                .or_else(|_| std::env::var("TMP"))
                .map(|path| PathBuf::from(path).join("thypingscripts"))
        } else if cfg!(target_os = "macos") {
            Ok(dirs::home_dir()
                .unwrap_or_else(|| PathBuf::from("~"))
                .join("Library/Caches/thypingscripts"))
        } else {
            // Linux
            Ok(dirs::cache_dir()
                .unwrap_or_else(|| PathBuf::from("~/.cache"))
                .join("thypingscripts"))
        }?;

        // 确保目录存在
        std::fs::create_dir_all(&temp_dir)?;
        Ok(temp_dir)
    }

    /// 创建临时文件
    pub fn create_temp_file(&self, content: String, metadata: TempFileMetadata) -> Result<TempFile, Box<dyn std::error::Error>> {
        let id = uuid::Uuid::new_v4().to_string();
        let now = Utc::now();
        
        let temp_file = TempFile {
            id: id.clone(),
            content,
            save_path: None,
            is_saved: false,
            created_at: now,
            modified_at: now,
            autosave_enabled: true,
            metadata,
        };

        // 保存到文件系统
        self.save_temp_file(&temp_file)?;
        Ok(temp_file)
    }

    /// 保存临时文件到文件系统
    fn save_temp_file(&self, temp_file: &TempFile) -> Result<(), Box<dyn std::error::Error>> {
        let file_path = self.base_path.join(format!("{}.tmp", temp_file.id));
        let content = serde_json::to_string_pretty(temp_file)?;
        std::fs::write(file_path, content)?;
        Ok(())
    }

    /// 读取临时文件
    pub fn load_temp_file(&self, id: &str) -> Result<TempFile, Box<dyn std::error::Error>> {
        let file_path = self.base_path.join(format!("{}.tmp", id));
        let content = std::fs::read_to_string(file_path)?;
        let temp_file: TempFile = serde_json::from_str(&content)?;
        Ok(temp_file)
    }

    /// 更新临时文件内容
    pub fn update_temp_file(&self, id: &str, content: String) -> Result<TempFile, Box<dyn std::error::Error>> {
        let mut temp_file = self.load_temp_file(id)?;
        temp_file.content = content;
        temp_file.modified_at = Utc::now();
        temp_file.is_saved = false;
        
        self.save_temp_file(&temp_file)?;
        Ok(temp_file)
    }

    /// 删除临时文件
    pub fn delete_temp_file(&self, id: &str) -> Result<(), Box<dyn std::error::Error>> {
        let file_path = self.base_path.join(format!("{}.tmp", id));
        if file_path.exists() {
            std::fs::remove_file(file_path)?;
        }
        Ok(())
    }

    /// 清理过期文件
    pub fn cleanup_old_files(&self) -> Result<usize, Box<dyn std::error::Error>> {
        let mut cleaned_count = 0;
        let cutoff_time = Utc::now() - chrono::Duration::days(self.cleanup_policy.max_age_days as i64);

        if let Ok(entries) = std::fs::read_dir(&self.base_path) {
            for entry in entries {
                let entry = entry?;
                let path = entry.path();
                
                if path.extension().and_then(|s| s.to_str()) == Some("tmp") {
                    if let Ok(metadata) = entry.metadata() {
                        if let Ok(modified) = metadata.modified() {
                            let modified_time: DateTime<Utc> = modified.into();
                            if modified_time < cutoff_time {
                                std::fs::remove_file(&path)?;
                                cleaned_count += 1;
                            }
                        }
                    }
                }
            }
        }

        Ok(cleaned_count)
    }
}
