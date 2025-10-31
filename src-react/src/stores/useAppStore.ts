import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TempFile, UIState, FileState, EditorState, AppError } from '@/types';

interface AppStore {
  // UI状态
  ui: UIState;
  setUI: (ui: Partial<UIState>) => void;
  toggleSidebar: () => void;
  setPreviewMode: (mode: 'split' | 'editor' | 'preview') => void;
  setEditorMode: (mode: 'fountain' | 'richtext' | 'split') => void;
  toggleTheme: () => void;
  
  // 文件状态
  file: FileState;
  setFile: (file: Partial<FileState>) => void;
  setCurrentFile: (file: TempFile | null) => void;
  setModified: (modified: boolean) => void;
  setSaving: (saving: boolean) => void;
  
  // 编辑器状态
  editor: EditorState;
  setEditor: (editor: Partial<EditorState>) => void;
  updateContent: (content: string) => void;
  setCursorPosition: (position: number) => void;
  setSelection: (selection: { start: number; end: number } | null) => void;
  undo: () => void;
  redo: () => void;
  saveToHistory: (content: string) => void;
  
  // 错误状态
  error: AppError | null;
  setError: (error: AppError | null) => void;
  clearError: () => void;
  
  // 恢复状态
  recoveryFiles: any[];
  setRecoveryFiles: (files: any[]) => void;
  
  // 重置状态
  reset: () => void;
}

const initialUIState: UIState = {
  sidebarOpen: true,
  previewMode: 'split',
  theme: 'light',
  fontSize: 14,
  showLineNumbers: true,
  wordWrap: true,
  editorMode: 'richtext', // 'fountain' | 'richtext' | 'split'
};

const initialFileState: FileState = {
  currentFile: null,
  isModified: false,
  isSaving: false,
  lastSaved: null,
  autoSaveEnabled: true,
};

const initialEditorState: EditorState = {
  content: `FADE IN:

EXT. 咖啡厅 - 白天

一个忙碌的咖啡厅，顾客来来往往。阳光透过大窗户洒在木制桌椅上。

JOHN
（坐下，看着菜单）
你好，我要一杯咖啡。

服务员
好的，马上来。

JOHN
谢谢。

服务员离开，JOHN看着窗外。街道上车水马龙，行人匆匆。

FADE OUT.`,
  cursorPosition: 0,
  selection: null,
  history: {
    undo: [],
    redo: [],
  },
};

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // UI状态
      ui: initialUIState,
      setUI: (ui) => set((state) => ({ ui: { ...state.ui, ...ui } })),
      toggleSidebar: () => set((state) => ({ 
        ui: { ...state.ui, sidebarOpen: !state.ui.sidebarOpen } 
      })),
      setPreviewMode: (mode) => set((state) => ({ 
        ui: { ...state.ui, previewMode: mode } 
      })),
      setEditorMode: (mode) => set((state) => ({ 
        ui: { ...state.ui, editorMode: mode } 
      })),
      toggleTheme: () => set((state) => ({ 
        ui: { ...state.ui, theme: state.ui.theme === 'light' ? 'dark' : 'light' } 
      })),
      
      // 文件状态
      file: initialFileState,
      setFile: (file) => set((state) => ({ file: { ...state.file, ...file } })),
      setCurrentFile: (file) => set((state) => ({ 
        file: { ...state.file, currentFile: file, isModified: false } 
      })),
      setModified: (modified) => set((state) => ({ 
        file: { ...state.file, isModified: modified } 
      })),
      setSaving: (saving) => set((state) => ({ 
        file: { ...state.file, isSaving: saving } 
      })),
      
      // 编辑器状态
      editor: initialEditorState,
      setEditor: (editor) => set((state) => ({ editor: { ...state.editor, ...editor } })),
      updateContent: (content) => set((state) => {
        // ACID原则：原子性 - 要么全部更新，要么不更新
        const newState = {
          editor: { 
            ...state.editor, 
            content,
            cursorPosition: Math.min(state.editor.cursorPosition, content.length)
          },
          file: { ...state.file, isModified: true }
        };
        
        // 一致性检查：确保光标位置不超出内容长度
        if (newState.editor.cursorPosition > content.length) {
          newState.editor.cursorPosition = content.length;
        }
        
        return newState;
      }),
      setCursorPosition: (position) => set((state) => ({ 
        editor: { ...state.editor, cursorPosition: position } 
      })),
      setSelection: (selection) => set((state) => ({ 
        editor: { ...state.editor, selection } 
      })),
      saveToHistory: (content) => set((state) => {
        // ACID原则：原子性 - 历史记录更新要么全部成功，要么全部失败
        const newHistory = {
          undo: [...state.editor.history.undo, state.editor.content],
          redo: []
        };
        
        // 一致性检查：限制历史记录数量，防止内存溢出
        if (newHistory.undo.length > 50) {
          newHistory.undo = newHistory.undo.slice(-50);
        }
        
        return {
          editor: {
            ...state.editor,
            history: newHistory
          }
        };
      }),
      undo: () => set((state) => {
        // ACID原则：隔离性 - 撤销操作是独立的
        if (state.editor.history.undo.length === 0) return state;
        
        const previousContent = state.editor.history.undo[state.editor.history.undo.length - 1];
        const newUndo = state.editor.history.undo.slice(0, -1);
        const newRedo = [...state.editor.history.redo, state.editor.content];
        
        // 一致性检查：确保内容长度合理
        if (previousContent.length > 1000000) { // 1MB限制
          console.warn('Content too large for undo operation');
          return state;
        }
        
        return {
          editor: {
            ...state.editor,
            content: previousContent,
            cursorPosition: Math.min(state.editor.cursorPosition, previousContent.length),
            history: {
              undo: newUndo,
              redo: newRedo
            }
          },
          file: { ...state.file, isModified: true }
        };
      }),
      redo: () => set((state) => {
        // ACID原则：隔离性 - 重做操作是独立的
        if (state.editor.history.redo.length === 0) return state;
        
        const nextContent = state.editor.history.redo[state.editor.history.redo.length - 1];
        const newRedo = state.editor.history.redo.slice(0, -1);
        const newUndo = [...state.editor.history.undo, state.editor.content];
        
        // 一致性检查：确保内容长度合理
        if (nextContent.length > 1000000) { // 1MB限制
          console.warn('Content too large for redo operation');
          return state;
        }
        
        return {
          editor: {
            ...state.editor,
            content: nextContent,
            cursorPosition: Math.min(state.editor.cursorPosition, nextContent.length),
            history: {
              undo: newUndo,
              redo: newRedo
            }
          },
          file: { ...state.file, isModified: true }
        };
      }),
      
      // 错误状态
      error: null,
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
      
      // 恢复状态
      recoveryFiles: [],
      setRecoveryFiles: (files) => set({ recoveryFiles: files }),
      
      // 重置状态
      reset: () => set({
        ui: initialUIState,
        file: initialFileState,
        editor: initialEditorState,
        error: null,
        recoveryFiles: [],
      }),
    }),
    {
      name: 'thypingscripts-store',
      partialize: (state) => ({
        ui: {
          sidebarOpen: state.ui.sidebarOpen,
          theme: state.ui.theme,
          fontSize: state.ui.fontSize,
          showLineNumbers: state.ui.showLineNumbers,
          wordWrap: state.ui.wordWrap,
        },
        file: {
          autoSaveEnabled: state.file.autoSaveEnabled,
        },
      }),
    }
  )
);
