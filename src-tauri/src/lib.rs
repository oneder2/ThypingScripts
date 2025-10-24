pub mod file;
pub mod fountain;
pub mod pdf;

use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use chrono::{DateTime, Utc};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TempFileMetadata {
    pub title: String,
    pub author: String,
    pub version: String,
    pub word_count: u32,
    pub character_count: u32,
    pub scene_count: u32,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TempFile {
    pub id: String,
    pub path: PathBuf,
    pub content: String,
    pub created_at: DateTime<Utc>,
    pub last_modified: DateTime<Utc>,
    pub metadata: TempFileMetadata,
}

#[derive(Debug, Serialize, Deserialize, Clone, Copy)]
pub enum FilePermissions {
    ReadOnly,
    ReadWrite,
}

#[derive(Debug, Serialize, Deserialize, Clone, Copy)]
pub enum CleanupPolicy {
    OnAppExit,
    AfterDuration(u64), // Duration in seconds
    Manual,
}
