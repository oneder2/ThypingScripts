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
  const { editor, ui, updateContent } = useAppStore();
  const editorRef = useRef<HTMLDivElement>(null);
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
  }, [updateContent]);

  /**
   * 处理粘贴事件 - 只粘贴纯文本
   */
  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  }, []);

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
      isUpdatingFromStoreRef.current = false;
    }
  }, [editor.content]);

  /**
   * 聚焦编辑器
   */
  useEffect(() => {
    if (editorRef.current && !editorRef.current.textContent) {
      editorRef.current.focus();
    }
  }, []);

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 h-full overflow-hidden relative">
      {/* 格式化预览层 */}
      <div
        className="absolute inset-0 p-8 overflow-auto pointer-events-none"
        style={{
          fontFamily: "'Courier New', monospace",
          fontSize: '14px',
          lineHeight: '1.8',
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word',
        }}
        dangerouslySetInnerHTML={{
          __html: generateFormattedHTML(editor.content),
        }}
      />

      {/* 编辑区域 - 透明，覆盖在预览层上 */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onPaste={handlePaste}
        className="flex-1 overflow-auto p-8 outline-none relative z-10"
        style={{
          fontFamily: "'Courier New', monospace",
          fontSize: '14px',
          lineHeight: '1.8',
          color: 'transparent',
          caretColor: ui.theme === 'dark' ? '#e5e7eb' : '#1f2937',
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word',
          backgroundColor: 'transparent',
        }}
        spellCheck={false}
      />

      {/* 状态栏 */}
      <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-2 bg-gray-50 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-400 relative z-20">
        <div className="flex justify-between">
          <span>字数: {editor.content.length}</span>
          <span>行数: {editor.content.split('\n').length}</span>
        </div>
      </div>
    </div>
  );
};

export default RichTextEditor;

