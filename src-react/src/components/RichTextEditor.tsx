/**
 * RichTextEditor - 富文本编辑器组件
 *
 * 提供Word/Notion风格的Fountain编辑体验
 * 
 * 核心特性：
 * - 实时块级元素识别和渲染
 * - Fountain语法高亮
 * - 行内格式支持 (B/I/U)
 * - 自动格式化
 * - 快捷键支持
 * - 流畅的编辑体验
 * 
 * 架构：
 * 用户输入 → 块级解析 → 样式应用 → 渲染显示
 *   ↓
 * 保存到Zustand store → 自动保存到临时文件
 */

import { useRef, useEffect, useState, useCallback } from 'react';
import { useAppStore } from '@/stores/useAppStore';
import { parseTextToBlocks, getBlockStyle, getBlockClassName } from '@/utils/fountainBlockParser';
import '@/styles/fountain.css';

interface BlockElement {
  id: string;
  type: string;
  content: string;
  ref?: React.RefObject<HTMLDivElement>;
}

const RichTextEditor = () => {
  const { editor, ui, updateContent } = useAppStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [blocks, setBlocks] = useState<BlockElement[]>([]);
  const [cursorBlockId, setCursorBlockId] = useState<string>('');
  const isUpdatingFromStoreRef = useRef(false);

  /**
   * 解析文本为块并更新状态
   */
  const updateBlocks = useCallback((text: string) => {
    const parsedBlocks = parseTextToBlocks(text);
    const blockElements: BlockElement[] = parsedBlocks.map(block => ({
      id: block.id,
      type: block.type,
      content: block.content,
      ref: useRef<HTMLDivElement>(null),
    }));
    setBlocks(blockElements);
  }, []);

  /**
   * 处理块级元素输入
   */
  const handleBlockInput = useCallback((blockId: string, newContent: string) => {
    // 更新块内容
    setBlocks(prevBlocks =>
      prevBlocks.map(block =>
        block.id === blockId ? { ...block, content: newContent } : block
      )
    );

    // 重新构建完整文本
    const fullText = blocks
      .map(block => (block.id === blockId ? newContent : block.content))
      .join('\n');

    // 更新store
    updateContent(fullText);
  }, [blocks, updateContent]);

  /**
   * 处理块级元素焦点
   */
  const handleBlockFocus = useCallback((blockId: string) => {
    setCursorBlockId(blockId);
  }, []);

  /**
   * 处理块级元素按键
   */
  const handleBlockKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>, blockId: string, blockIndex: number) => {
      const currentBlock = blocks[blockIndex];
      if (!currentBlock) return;

      // Enter: 创建新块
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const selection = window.getSelection();

        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const offset = range.startOffset;
          const beforeText = currentBlock.content.substring(0, offset);
          const afterText = currentBlock.content.substring(offset);

          // 更新当前块
          handleBlockInput(blockId, beforeText);

          // 创建新块
          const newBlockId = Math.random().toString(36).substr(2, 9);
          const newBlock: BlockElement = {
            id: newBlockId,
            type: 'action',
            content: afterText,
            ref: useRef<HTMLDivElement>(null),
          };

          setBlocks(prevBlocks => {
            const newBlocks = [...prevBlocks];
            newBlocks.splice(blockIndex + 1, 0, newBlock);
            return newBlocks;
          });

          // 聚焦新块
          setTimeout(() => {
            setCursorBlockId(newBlockId);
          }, 0);
        }
      }

      // Backspace: 合并块
      if (e.key === 'Backspace' && blockIndex > 0) {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          if (range.startOffset === 0) {
            e.preventDefault();
            const prevBlock = blocks[blockIndex - 1];
            const mergedContent = prevBlock.content + currentBlock.content;

            // 更新前一个块
            handleBlockInput(prevBlock.id, mergedContent);

            // 删除当前块
            setBlocks(prevBlocks =>
              prevBlocks.filter((_, idx) => idx !== blockIndex)
            );

            // 聚焦前一个块
            setCursorBlockId(prevBlock.id);
          }
        }
      }

      // Ctrl+S: 保存
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        // 保存由自动保存处理
      }
    },
    [blocks, handleBlockInput]
  );

  /**
   * 从store同步内容到编辑器
   */
  useEffect(() => {
    if (isUpdatingFromStoreRef.current) return;

    const currentText = blocks.map(b => b.content).join('\n');
    if (currentText !== editor.content) {
      isUpdatingFromStoreRef.current = true;
      updateBlocks(editor.content);
      isUpdatingFromStoreRef.current = false;
    }
  }, [editor.content, blocks, updateBlocks]);

  /**
   * 初始化编辑器
   */
  useEffect(() => {
    if (blocks.length === 0 && editor.content) {
      updateBlocks(editor.content);
    }
  }, []);

  /**
   * 聚焦编辑器
   */
  useEffect(() => {
    if (containerRef.current && blocks.length === 0) {
      containerRef.current.focus();
    }
  }, [blocks.length]);

  const currentBlock = blocks[blocks.findIndex(b => b.id === cursorBlockId)];

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 h-full overflow-hidden">
      {/* 工具栏 */}
      <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-2 bg-gray-50 dark:bg-gray-800">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          富文本编辑模式 - Word/Notion风格的Fountain编辑体验
        </div>
      </div>

      {/* 编辑区域 */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto p-8"
        style={{
          fontFamily: "'Courier New', monospace",
          fontSize: '14px',
          color: ui.theme === 'dark' ? '#e5e7eb' : '#1f2937',
        }}
      >
        {blocks.length === 0 ? (
          <div
            className="text-gray-400 dark:text-gray-600"
            style={{ minHeight: '100%' }}
          >
            开始输入...
          </div>
        ) : (
          blocks.map((block, index) => (
            <div
              key={block.id}
              ref={block.ref}
              contentEditable
              suppressContentEditableWarning
              onInput={(e) => handleBlockInput(block.id, e.currentTarget.textContent || '')}
              onFocus={() => handleBlockFocus(block.id)}
              onKeyDown={(e) => handleBlockKeyDown(e, block.id, index)}
              className={getBlockClassName(block.type as any)}
              style={{
                ...getBlockStyle(block.type as any),
                outline: cursorBlockId === block.id ? '1px solid #3b82f6' : 'none',
                outlineOffset: '-1px',
              }}
              spellCheck={false}
            >
              {block.content}
            </div>
          ))
        )}
      </div>

      {/* 状态栏 */}
      <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-2 bg-gray-50 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-400">
        <div className="flex justify-between">
          <span>块数: {blocks.length}</span>
          <span>字数: {editor.content.length}</span>
          <span>当前块: {currentBlock?.type || 'N/A'}</span>
        </div>
      </div>
    </div>
  );
};

export default RichTextEditor;

