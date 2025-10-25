import { useEffect } from 'react';
import { useAppStore } from '@/stores/useAppStore';
import { useFileOperations } from '@/hooks/useFileOperations';

export const useKeyboardShortcuts = () => {
  const { ui, toggleSidebar, setEditorMode, toggleTheme, undo, redo } = useAppStore();
  const { createNewFile, saveFile } = useFileOperations();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 忽略在输入框中的快捷键
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        // 只处理全局快捷键，跳过编辑器内的快捷键
        if (e.ctrlKey || e.metaKey) {
          switch (e.key) {
            case 's':
              e.preventDefault();
              saveFile();
              break;
            case 'n':
              e.preventDefault();
              createNewFile();
              break;
            case 'z':
              if (!e.shiftKey) {
                e.preventDefault();
                undo();
              }
              break;
            case 'y':
              e.preventDefault();
              redo();
              break;
            default:
              break;
          }
        }
        return;
      }

      // 全局快捷键
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 's':
            e.preventDefault();
            saveFile();
            break;
          case 'n':
            e.preventDefault();
            createNewFile();
            break;
          case 'z':
            if (!e.shiftKey) {
              e.preventDefault();
              undo();
            }
            break;
          case 'y':
            e.preventDefault();
            redo();
            break;
          case 'b':
            e.preventDefault();
            toggleSidebar();
            break;
          case '1':
            e.preventDefault();
            setEditorMode('fountain');
            break;
          case '2':
            e.preventDefault();
            setEditorMode('split');
            break;
          case 'd':
            e.preventDefault();
            toggleTheme();
            break;
          default:
            break;
        }
      } else {
        // 非Ctrl快捷键
        switch (e.key) {
          case 'F11':
            e.preventDefault();
            // 全屏切换（由Tauri处理）
            break;
          case 'Escape':
            // 关闭所有下拉菜单
            break;
          default:
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [ui, toggleSidebar, setEditorMode, toggleTheme, undo, redo, createNewFile, saveFile]);
};


