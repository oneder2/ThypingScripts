import { useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '@/stores/useAppStore';
import { useFileOperations } from './useFileOperations';

export const useAutoSave = (interval: number = 30000) => {
  const { file, editor } = useAppStore();
  const { saveFile } = useFileOperations();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastContentRef = useRef<string>('');

  // 自动保存逻辑
  const triggerAutoSave = useCallback(async () => {
    if (!file.currentFile || !file.autoSaveEnabled || file.isSaving) {
      return;
    }

    // 检查内容是否有变化
    if (editor.content === lastContentRef.current) {
      return;
    }

    try {
      await saveFile();
      lastContentRef.current = editor.content;
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }, [file.currentFile, file.autoSaveEnabled, file.isSaving, editor.content, saveFile]);

  // 设置自动保存定时器
  useEffect(() => {
    if (!file.autoSaveEnabled || !file.currentFile) {
      return;
    }

    timeoutRef.current = setInterval(triggerAutoSave, interval);

    return () => {
      if (timeoutRef.current) {
        clearInterval(timeoutRef.current);
      }
    };
  }, [file.autoSaveEnabled, file.currentFile, triggerAutoSave, interval]);

  // 内容变化时重置定时器
  useEffect(() => {
    if (file.autoSaveEnabled && file.currentFile) {
      // 清除现有定时器
      if (timeoutRef.current) {
        clearInterval(timeoutRef.current);
      }
      
      // 设置新的定时器
      timeoutRef.current = setTimeout(triggerAutoSave, interval);
    }
  }, [editor.content, file.autoSaveEnabled, file.currentFile, triggerAutoSave, interval]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearInterval(timeoutRef.current);
      }
    };
  }, []);

  return {
    triggerAutoSave,
  };
};
