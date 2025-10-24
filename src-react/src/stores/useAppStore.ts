import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TempFile, UIState, FileState, EditorState, AppError } from '@/types';

interface AppStore {
  // UI状态
  ui: UIState;
  setUI: (ui: Partial<UIState>) => void;
  toggleSidebar: () => void;
  setPreviewMode: (mode: 'split' | 'editor' | 'preview') => void;
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
};

const initialFileState: FileState = {
  currentFile: null,
  isModified: false,
  isSaving: false,
  lastSaved: null,
  autoSaveEnabled: true,
};

const initialEditorState: EditorState = {
  content: '',
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
      updateContent: (content) => set((state) => ({ 
        editor: { ...state.editor, content },
        file: { ...state.file, isModified: true }
      })),
      setCursorPosition: (position) => set((state) => ({ 
        editor: { ...state.editor, cursorPosition: position } 
      })),
      setSelection: (selection) => set((state) => ({ 
        editor: { ...state.editor, selection } 
      })),
      
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
