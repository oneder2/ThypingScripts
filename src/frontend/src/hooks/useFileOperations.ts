import { useCallback } from 'react';
import { useAppStore } from '@/stores/useAppStore';
import { tauriApi } from '@/utils/tauriApi';
import { TempFile } from '@/types';

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
      const newFile = await tauriApi.createFile(editor.content, title, author);
      setCurrentFile(newFile);
      setModified(false);
      return newFile;
    } catch (error) {
      setError(error as any);
      throw error;
    } finally {
      setSaving(false);
    }
  }, [editor.content, setCurrentFile, setModified, setSaving, setError]);

  // 保存文件
  const saveFile = useCallback(async () => {
    if (!file.currentFile) {
      throw new Error('No file to save');
    }

    try {
      setSaving(true);
      const savedFile = await tauriApi.saveFile(file.currentFile.id, editor.content);
      setCurrentFile(savedFile);
      setModified(false);
      return savedFile;
    } catch (error) {
      setError(error as any);
      throw error;
    } finally {
      setSaving(false);
    }
  }, [file.currentFile, editor.content, setCurrentFile, setModified, setSaving, setError]);

  // 加载文件
  const loadFile = useCallback(async (id: string) => {
    try {
      setSaving(true);
      const loadedFile = await tauriApi.loadFile(id);
      setCurrentFile(loadedFile);
      updateContent(loadedFile.content);
      setModified(false);
      return loadedFile;
    } catch (error) {
      setError(error as any);
      throw error;
    } finally {
      setSaving(false);
    }
  }, [setCurrentFile, updateContent, setModified, setSaving, setError]);

  // 删除文件
  const deleteFile = useCallback(async (id: string) => {
    try {
      await tauriApi.deleteFile(id);
      if (file.currentFile?.id === id) {
        setCurrentFile(null);
        updateContent('');
        setModified(false);
      }
    } catch (error) {
      setError(error as any);
      throw error;
    }
  }, [file.currentFile, setCurrentFile, updateContent, setModified, setError]);

  // 检查是否需要保存
  const needsSave = useCallback(() => {
    return file.isModified && file.currentFile;
  }, [file.isModified, file.currentFile]);

  return {
    createNewFile,
    saveFile,
    loadFile,
    deleteFile,
    needsSave,
    isSaving: file.isSaving,
    currentFile: file.currentFile,
  };
};
