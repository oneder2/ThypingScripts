use std::time::Duration;
use std::sync::Arc;
use tokio::time::interval;
use crate::{TempFile, TempFileManager};

/// 自动保存服务
#[derive(Debug, Clone)]
pub struct AutosaveService {
    pub interval: Duration,
    pub max_files: usize,
    pub cleanup_after: Duration,
}

impl AutosaveService {
    /// 创建新的自动保存服务
    pub fn new() -> Self {
        Self {
            interval: Duration::from_secs(30), // 30秒间隔
            max_files: 50,
            cleanup_after: Duration::from_secs(3600), // 1小时后清理
        }
    }

    /// 启动自动保存服务
    pub async fn start_autosave(
        &self,
        temp_file_manager: Arc<TempFileManager>,
        temp_file: TempFile,
    ) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        let mut interval_timer = interval(self.interval);
        let temp_file = temp_file;
        let mut last_content = temp_file.content.clone();

        loop {
            interval_timer.tick().await;
            
            // 检查内容是否有变更
            if temp_file.content != last_content {
                // 执行自动保存
                if let Err(e) = self.save_autosave(&temp_file_manager, &temp_file).await {
                    eprintln!("自动保存失败: {}", e);
                } else {
                    last_content = temp_file.content.clone();
                    println!("自动保存成功: {}", temp_file.id);
                }
            }
        }
    }

    /// 执行自动保存
    async fn save_autosave(
        &self,
        temp_file_manager: &TempFileManager,
        temp_file: &TempFile,
    ) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        // 创建自动保存文件
        let autosave_path = temp_file_manager.base_path.join(format!("autosave_{}.auto", temp_file.id));
        let autosave_content = serde_json::to_string_pretty(temp_file)?;
        
        // 写入自动保存文件
        tokio::fs::write(autosave_path, autosave_content).await?;
        
        // 清理旧的自动保存文件
        self.cleanup_old_autosave_files(temp_file_manager).await?;
        
        Ok(())
    }

    /// 清理旧的自动保存文件
    async fn cleanup_old_autosave_files(
        &self,
        temp_file_manager: &TempFileManager,
    ) -> Result<usize, Box<dyn std::error::Error + Send + Sync>> {
        let mut cleaned_count = 0;
        let cutoff_time = std::time::SystemTime::now() - self.cleanup_after;

        if let Ok(mut entries) = tokio::fs::read_dir(&temp_file_manager.base_path).await {
            while let Some(entry) = entries.next_entry().await? {
                let path = entry.path();
                
                if path.extension().and_then(|s| s.to_str()) == Some("auto") {
                    if let Ok(metadata) = entry.metadata().await {
                        if let Ok(modified) = metadata.modified() {
                            if modified < cutoff_time {
                                tokio::fs::remove_file(&path).await?;
                                cleaned_count += 1;
                            }
                        }
                    }
                }
            }
        }

        Ok(cleaned_count)
    }

    /// 检查是否有自动保存文件
    pub async fn check_autosave_files(
        &self,
        temp_file_manager: &TempFileManager,
    ) -> Result<Vec<String>, Box<dyn std::error::Error + Send + Sync>> {
        let mut autosave_files = Vec::new();

        if let Ok(mut entries) = tokio::fs::read_dir(&temp_file_manager.base_path).await {
            while let Some(entry) = entries.next_entry().await? {
                let path = entry.path();
                
                if path.extension().and_then(|s| s.to_str()) == Some("auto") {
                    if let Some(file_name) = path.file_stem().and_then(|s| s.to_str()) {
                        if file_name.starts_with("autosave_") {
                            let id = file_name.replace("autosave_", "");
                            autosave_files.push(id);
                        }
                    }
                }
            }
        }

        Ok(autosave_files)
    }

    /// 从自动保存文件恢复
    pub async fn restore_from_autosave(
        &self,
        temp_file_manager: &TempFileManager,
        id: &str,
    ) -> Result<TempFile, Box<dyn std::error::Error + Send + Sync>> {
        let autosave_path = temp_file_manager.base_path.join(format!("autosave_{}.auto", id));
        let content: String = tokio::fs::read_to_string(autosave_path).await?;
        let temp_file: TempFile = serde_json::from_str(&content)?;
        Ok(temp_file)
    }
}
