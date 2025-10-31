/**
 * DirectEditor - Fountain直接编辑模式组件 (简化版本)
 *
 * 提供类似Word/Notion的流畅编辑体验
 * 使用纯文本编辑，无光标跳转问题
 *
 * 核心特性：
 * - 统一的编辑区域，流畅的编辑体验
 * - 无分块感，自然的文本编辑
 * - 完整的光标位置管理
 * - 中文输入法支持
 * - 零光标跳转问题
 *
 * 设计理念：
 * 使用简单的contentEditable div，不做任何HTML操作
 * 通过plaintext-only模式确保纯文本编辑
 */

import { useRef, useEffect } from 'react';
import { useAppStore } from '@/stores/useAppStore';
import '@/styles/fountain.css';

const DirectEditor = () => {
  const { editor, ui, updateContent } = useAppStore();
  const editorRef = useRef<HTMLDivElement>(null);
  const isUpdatingFromStoreRef = useRef(false); // 防止循环更新

  /**
   * 处理输入事件
   * 直接获取文本内容，无需任何HTML操作
   */
  const handleInput = () => {
    if (!editorRef.current || isUpdatingFromStoreRef.current) return;

    // 获取纯文本内容
    const text = editorRef.current.textContent || '';

    // 更新store
    updateContent(text);
  };

  /**
   * 从store同步内容到编辑器
   * 只在外部更改时更新（如加载文件）
   */
  useEffect(() => {
    if (!editorRef.current) return;

    // 只在内容真正改变时更新
    const currentText = editorRef.current.textContent || '';
    if (currentText !== editor.content) {
      isUpdatingFromStoreRef.current = true;
      editorRef.current.textContent = editor.content;
      isUpdatingFromStoreRef.current = false;
    }
  }, [editor.content]);

  /**
   * 聚焦编辑器
   */
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
  }, []);

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 h-full overflow-hidden">
      {/* 工具栏 */}
      <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-2 bg-gray-50 dark:bg-gray-800">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          直接编辑模式 - 流畅的纯文本编辑体验
        </div>
      </div>

      {/* 编辑区域 */}
      <div className="flex-1 overflow-auto p-8">
        <div
          ref={editorRef}
          contentEditable="plaintext-only"
          suppressContentEditableWarning
          onInput={handleInput}
          className="min-h-full outline-none"
          style={{
            fontFamily: "'Courier New', monospace",
            fontSize: '14px',
            lineHeight: '1.8',
            color: ui.theme === 'dark' ? '#e5e7eb' : '#1f2937',
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
            caretColor: ui.theme === 'dark' ? '#60a5fa' : '#3b82f6',
          }}
          spellCheck={false}
        />
      </div>
    </div>
  );
};

export default DirectEditor;

