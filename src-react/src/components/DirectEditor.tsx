/**
 * DirectEditor - Fountain富文本编辑模式组件
 *
 * 提供类似Word/Notion的富文本编辑体验
 *
 * 核心特性：
 * - 单一contentEditable容器，统一的文档模型
 * - 工具栏按钮快速插入/转换Fountain元素
 * - 实时格式化显示（颜色、粗体、缩进等）
 * - 完整的撤销/重做功能（自动历史记录）
 * - 完整的光标位置管理（基于字符偏移）
 * - 中文输入法支持
 *
 * 技术实现：
 * - 单一contentEditable div容器
 * - 块通过HTML结构表示（div with data-type）
 * - 光标位置基于字符偏移量
 * - 自动防抖历史记录
 * - 底层保存纯Fountain文本
 */

import { useRef, useEffect, useCallback, useState } from 'react';
import { useAppStore } from '@/stores/useAppStore';
import '@/styles/fountain.css';

// Fountain块类型
type BlockType = 'scene' | 'character' | 'dialogue' | 'action' | 'parenthetical' | 'transition' | 'centered' | 'note';

// Fountain块接口
interface FountainBlock {
  type: BlockType;
  content: string;
}

const DirectEditor = () => {
  const { editor, ui, updateContent, undo, redo, canUndo, canRedo, saveToHistory, setCursorPosition } = useAppStore();
  const editorRef = useRef<HTMLDivElement>(null);
  const historyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedContentRef = useRef<string>('');

  /**
   * 识别块类型
   */
  const identifyBlockType = useCallback((line: string, previousType?: BlockType): BlockType => {
    const trimmed = line.trim();

    // 空行
    if (!trimmed) return 'action';

    // 场景标题
    if (/^(INT\.|EXT\.|EST\.)/i.test(trimmed)) return 'scene';

    // 强制场景标题
    if (/^\./.test(trimmed)) return 'scene';

    // 括号台词
    if (/^\(.*\)$/.test(trimmed)) return 'parenthetical';

    // 过渡 - 全大写 + TO: 或常见过渡词
    if (/^(FADE|CUT|DISSOLVE|MATCH|WIPE|PUSH|PULL|PAN|TILT|ZOOM|IRIS|TRUCK|DOLLY|BOOM|CRANE|REVEAL|OPEN|CLOSE|SPLIT|CROSS|FLIP|FLOP|SPIN|SWISH|WHOOSH|WHIP|FLASH|SMASH|MONTAGE|INTERCUT|BACK TO|TO:)/i.test(trimmed)) {
      return 'transition';
    }

    // 强制过渡
    if (/^>/.test(trimmed)) return 'transition';

    // 居中文本
    if (/^>.*<$/.test(trimmed)) return 'centered';

    // 注释
    if (/^\[\[.*\]\]$/.test(trimmed)) return 'note';

    // 全大写 - 可能是角色名或过渡
    if (/^[A-Z\s\-']+$/.test(trimmed) && trimmed.length > 0 && previousType !== 'character') {
      return 'character';
    }

    // 前一个是角色名 - 这是对话
    if (previousType === 'character') return 'dialogue';

    // 默认为动作
    return 'action';
  }, []);

  /**
   * 将纯文本转换为块数组
   */
  const textToBlocks = useCallback((text: string): FountainBlock[] => {
    const lines = text.split('\n');
    let previousType: BlockType | undefined;

    return lines.map((line) => {
      const type = identifyBlockType(line, previousType);
      previousType = type;
      return { type, content: line };
    });
  }, [identifyBlockType]);

  /**
   * 将块数组转换为纯文本
   */
  const blocksToText = useCallback((blocks: FountainBlock[]): string => {
    return blocks.map(block => block.content).join('\n');
  }, []);

  /**
   * 自动保存历史记录（防抖）
   */
  const scheduleHistorySave = useCallback((currentContent: string) => {
    // 清除之前的定时器
    if (historyTimeoutRef.current) {
      clearTimeout(historyTimeoutRef.current);
    }

    // 设置新的定时器（500ms防抖）
    historyTimeoutRef.current = setTimeout(() => {
      if (currentContent !== lastSavedContentRef.current) {
        saveToHistory(lastSavedContentRef.current);
        lastSavedContentRef.current = currentContent;
      }
    }, 500);
  }, [saveToHistory]);

  /**
   * 处理编辑器输入
   */
  const handleInput = useCallback(() => {
    if (!editorRef.current) return;

    const plainText = editorRef.current.innerText || '';
    updateContent(plainText);
    scheduleHistorySave(plainText);

    // 保存光标位置
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const preCaretRange = range.cloneRange();
      preCaretRange.selectNodeContents(editorRef.current);
      preCaretRange.setEnd(range.endContainer, range.endOffset);
      const cursorOffset = preCaretRange.toString().length;
      setCursorPosition(cursorOffset);
    }
  }, [updateContent, scheduleHistorySave, setCursorPosition]);

  /**
   * 处理键盘事件
   */
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    // Ctrl+Z - 撤销
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      saveToHistory(editor.content);
      undo();
      return;
    }

    // Ctrl+Y 或 Ctrl+Shift+Z - 重做
    if (
      ((e.ctrlKey || e.metaKey) && e.key === 'y') ||
      ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z')
    ) {
      e.preventDefault();
      saveToHistory(editor.content);
      redo();
      return;
    }
  }, [editor.content, saveToHistory, undo, redo]);

  /**
   * 初始化编辑器内容
   */
  useEffect(() => {
    if (editorRef.current && editor.content) {
      const currentText = editorRef.current.innerText || '';
      if (currentText !== editor.content) {
        editorRef.current.innerText = editor.content;
        lastSavedContentRef.current = editor.content;
      }
    }
  }, [editor.content]);

  /**
   * 清理定时器
   */
  useEffect(() => {
    return () => {
      if (historyTimeoutRef.current) {
        clearTimeout(historyTimeoutRef.current);
      }
    };
  }, []);

  /**
   * 获取块的CSS类名
   */
  const getBlockClassName = (type: BlockType): string => {
    return `fountain-${type}`;
  };

  /**
   * 渲染编辑器内容为HTML
   */
  const renderContent = useCallback(() => {
    if (!editorRef.current) return;

    const blocks = textToBlocks(editor.content);
    const html = blocks.map(block => {
      const className = getBlockClassName(block.type);
      const escapedContent = block.content
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      return `<div class="${className}">${escapedContent || '<br>'}</div>`;
    }).join('');

    // 保存光标位置 - 优先使用store中的cursorPosition，其次使用当前选中位置
    const selection = window.getSelection();
    let cursorOffset = editor.cursorPosition || 0;

    // 如果store中没有保存光标位置，尝试从当前选中位置获取
    if (editor.cursorPosition === 0 && selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const preCaretRange = range.cloneRange();
      preCaretRange.selectNodeContents(editorRef.current);
      preCaretRange.setEnd(range.endContainer, range.endOffset);
      const calculatedOffset = preCaretRange.toString().length;
      if (calculatedOffset > 0) {
        cursorOffset = calculatedOffset;
      }
    }

    // 更新内容
    editorRef.current.innerHTML = html;

    // 恢复光标位置
    try {
      const range = document.createRange();
      let charCount = 0;
      let found = false;

      const traverse = (node: Node): boolean => {
        if (found) return true;

        if (node.nodeType === Node.TEXT_NODE) {
          const nextCharCount = charCount + (node.textContent?.length || 0);
          if (cursorOffset <= nextCharCount) {
            range.setStart(node, cursorOffset - charCount);
            found = true;
            return true;
          }
          charCount = nextCharCount;
        } else {
          for (let i = 0; i < node.childNodes.length; i++) {
            if (traverse(node.childNodes[i])) return true;
          }
        }
        return false;
      };

      traverse(editorRef.current);
      if (found) {
        range.collapse(true);
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    } catch (e) {
      console.warn('Failed to restore cursor position:', e);
    }
  }, [editor.content, editor.cursorPosition, textToBlocks]);

  /**
   * 当内容变化时重新渲染
   */
  useEffect(() => {
    renderContent();
  }, [editor.content, renderContent]);

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 h-full overflow-hidden">
      {/* 工具栏 */}
      <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-3 bg-gray-50 dark:bg-gray-800 space-y-2">
        {/* 第一行：撤销/重做和统计 */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              saveToHistory(editor.content);
              undo();
            }}
            disabled={!canUndo}
            className="px-3 py-1.5 rounded bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium border border-gray-200 dark:border-gray-600 transition"
            title="撤销 (Ctrl+Z)"
          >
            ↶ 撤销
          </button>
          <button
            onClick={() => {
              saveToHistory(editor.content);
              redo();
            }}
            disabled={!canRedo}
            className="px-3 py-1.5 rounded bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium border border-gray-200 dark:border-gray-600 transition"
            title="重做 (Ctrl+Y)"
          >
            ↷ 重做
          </button>
          <div className="flex-1" />
          <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
            字数: {editor.content.length} | 行数: {editor.content.split('\n').length}
          </span>
        </div>

        {/* 第二行：Fountain元素按钮 */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              const newContent = editor.content + '\n\nINT. ';
              updateContent(newContent);
              scheduleHistorySave(newContent);
            }}
            className="px-3 py-1.5 rounded bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 text-sm font-medium transition"
            title="插入场景标题"
          >
            场景
          </button>
          <button
            onClick={() => {
              const newContent = editor.content + '\n\n角色名';
              updateContent(newContent);
              scheduleHistorySave(newContent);
            }}
            className="px-3 py-1.5 rounded bg-green-100 dark:bg-green-900 hover:bg-green-200 dark:hover:bg-green-800 text-sm font-medium transition"
            title="插入角色名"
          >
            角色
          </button>
          <button
            onClick={() => {
              const newContent = editor.content + '\n\n对话内容';
              updateContent(newContent);
              scheduleHistorySave(newContent);
            }}
            className="px-3 py-1.5 rounded bg-yellow-100 dark:bg-yellow-900 hover:bg-yellow-200 dark:hover:bg-yellow-800 text-sm font-medium transition"
            title="插入对话"
          >
            对话
          </button>
          <button
            onClick={() => {
              const newContent = editor.content + '\n\n动作描述';
              updateContent(newContent);
              scheduleHistorySave(newContent);
            }}
            className="px-3 py-1.5 rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-sm font-medium transition"
            title="插入动作"
          >
            动作
          </button>
          <button
            onClick={() => {
              const newContent = editor.content + '\n\n(台词)';
              updateContent(newContent);
              scheduleHistorySave(newContent);
            }}
            className="px-3 py-1.5 rounded bg-purple-100 dark:bg-purple-900 hover:bg-purple-200 dark:hover:bg-purple-800 text-sm font-medium transition"
            title="插入括号台词"
          >
            台词
          </button>
          <button
            onClick={() => {
              const newContent = editor.content + '\n\nFADE OUT.';
              updateContent(newContent);
              scheduleHistorySave(newContent);
            }}
            className="px-3 py-1.5 rounded bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 text-sm font-medium transition"
            title="插入过渡"
          >
            过渡
          </button>
        </div>
      </div>

      {/* 编辑区域 - 单一contentEditable容器 */}
      <div className="flex-1 overflow-auto p-8 bg-white dark:bg-gray-900">
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          className="outline-none prose dark:prose-invert max-w-none"
          style={{
            fontFamily: "'Courier New', monospace",
            fontSize: '14px',
            lineHeight: '1.8',
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
          }}
          spellCheck={false}
        />
      </div>
    </div>
  );
};

export default DirectEditor;

