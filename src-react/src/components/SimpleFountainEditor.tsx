import { useRef, useEffect, useState } from 'react';
import { useAppStore } from '@/stores/useAppStore';
import SmartCompletion from './SmartCompletion';

const SimpleFountainEditor = () => {
  const { editor, ui, updateContent, setCursorPosition, setSelection, undo, redo } = useAppStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showCompletion, setShowCompletion] = useState(false);
  const [completionPosition, setCompletionPosition] = useState({ top: 0, left: 0 });

  // 处理内容变化 - 原子性操作
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    updateContent(newContent);
  };

  // 处理光标位置变化 - 一致性保证
  const handleSelectionChange = () => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      setCursorPosition(start);
      setSelection({
        start,
        end,
      });
    }
  };

  // 处理键盘快捷键 - 隔离性保证
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl+S 保存
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      console.log('Save triggered');
    }
    
    // Ctrl+Z 撤销
    if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      undo();
    }
    
    // Ctrl+Y 或 Ctrl+Shift+Z 重做
    if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'z')) {
      e.preventDefault();
      redo();
    }

    // 智能补全触发
    if (e.key === ' ' || e.key === 'Enter' || e.key === 'Tab') {
      setTimeout(() => {
        checkForCompletion();
      }, 100);
    }
  };

  // 自动调整高度 - 持久性保证
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [editor.content]);

  // 确保光标位置正确
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  // 检查是否需要显示智能补全
  const checkForCompletion = () => {
    if (!textareaRef.current) return;

    const cursorPos = textareaRef.current.selectionStart;
    const currentLine = editor.content.substring(0, cursorPos).split('\n').pop() || '';
    
    // 检查是否在需要补全的位置
    if (currentLine.match(/^(INT\.|EXT\.|I\.|E\.|INT|EXT)\s*$/i) ||
        currentLine.trim() === '' ||
        currentLine.match(/^[A-Z\s]*$/i) ||
        currentLine.startsWith('>')) {
      
      // 计算补全框位置
      const textarea = textareaRef.current;
      const rect = textarea.getBoundingClientRect();
      const scrollTop = textarea.scrollTop;
      const lineHeight = 20; // 估算行高
      const lines = editor.content.substring(0, cursorPos).split('\n').length;
      
      setCompletionPosition({
        top: rect.top + (lines * lineHeight) - scrollTop + 25,
        left: rect.left + 10
      });
      
      setShowCompletion(true);
    } else {
      setShowCompletion(false);
    }
  };

  // 处理智能补全选择
  const handleCompletionSelect = (text: string) => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const newContent = editor.content.substring(0, start) + text + editor.content.substring(end);
      updateContent(newContent);
      
      // 设置光标位置
      setTimeout(() => {
        if (textareaRef.current) {
          const newCursorPos = start + text.length;
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
        }
      }, 0);
    }
    setShowCompletion(false);
  };

  // 插入Fountain格式内容的辅助函数
  const insertFountainElement = (element: string) => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const selectedText = editor.content.substring(start, end);
      const newText = element.replace('{SELECTED}', selectedText);
      const newContent = editor.content.substring(0, start) + newText + editor.content.substring(end);
      updateContent(newContent);
      
      // 设置光标位置到插入内容的末尾
      setTimeout(() => {
        if (textareaRef.current) {
          const newCursorPos = start + newText.length;
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
        }
      }, 0);
    }
  };

  // Fountain编辑工具栏 - 类似Word/Notion的快捷编辑体验
  const FountainToolbar = () => (
    <div className="h-12 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-4 gap-2 overflow-x-auto">
      {/* 场景相关 */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => insertFountainElement('INT. {SELECTED} - 时间\n\n')}
          className="px-3 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex items-center gap-1"
          title="插入室内场景标题"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          室内
        </button>
        <button
          onClick={() => insertFountainElement('EXT. {SELECTED} - 时间\n\n')}
          className="px-3 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex items-center gap-1"
          title="插入室外场景标题"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          室外
        </button>
      </div>

      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />

      {/* 角色和对话 */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => insertFountainElement('{SELECTED}\n\n')}
          className="px-3 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex items-center gap-1"
          title="插入角色名"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          角色
        </button>
        <button
          onClick={() => insertFountainElement('{SELECTED}\n\n')}
          className="px-3 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex items-center gap-1"
          title="插入对话"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          对话
        </button>
        <button
          onClick={() => insertFountainElement('({SELECTED})\n\n')}
          className="px-3 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex items-center gap-1"
          title="插入括号台词"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
          旁白
        </button>
      </div>

      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />

      {/* 过渡和格式 */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => insertFountainElement('>FADE IN\n\n')}
          className="px-3 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex items-center gap-1"
          title="插入淡入过渡"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          淡入
        </button>
        <button
          onClick={() => insertFountainElement('>FADE OUT\n\n')}
          className="px-3 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex items-center gap-1"
          title="插入淡出过渡"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
          淡出
        </button>
        <button
          onClick={() => insertFountainElement('>CUT TO:\n\n')}
          className="px-3 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex items-center gap-1"
          title="插入切换过渡"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          切换
        </button>
      </div>

      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />

      {/* 工具和注释 */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => insertFountainElement('[[{SELECTED}]]\n\n')}
          className="px-3 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex items-center gap-1"
          title="插入注释"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
          注释
        </button>
        <button
          onClick={() => insertFountainElement('Title: {SELECTED}\nAuthor: \nDraft date: \n\n')}
          className="px-3 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex items-center gap-1"
          title="插入标题页信息"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          标题页
        </button>
      </div>

      <div className="flex-1" />

      {/* 格式化工具 */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => insertFountainElement('**{SELECTED}**')}
          className="px-2 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors font-bold"
          title="粗体"
        >
          B
        </button>
        <button
          onClick={() => insertFountainElement('*{SELECTED}*')}
          className="px-2 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors italic"
          title="斜体"
        >
          I
        </button>
        <button
          onClick={() => insertFountainElement('_{SELECTED}_')}
          className="px-2 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors underline"
          title="下划线"
        >
          U
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 h-full">
      {/* Fountain编辑工具栏 */}
      <FountainToolbar />

      {/* 编辑器标题栏 */}
      <div className="h-8 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-4">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          行 {editor.cursorPosition}
        </span>
        <div className="flex-1" />
        <span className="text-xs text-gray-500 dark:text-gray-500">
          Fountain 编辑
        </span>
      </div>

      {/* 编辑器内容 - 简单的textarea，无语法高亮 */}
      <div className="flex-1 relative overflow-hidden">
        <textarea
          ref={textareaRef}
          value={editor.content}
          onChange={handleContentChange}
          onSelect={handleSelectionChange}
          onKeyDown={handleKeyDown}
          placeholder="开始编写您的剧本...

示例：
FADE IN:

EXT. 咖啡厅 - 白天

一个忙碌的咖啡厅，顾客来来往往。

JOHN
（坐下）
你好，我要一杯咖啡。

服务员
好的，马上来。

JOHN
谢谢。

服务员离开，JOHN看着窗外。

FADE OUT."
          className="w-full h-full p-4 resize-none border-none outline-none bg-transparent text-gray-900 dark:text-gray-100 font-mono text-sm leading-relaxed overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent"
          style={{
            fontSize: `${ui.fontSize}px`,
            lineHeight: ui.wordWrap ? '1.6' : '1.2',
            whiteSpace: ui.wordWrap ? 'pre-wrap' : 'pre',
            caretColor: ui.theme === 'dark' ? '#f3f4f6' : '#111827',
            minHeight: '100%',
          }}
        />
        
        {/* 智能补全组件 */}
        {showCompletion && (
          <div
            className="absolute z-50"
            style={{
              top: `${completionPosition.top}px`,
              left: `${completionPosition.left}px`,
            }}
          >
            <SmartCompletion
              content={editor.content}
              cursorPosition={editor.cursorPosition}
              onSelect={handleCompletionSelect}
              onClose={() => setShowCompletion(false)}
              isVisible={showCompletion}
            />
          </div>
        )}
      </div>

      {/* 状态栏 */}
      <div className="h-6 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center px-4 text-xs text-gray-500 dark:text-gray-400">
        <span>字符数: {editor.content.length}</span>
        <span className="ml-4">单词数: {editor.content.split(/\s+/).filter(word => word.length > 0).length}</span>
        <div className="flex-1" />
        <span>Fountain 格式</span>
      </div>
    </div>
  );
};

export default SimpleFountainEditor;
