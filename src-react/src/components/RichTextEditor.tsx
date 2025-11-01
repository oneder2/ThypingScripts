/**
 * RichTextEditor - 真正的富文本编辑器
 *
 * 核心理念：
 * - 单一contentEditable区域，实时格式化
 * - 用户看到格式化的内容（颜色、大小、缩进等）
 * - 底层保存纯Fountain文本
 * - 所见即所得的编辑体验
 */

import { useRef, useEffect, useCallback } from 'react';
import { useAppStore } from '@/stores/useAppStore';
import { parseFountainBlock } from '@/utils/fountainBlockParser';
import '@/styles/fountain.css';

const RichTextEditor = () => {
  const { editor, ui, updateContent, undo, redo, canUndo, canRedo } = useAppStore();
  const editorRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const isUpdatingFromStoreRef = useRef(false);
  const lastPlainTextRef = useRef<string>('');

  /**
   * 获取块的样式类名
   */
  const getBlockClass = useCallback((type: string): string => {
    const classMap: Record<string, string> = {
      scene: 'fountain-scene',
      character: 'fountain-character',
      dialogue: 'fountain-dialogue',
      action: 'fountain-action',
      parenthetical: 'fountain-parenthetical',
      transition: 'fountain-transition',
      centered: 'fountain-centered',
      lyrics: 'fountain-lyrics',
      note: 'fountain-note',
      pagebreak: 'fountain-pagebreak',
      empty: 'fountain-empty',
    };
    return classMap[type] || 'fountain-action';
  }, []);

  /**
   * 生成格式化的HTML预览
   */
  const generateFormattedHTML = useCallback((plainText: string): string => {
    const lines = plainText.split('\n');
    let previousType = '';

    return lines.map((line) => {
      const block = parseFountainBlock(line, previousType as any);
      previousType = block.type;

      const className = getBlockClass(block.type);
      const escapedContent = line
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      return `<div class="${className}">${escapedContent}</div>`;
    }).join('');
  }, [getBlockClass]);

  /**
   * 处理输入事件
   */
  const handleInput = useCallback(() => {
    if (!editorRef.current || isUpdatingFromStoreRef.current) return;

    // 获取纯文本内容
    const plainText = editorRef.current.textContent || '';

    // 如果内容没有变化，不处理
    if (plainText === lastPlainTextRef.current) return;

    lastPlainTextRef.current = plainText;

    // 保存纯文本到store
    updateContent(plainText);

    // 同步预览层
    if (previewRef.current) {
      previewRef.current.innerHTML = generateFormattedHTML(plainText);
    }
  }, [updateContent, generateFormattedHTML]);

  /**
   * 处理粘贴事件 - 只粘贴纯文本
   */
  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  }, []);

  /**
   * 处理键盘快捷键
   */
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    // Ctrl+Z 或 Cmd+Z - 撤销
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      if (canUndo) {
        undo();
      }
      return;
    }

    // Ctrl+Y 或 Ctrl+Shift+Z 或 Cmd+Shift+Z - 重做
    if (
      ((e.ctrlKey || e.metaKey) && e.key === 'y') ||
      ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z')
    ) {
      e.preventDefault();
      if (canRedo) {
        redo();
      }
      return;
    }

    // Ctrl+B - 粗体 (暂不实现，但预留)
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
      e.preventDefault();
      // TODO: 实现粗体
      return;
    }

    // Ctrl+I - 斜体 (暂不实现，但预留)
    if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
      e.preventDefault();
      // TODO: 实现斜体
      return;
    }
  }, [canUndo, canRedo, undo, redo]);

  /**
   * 初始化编辑器内容
   */
  useEffect(() => {
    if (!editorRef.current) return;

    // 如果编辑器为空，初始化内容
    if (!editorRef.current.textContent && editor.content) {
      isUpdatingFromStoreRef.current = true;
      lastPlainTextRef.current = editor.content;
      editorRef.current.textContent = editor.content;

      // 同步预览层
      if (previewRef.current) {
        previewRef.current.innerHTML = generateFormattedHTML(editor.content);
      }

      isUpdatingFromStoreRef.current = false;
    }
  }, [editor.content, generateFormattedHTML]);

  /**
   * 监听editor.content变化，更新预览层
   */
  useEffect(() => {
    if (previewRef.current && editor.content) {
      previewRef.current.innerHTML = generateFormattedHTML(editor.content);
    }
  }, [editor.content, generateFormattedHTML]);

  /**
   * 聚焦编辑器
   */
  useEffect(() => {
    if (editorRef.current && !editorRef.current.textContent) {
      editorRef.current.focus();
    }
  }, []);

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 h-full overflow-hidden">
      {/* 工具栏 */}
      <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-2 bg-gray-50 dark:bg-gray-800 flex items-center gap-2">
        <button
          onClick={() => canUndo && undo()}
          disabled={!canUndo}
          className="px-3 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          title="撤销 (Ctrl+Z)"
        >
          ↶ 撤销
        </button>
        <button
          onClick={() => canRedo && redo()}
          disabled={!canRedo}
          className="px-3 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          title="重做 (Ctrl+Y)"
        >
          ↷ 重做
        </button>
        <div className="flex-1" />
        <span className="text-xs text-gray-600 dark:text-gray-400">
          字数: {editor.content.length} | 行数: {editor.content.split('\n').length}
        </span>
      </div>

      {/* 编辑区域容器 */}
      <div className="flex-1 overflow-hidden relative">
        {/* 格式化预览层 */}
        <div
          ref={previewRef}
          className="absolute inset-0 p-8 overflow-auto pointer-events-none"
          style={{
            fontFamily: "'Courier New', monospace",
            fontSize: '14px',
            lineHeight: '1.8',
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
          }}
        />

        {/* 编辑区域 - 透明，覆盖在预览层上 */}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onPaste={handlePaste}
          onKeyDown={handleKeyDown}
          className="absolute inset-0 p-8 overflow-auto outline-none"
          style={{
            fontFamily: "'Courier New', monospace",
            fontSize: '14px',
            lineHeight: '1.8',
            color: 'transparent',
            caretColor: ui.theme === 'dark' ? '#e5e7eb' : '#1f2937',
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
            backgroundColor: 'transparent',
            resize: 'none',
          }}
          spellCheck={false}
        />
      </div>
    </div>
  );
};

export default RichTextEditor;

