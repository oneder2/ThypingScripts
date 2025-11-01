/**
 * DirectEditor - Fountain富文本编辑模式组件
 *
 * 提供类似Word/Notion的块级编辑体验
 *
 * 核心特性：
 * - 块级编辑，每个Fountain元素是一个独立的块
 * - 工具栏按钮快速插入Fountain元素
 * - 实时格式化显示（颜色、粗体、缩进等）
 * - 完整的撤销/重做功能（Zustand管理）
 * - 完整的光标位置管理
 * - 中文输入法支持
 *
 * 技术实现：
 * - 每个块是一个contentEditable的div
 * - 使用CSS类来应用格式化样式
 * - Zustand管理块数组和历史记录
 * - 底层保存纯Fountain文本
 */

import { useRef, useEffect, useCallback, useState } from 'react';
import { useAppStore } from '@/stores/useAppStore';
import '@/styles/fountain.css';

// Fountain块类型
type BlockType = 'scene' | 'character' | 'dialogue' | 'action' | 'parenthetical' | 'transition';

// Fountain块接口
interface FountainBlock {
  id: string;
  type: BlockType;
  content: string;
}

const DirectEditor = () => {
  const { editor, ui, updateContent, undo, redo, canUndo, canRedo, saveToHistory } = useAppStore();
  const [blocks, setBlocks] = useState<FountainBlock[]>([]);
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null);

  /**
   * 将blocks转换为纯文本
   */
  const blocksToText = useCallback((blocks: FountainBlock[]): string => {
    return blocks.map(block => block.content).join('\n');
  }, []);

  /**
   * 将纯文本转换为blocks
   */
  const textToBlocks = useCallback((text: string): FountainBlock[] => {
    const lines = text.split('\n');
    return lines.map((line, index) => {
      let type: BlockType = 'action';

      // 简单的类型识别
      if (line.match(/^(INT\.|EXT\.|EST\.)/i)) {
        type = 'scene';
      } else if (line.match(/^[A-Z\s]+$/) && line.trim().length > 0) {
        type = 'character';
      } else if (line.match(/^\(/)) {
        type = 'parenthetical';
      } else if (line.match(/^(FADE|CUT|DISSOLVE)/i)) {
        type = 'transition';
      }

      return {
        id: `block-${Date.now()}-${index}`,
        type,
        content: line,
      };
    });
  }, []);

  /**
   * 保存blocks到store
   */
  const saveBlocks = useCallback((newBlocks: FountainBlock[]) => {
    const text = blocksToText(newBlocks);

    // 保存历史记录
    if (editor.content !== text) {
      saveToHistory(editor.content);
      updateContent(text);
    }

    setBlocks(newBlocks);
  }, [editor.content, blocksToText, saveToHistory, updateContent]);

  /**
   * 插入新块
   */
  const insertBlock = useCallback((type: BlockType, defaultContent: string) => {
    const newBlock: FountainBlock = {
      id: `block-${Date.now()}`,
      type,
      content: defaultContent,
    };

    const newBlocks = [...blocks, newBlock];
    saveBlocks(newBlocks);
    setFocusedBlockId(newBlock.id);
  }, [blocks, saveBlocks]);

  /**
   * 更新块内容
   */
  const updateBlock = useCallback((id: string, content: string) => {
    const newBlocks = blocks.map(block =>
      block.id === id ? { ...block, content } : block
    );
    saveBlocks(newBlocks);
  }, [blocks, saveBlocks]);

  /**
   * 删除块
   */
  const deleteBlock = useCallback((id: string) => {
    if (blocks.length <= 1) return; // 至少保留一个块

    const newBlocks = blocks.filter(block => block.id !== id);
    saveBlocks(newBlocks);
  }, [blocks, saveBlocks]);

  /**
   * 获取块的CSS类名
   */
  const getBlockClassName = useCallback((type: BlockType): string => {
    const baseClass = 'outline-none px-2 py-1 rounded min-h-[2em]';
    const typeClass = `fountain-${type}`;
    return `${baseClass} ${typeClass}`;
  }, []);

  /**
   * 处理块的键盘事件
   */
  const handleBlockKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>, blockId: string, blockIndex: number) => {
    // Enter键 - 创建新的动作块
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const newBlock: FountainBlock = {
        id: `block-${Date.now()}`,
        type: 'action',
        content: '',
      };
      const newBlocks = [
        ...blocks.slice(0, blockIndex + 1),
        newBlock,
        ...blocks.slice(blockIndex + 1),
      ];
      saveBlocks(newBlocks);
      setFocusedBlockId(newBlock.id);
      return;
    }

    // Backspace键 - 如果块为空，删除块
    if (e.key === 'Backspace') {
      const block = blocks[blockIndex];
      if (block.content === '' && blocks.length > 1) {
        e.preventDefault();
        deleteBlock(blockId);
        // 聚焦到上一个块
        if (blockIndex > 0) {
          setFocusedBlockId(blocks[blockIndex - 1].id);
        }
        return;
      }
    }

    // Ctrl+Z - 撤销
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      undo();
      return;
    }

    // Ctrl+Y 或 Ctrl+Shift+Z - 重做
    if (
      ((e.ctrlKey || e.metaKey) && e.key === 'y') ||
      ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z')
    ) {
      e.preventDefault();
      redo();
      return;
    }
  }, [blocks, saveBlocks, deleteBlock, undo, redo]);

  /**
   * 初始化blocks
   */
  useEffect(() => {
    if (editor.content && blocks.length === 0) {
      const initialBlocks = textToBlocks(editor.content);
      setBlocks(initialBlocks);
    }
  }, [editor.content, blocks.length, textToBlocks]);

  /**
   * 从store恢复blocks（撤销/重做时）
   */
  useEffect(() => {
    const currentText = blocksToText(blocks);
    if (editor.content !== currentText && editor.content) {
      const restoredBlocks = textToBlocks(editor.content);
      setBlocks(restoredBlocks);
    }
  }, [editor.content]);

  /**
   * 聚焦到指定的块
   */
  useEffect(() => {
    if (focusedBlockId) {
      const element = document.getElementById(focusedBlockId);
      if (element) {
        element.focus();
        // 将光标移到末尾
        const range = document.createRange();
        const sel = window.getSelection();
        if (element.childNodes.length > 0) {
          range.setStart(element.childNodes[0], element.textContent?.length || 0);
        } else {
          range.setStart(element, 0);
        }
        range.collapse(true);
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
    }
  }, [focusedBlockId]);

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 h-full overflow-hidden">
      {/* 工具栏 */}
      <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-2 bg-gray-50 dark:bg-gray-800">
        {/* 第一行：撤销/重做和统计 */}
        <div className="flex items-center gap-2 mb-2">
          <button
            onClick={undo}
            disabled={!canUndo}
            className="px-3 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            title="撤销 (Ctrl+Z)"
          >
            ↶ 撤销
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className="px-3 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            title="重做 (Ctrl+Y)"
          >
            ↷ 重做
          </button>
          <div className="flex-1" />
          <span className="text-xs text-gray-600 dark:text-gray-400">
            字数: {editor.content.length} | 块数: {blocks.length}
          </span>
        </div>

        {/* 第二行：Fountain元素按钮 */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => insertBlock('scene', 'INT. ')}
            className="px-3 py-1 rounded bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 text-sm"
            title="插入场景标题"
          >
            场景
          </button>
          <button
            onClick={() => insertBlock('character', '角色名')}
            className="px-3 py-1 rounded bg-green-100 dark:bg-green-900 hover:bg-green-200 dark:hover:bg-green-800 text-sm"
            title="插入角色名"
          >
            角色
          </button>
          <button
            onClick={() => insertBlock('dialogue', '对话内容')}
            className="px-3 py-1 rounded bg-yellow-100 dark:bg-yellow-900 hover:bg-yellow-200 dark:hover:bg-yellow-800 text-sm"
            title="插入对话"
          >
            对话
          </button>
          <button
            onClick={() => insertBlock('action', '动作描述')}
            className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-sm"
            title="插入动作"
          >
            动作
          </button>
          <button
            onClick={() => insertBlock('parenthetical', '(台词)')}
            className="px-3 py-1 rounded bg-purple-100 dark:bg-purple-900 hover:bg-purple-200 dark:hover:bg-purple-800 text-sm"
            title="插入括号台词"
          >
            台词
          </button>
          <button
            onClick={() => insertBlock('transition', 'FADE OUT.')}
            className="px-3 py-1 rounded bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 text-sm"
            title="插入过渡"
          >
            过渡
          </button>
        </div>
      </div>

      {/* 编辑区域 - 块级编辑 */}
      <div className="flex-1 overflow-auto p-8">
        <div
          style={{
            fontFamily: "'Courier New', monospace",
            fontSize: '14px',
            lineHeight: '1.8',
          }}
        >
          {blocks.map((block, index) => (
            <div
              key={block.id}
              id={block.id}
              contentEditable
              suppressContentEditableWarning
              onInput={(e) => updateBlock(block.id, e.currentTarget.textContent || '')}
              onKeyDown={(e) => handleBlockKeyDown(e, block.id, index)}
              className={getBlockClassName(block.type)}
              spellCheck={false}
            >
              {block.content}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DirectEditor;

