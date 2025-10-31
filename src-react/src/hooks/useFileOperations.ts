import { useCallback } from 'react';
import { useAppStore } from '@/stores/useAppStore';
import { tauriApi } from '@/utils/tauriApi';
import { TempFile, AppError } from '@/types';

// 定义严格的错误类型
interface FileOperationError extends AppError {
  code: 'FILE_NOT_FOUND' | 'PERMISSION_DENIED' | 'NETWORK_ERROR' | 'VALIDATION_ERROR' | 'UNKNOWN_ERROR';
  message: string;
  details?: Record<string, unknown>;
}

// 错误处理函数
const handleFileError = (error: unknown, operation: string): FileOperationError => {
  console.error(`File operation failed (${operation}):`, error);
  
  if (typeof error === 'string') {
    return {
      code: 'UNKNOWN_ERROR',
      message: error,
      details: { operation }
    };
  }
  
  if (error && typeof error === 'object') {
    const err = error as any;
    
    // 检查是否是Tauri API错误
    if (err.code) {
      return {
        code: err.code,
        message: err.message || 'Unknown error',
        details: { ...err.details, operation }
      };
    }
    
    // 检查是否是网络错误
    if (err.message && err.message.includes('network')) {
      return {
        code: 'NETWORK_ERROR',
        message: 'Network connection failed',
        details: { originalError: err, operation }
      };
    }
    
    // 检查是否是权限错误
    if (err.message && err.message.includes('permission')) {
      return {
        code: 'PERMISSION_DENIED',
        message: 'Permission denied',
        details: { originalError: err, operation }
      };
    }
  }
  
  return {
    code: 'UNKNOWN_ERROR',
    message: `Failed to ${operation}`,
    details: { originalError: error, operation }
  };
};

export const useFileOperations = () => {
  const {
    file,
    editor,
    setCurrentFile,
    setModified,
    setSaving,
    setError,
    updateContent,
  } = useAppStore();

  // 创建新文件
  const createNewFile = useCallback(async (title: string = 'Untitled', author: string = 'Unknown') => {
    try {
      setSaving(true);
      setError(null);
      
      // 验证输入
      if (!title.trim()) {
        throw handleFileError('Title cannot be empty', 'create file');
      }
      
      const newFile = await tauriApi.createFile(editor.content, title, author);
      setCurrentFile(newFile);
      setModified(false);
      return newFile;
    } catch (error) {
      const fileError = handleFileError(error, 'create file');
      setError(fileError);
      throw fileError;
    } finally {
      setSaving(false);
    }
  }, [editor.content, setCurrentFile, setModified, setSaving, setError]);

  // 保存文件
  const saveFile = useCallback(async () => {
    if (!file.currentFile) {
      const error = handleFileError('No file to save', 'save file');
      setError(error);
      throw error;
    }

    try {
      setSaving(true);
      setError(null);
      
      // 验证内容
      if (editor.content.length > 10000000) { // 10MB限制
        throw handleFileError('File too large to save', 'save file');
      }
      
      const savedFile = await tauriApi.saveFile(file.currentFile.id, editor.content);
      setCurrentFile(savedFile);
      setModified(false);
      return savedFile;
    } catch (error) {
      const fileError = handleFileError(error, 'save file');
      setError(fileError);
      throw fileError;
    } finally {
      setSaving(false);
    }
  }, [file.currentFile, editor.content, setCurrentFile, setModified, setSaving, setError]);

  // 加载文件
  const loadFile = useCallback(async (id: string) => {
    try {
      setSaving(true);
      setError(null);
      
      // 验证ID
      if (!id.trim()) {
        throw handleFileError('Invalid file ID', 'load file');
      }
      
      const loadedFile = await tauriApi.loadFile(id);
      setCurrentFile(loadedFile);
      updateContent(loadedFile.content);
      setModified(false);
      return loadedFile;
    } catch (error) {
      const fileError = handleFileError(error, 'load file');
      setError(fileError);
      throw fileError;
    } finally {
      setSaving(false);
    }
  }, [setCurrentFile, updateContent, setModified, setSaving, setError]);

  // 删除文件
  const deleteFile = useCallback(async (id: string) => {
    try {
      setError(null);
      
      // 验证ID
      if (!id.trim()) {
        throw handleFileError('Invalid file ID', 'delete file');
      }
      
      await tauriApi.deleteFile(id);
      if (file.currentFile?.id === id) {
        setCurrentFile(null);
        updateContent('');
        setModified(false);
      }
    } catch (error) {
      const fileError = handleFileError(error, 'delete file');
      setError(fileError);
      throw fileError;
    }
  }, [file.currentFile, setCurrentFile, updateContent, setModified, setError]);

  // 检查是否需要保存
  const needsSave = useCallback(() => {
    return file.isModified && file.currentFile;
  }, [file.isModified, file.currentFile]);

  // 验证文件内容
  const validateContent = useCallback((content: string): string[] => {
    const errors: string[] = [];
    
    if (content.length === 0) {
      errors.push('Content cannot be empty');
    }
    
    if (content.length > 10000000) {
      errors.push('Content too large (max 10MB)');
    }
    
    // 检查是否有无效字符
    const invalidChars = content.match(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g);
    if (invalidChars) {
      errors.push('Content contains invalid characters');
    }
    
    return errors;
  }, []);

  return {
    createNewFile,
    saveFile,
    loadFile,
    deleteFile,
    needsSave,
    validateContent,
    isSaving: file.isSaving,
    currentFile: file.currentFile,
  };
};
