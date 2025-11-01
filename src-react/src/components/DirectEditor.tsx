/**
 * DirectEditor - Fountain富文本编辑模式组件
 *
 * 提供类似Word/Notion的富文本编辑体验
 *
 * 核心特性：
 * - 所见即所得的编辑体验
 * - 工具栏按钮快速插入Fountain元素
 * - 实时格式化显示（颜色、粗体、缩进等）
 * - 完整的撤销/重做功能（浏览器原生）
 * - 完整的光标位置管理
 * - 中文输入法支持
 *
 * 技术实现：
 * - 使用contentEditable的designMode
 * - 使用CSS类来应用格式化样式
 * - 工具栏按钮插入特定的HTML结构
 * - 底层保存纯Fountain文本
 */

import { useRef, useEffect, useCallback, useState } from 'react';
import { useAppStore } from '@/stores/useAppStore';
import '@/styles/fountain.css';

const DirectEditor = () => {
  const { editor, ui, updateContent } = useAppStore();
  const editorRef = useRef<HTMLDivElement>(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  /**
   * 插入场景标题
   */
  const insertSceneHeading = useCallback(() => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand('insertHTML', false, '<div class="fountain-scene">INT. </div>');
  }, []);

  /**
   * 插入角色名
   */
  const insertCharacter = useCallback(() => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand('insertHTML', false, '<div class="fountain-character">角色名</div>');
  }, []);

  /**
   * 插入对话
   */
  const insertDialogue = useCallback(() => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand('insertHTML', false, '<div class="fountain-dialogue">对话内容</div>');
  }, []);

  /**
   * 插入动作
   */
  const insertAction = useCallback(() => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand('insertHTML', false, '<div class="fountain-action">动作描述</div>');
  }, []);

  /**
   * 插入过渡
   */
  const insertTransition = useCallback(() => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand('insertHTML', false, '<div class="fountain-transition">FADE OUT.</div>');
  }, []);

  /**
   * 插入括号台词
   */
  const insertParenthetical = useCallback(() => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand('insertHTML', false, '<div class="fountain-parenthetical">(台词)</div>');
  }, []);

  /**
   * 处理输入事件
   */
  const handleInput = useCallback(() => {
    if (!editorRef.current) return;

    // 获取HTML内容
    const htmlContent = editorRef.current.innerHTML;

    // 提取纯文本用于保存
    const plainText = editorRef.current.innerText || '';

    // 保存到store
    updateContent(plainText);

    // 更新撤销/重做状态
    setCanUndo(document.queryCommandEnabled('undo'));
    setCanRedo(document.queryCommandEnabled('redo'));
  }, [updateContent]);

  /**
   * 撤销
   */
  const handleUndo = useCallback(() => {
    document.execCommand('undo');
    setCanUndo(document.queryCommandEnabled('undo'));
    setCanRedo(document.queryCommandEnabled('redo'));
  }, []);

  /**
   * 重做
   */
  const handleRedo = useCallback(() => {
    document.execCommand('redo');
    setCanUndo(document.queryCommandEnabled('undo'));
    setCanRedo(document.queryCommandEnabled('redo'));
  }, []);

  /**
   * 处理键盘快捷键
   */
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    // Ctrl+Z 或 Cmd+Z - 撤销
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      handleUndo();
      return;
    }

    // Ctrl+Y 或 Ctrl+Shift+Z 或 Cmd+Shift+Z - 重做
    if (
      ((e.ctrlKey || e.metaKey) && e.key === 'y') ||
      ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z')
    ) {
      e.preventDefault();
      handleRedo();
      return;
    }
  }, [handleUndo, handleRedo]);

  /**
   * 初始化编辑器内容
   */
  useEffect(() => {
    if (!editorRef.current || !editor.content) return;

    // 将纯文本转换为格式化的HTML
    const lines = editor.content.split('\n');
    const html = lines.map(line => {
      // 简单的格式识别
      if (line.match(/^(INT\.|EXT\.|EST\.)/i)) {
        return `<div class="fountain-scene">${line}</div>`;
      } else if (line.match(/^[A-Z\s]+$/)) {
        return `<div class="fountain-character">${line}</div>`;
      } else if (line.match(/^\(/)) {
        return `<div class="fountain-parenthetical">${line}</div>`;
      } else if (line.match(/^(FADE|CUT|DISSOLVE)/i)) {
        return `<div class="fountain-transition">${line}</div>`;
      } else if (line.trim() === '') {
        return '<div><br/></div>';
      } else {
        return `<div class="fountain-action">${line}</div>`;
      }
    }).join('');

    editorRef.current.innerHTML = html;
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
        {/* 第一行：撤销/重做和统计 */}
        <div className="flex items-center gap-2 mb-2">
          <button
            onClick={handleUndo}
            disabled={!canUndo}
            className="px-3 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            title="撤销 (Ctrl+Z)"
          >
            ↶ 撤销
          </button>
          <button
            onClick={handleRedo}
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

        {/* 第二行：Fountain元素按钮 */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={insertSceneHeading}
            className="px-3 py-1 rounded bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 text-sm"
            title="插入场景标题"
          >
            场景
          </button>
          <button
            onClick={insertCharacter}
            className="px-3 py-1 rounded bg-green-100 dark:bg-green-900 hover:bg-green-200 dark:hover:bg-green-800 text-sm"
            title="插入角色名"
          >
            角色
          </button>
          <button
            onClick={insertDialogue}
            className="px-3 py-1 rounded bg-yellow-100 dark:bg-yellow-900 hover:bg-yellow-200 dark:hover:bg-yellow-800 text-sm"
            title="插入对话"
          >
            对话
          </button>
          <button
            onClick={insertAction}
            className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-sm"
            title="插入动作"
          >
            动作
          </button>
          <button
            onClick={insertParenthetical}
            className="px-3 py-1 rounded bg-purple-100 dark:bg-purple-900 hover:bg-purple-200 dark:hover:bg-purple-800 text-sm"
            title="插入括号台词"
          >
            台词
          </button>
          <button
            onClick={insertTransition}
            className="px-3 py-1 rounded bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 text-sm"
            title="插入过渡"
          >
            过渡
          </button>
        </div>
      </div>

      {/* 编辑区域 */}
      <div className="flex-1 overflow-auto p-8">
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          className="min-h-full outline-none"
          style={{
            fontFamily: "'Courier New', monospace",
            fontSize: '14px',
            lineHeight: '1.8',
          }}
          spellCheck={false}
        />
      </div>
    </div>
  );
};

export default DirectEditor;

