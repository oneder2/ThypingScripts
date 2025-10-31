// 基础类型定义
export interface TempFile {
  id: string;
  path: string;
  content: string;
  created_at: string;
  last_modified: string;
  metadata: TempFileMetadata;
}

export interface TempFileMetadata {
  title: string;
  author: string;
  version: string;
  word_count: number;
  character_count: number;
  scene_count: number;
}

export interface RecoveryFile {
  id: string;
  original_file_id?: string;
  path: string;
  content: string;
  created_at: string;
}

// Fountain相关类型
export enum FountainElementType {
  TitlePage = 'TitlePage',
  SceneHeading = 'SceneHeading',
  Action = 'Action',
  Character = 'Character',
  Dialogue = 'Dialogue',
  Parenthetical = 'Parenthetical',
  Transition = 'Transition',
  Note = 'Note',
  Centered = 'Centered',
  PageBreak = 'PageBreak',
}

export interface FountainElement {
  element_type: FountainElementType;
  content: string;
  line_number: number;
  position: number;
}

export interface DocumentMetadata {
  word_count: number;
  character_count: number;
  scene_count: number;
  character_count_map: Record<string, number>;
}

export interface FountainDocument {
  title_page: Record<string, string>;
  elements: FountainElement[];
  metadata: DocumentMetadata;
}

// 编辑器状态类型
export interface EditorState {
  content: string;
  cursorPosition: number;
  selection: {
    start: number;
    end: number;
  } | null;
  history: {
    undo: string[];
    redo: string[];
  };
}

// Tauri命令类型
export interface TauriCommands {
  create_file: (content: string, title: string, author: string) => Promise<TempFile>;
  save_file: (id: string, content: string) => Promise<TempFile>;
  load_file: (id: string) => Promise<TempFile>;
  delete_file: (id: string) => Promise<void>;
  check_crash_recovery: () => Promise<RecoveryFile[]>;
  restore_from_recovery: (recovery_id: string) => Promise<RecoveryFile>;
  cleanup_old_files: () => Promise<number>;
}

// 错误类型
export interface AppError {
  code: string;
  message: string;
  details?: any;
}

// 快捷键类型
export interface Shortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: string;
  description: string;
}
