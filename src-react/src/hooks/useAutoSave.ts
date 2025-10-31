import { useEffect, useRef, useCallback, useState } from 'react';
import { useAppStore } from '@/stores/useAppStore';
import { useFileOperations } from './useFileOperations';

export const useAutoSave = (interval: number = 30000) => {
  const { file, editor } = useAppStore();
  const { saveFile } = useFileOperations();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastContentRef = useRef<string>('');
  const [isLocked, setIsLocked] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  // 带重试机制的自动保存逻辑
  const triggerAutoSave = useCallback(async () => {
    if (!file.currentFile || !file.autoSaveEnabled || file.isSaving || isLocked) {
      return;
    }

    // 检查内容是否有变化
    if (editor.content === lastContentRef.current) {
      return;
    }

    setIsLocked(true);
    
    try {
      await saveFile();
      lastContentRef.current = editor.content;
      setRetryCount(0); // 重置重试计数
    } catch (error) {
      console.error('Auto-save failed:', error);
      
      // 重试机制
      if (retryCount < maxRetries) {
        setRetryCount(prev => prev + 1);
        setTimeout(() => {
          setIsLocked(false);
          triggerAutoSave();
        }, 1000 * retryCount); // 指数退避
      } else {
        console.error('Auto-save failed after maximum retries');
        setRetryCount(0);
      }
    } finally {
      if (retryCount >= maxRetries) {
        setIsLocked(false);
      }
    }
  }, [file.currentFile, file.autoSaveEnabled, file.isSaving, editor.content, saveFile, isLocked, retryCount]);

  // 设置自动保存定时器
  useEffect(() => {
    if (!file.autoSaveEnabled || !file.currentFile || isLocked) {
      return;
    }

    timeoutRef.current = setInterval(triggerAutoSave, interval);

    return () => {
      if (timeoutRef.current) {
        clearInterval(timeoutRef.current);
      }
    };
  }, [file.autoSaveEnabled, file.currentFile, triggerAutoSave, interval, isLocked]);

  // 内容变化时重置定时器
  useEffect(() => {
    if (file.autoSaveEnabled && file.currentFile && !isLocked) {
      // 清除现有定时器
      if (timeoutRef.current) {
        clearInterval(timeoutRef.current);
      }
      
      // 设置新的定时器
      timeoutRef.current = setTimeout(triggerAutoSave, interval);
    }
  }, [editor.content, file.autoSaveEnabled, file.currentFile, triggerAutoSave, interval, isLocked]);

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
    isLocked,
    retryCount,
  };
};
