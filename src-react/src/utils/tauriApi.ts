import { invoke } from '@tauri-apps/api/core';
import { TempFile, RecoveryFile, AppError, FountainDocument } from '@/types';

// Tauri命令封装
export class TauriAPI {
  // 文件操作
  static async createFile(content: string, title: string, author: string): Promise<TempFile> {
    try {
      return await invoke('create_file', { content, title, author });
    } catch (error) {
      throw this.handleError(error, 'Failed to create file');
    }
  }

  static async saveFile(id: string, content: string): Promise<TempFile> {
    try {
      return await invoke('save_file', { id, content });
    } catch (error) {
      throw this.handleError(error, 'Failed to save file');
    }
  }

  static async loadFile(id: string): Promise<TempFile> {
    try {
      return await invoke('load_file', { id });
    } catch (error) {
      throw this.handleError(error, 'Failed to load file');
    }
  }

  static async deleteFile(id: string): Promise<void> {
    try {
      await invoke('delete_file', { id });
    } catch (error) {
      throw this.handleError(error, 'Failed to delete file');
    }
  }

  // 恢复操作
  static async checkCrashRecovery(): Promise<RecoveryFile[]> {
    try {
      return await invoke('check_crash_recovery');
    } catch (error) {
      throw this.handleError(error, 'Failed to check crash recovery');
    }
  }

  static async restoreFromRecovery(recoveryId: string): Promise<RecoveryFile> {
    try {
      return await invoke('restore_from_recovery', { recoveryId });
    } catch (error) {
      throw this.handleError(error, 'Failed to restore from recovery');
    }
  }

  static async cleanupOldFiles(): Promise<number> {
    try {
      return await invoke('cleanup_old_files');
    } catch (error) {
      throw this.handleError(error, 'Failed to cleanup old files');
    }
  }

  // Fountain解析功能
  static async parseFountain(content: string): Promise<FountainDocument> {
    try {
      return await invoke('parse_fountain', { content });
    } catch (error) {
      throw this.handleError(error, 'Failed to parse Fountain content');
    }
  }

  static async validateFountain(content: string): Promise<string[]> {
    try {
      return await invoke('validate_fountain', { content });
    } catch (error) {
      throw this.handleError(error, 'Failed to validate Fountain content');
    }
  }

  // 错误处理
  private static handleError(error: any, message: string): AppError {
    console.error('Tauri API Error:', error);
    
    if (typeof error === 'string') {
      return {
        code: 'TAURI_ERROR',
        message: error,
        details: { originalMessage: message }
      };
    }
    
    return {
      code: 'UNKNOWN_ERROR',
      message: message,
      details: error
    };
  }
}

// 便捷方法
export const tauriApi = {
  // 文件操作
  createFile: TauriAPI.createFile,
  saveFile: TauriAPI.saveFile,
  loadFile: TauriAPI.loadFile,
  deleteFile: TauriAPI.deleteFile,
  
  // 恢复操作
  checkCrashRecovery: TauriAPI.checkCrashRecovery,
  restoreFromRecovery: TauriAPI.restoreFromRecovery,
  cleanupOldFiles: TauriAPI.cleanupOldFiles,
  
  // Fountain解析功能
  parseFountain: TauriAPI.parseFountain,
  validateFountain: TauriAPI.validateFountain,
};
