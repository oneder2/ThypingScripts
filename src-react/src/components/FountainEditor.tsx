import { useRef, useEffect, useState } from 'react';
import { useAppStore } from '@/stores/useAppStore';
import { FountainHighlighter, HighlightedLine } from '@/utils/fountainHighlighter';
import '@/styles/fountain.css';

const FountainEditor = () => {
  const { editor, ui, updateContent, setCursorPosition, setSelection, undo, redo } = useAppStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [highlightedLines, setHighlightedLines] = useState<HighlightedLine[]>([]);

  // 处理内容变化
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateContent(e.target.value);
  };

  // 更新语法高亮
  useEffect(() => {
    const highlighted = FountainHighlighter.highlightContent(editor.content);
    setHighlightedLines(highlighted);
  }, [editor.content]);

  // 处理光标位置变化
  const handleSelectionChange = () => {
    if (textareaRef.current) {
      setCursorPosition(textareaRef.current.selectionStart);
      setSelection({
        start: textareaRef.current.selectionStart,
        end: textareaRef.current.selectionEnd,
      });
    }
  };

  // 处理键盘快捷键
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
  };

  // 自动调整高度
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [editor.content]);

  // Fountain编辑工具栏
  const FountainToolbar = () => (
    <div className="h-10 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-4 gap-2">
      {/* 场景标题按钮 */}
      <button
        onClick={() => {
          const textarea = textareaRef.current;
          if (textarea) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const selectedText = editor.content.substring(start, end);
            const newText = `INT. ${selectedText || '场景名称'} - 时间\n\n`;
            const newContent = editor.content.substring(0, start) + newText + editor.content.substring(end);
            updateContent(newContent);
            setTimeout(() => {
              textarea.focus();
              textarea.setSelectionRange(start + newText.length, start + newText.length);
            }, 0);
          }
        }}
        className="px-3 py-1.5 text-xs bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300 rounded hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors"
        title="插入场景标题"
      >
        场景
      </button>

      {/* 角色名按钮 */}
      <button
        onClick={() => {
          const textarea = textareaRef.current;
          if (textarea) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const selectedText = editor.content.substring(start, end);
            const newText = `${selectedText || '角色名'}\n\n`;
            const newContent = editor.content.substring(0, start) + newText + editor.content.substring(end);
            updateContent(newContent);
            setTimeout(() => {
              textarea.focus();
              textarea.setSelectionRange(start + newText.length, start + newText.length);
            }, 0);
          }
        }}
        className="px-3 py-1.5 text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
        title="插入角色名"
      >
        角色
      </button>

      {/* 对话按钮 */}
      <button
        onClick={() => {
          const textarea = textareaRef.current;
          if (textarea) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const selectedText = editor.content.substring(start, end);
            const newText = `\t${selectedText || '对话内容'}\n\n`;
            const newContent = editor.content.substring(0, start) + newText + editor.content.substring(end);
            updateContent(newContent);
            setTimeout(() => {
              textarea.focus();
              textarea.setSelectionRange(start + newText.length, start + newText.length);
            }, 0);
          }
        }}
        className="px-3 py-1.5 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
        title="插入对话"
      >
        对话
      </button>

      {/* 动作描述按钮 */}
      <button
        onClick={() => {
          const textarea = textareaRef.current;
          if (textarea) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const selectedText = editor.content.substring(start, end);
            const newText = `${selectedText || '动作描述'}\n\n`;
            const newContent = editor.content.substring(0, start) + newText + editor.content.substring(end);
            updateContent(newContent);
            setTimeout(() => {
              textarea.focus();
              textarea.setSelectionRange(start + newText.length, start + newText.length);
            }, 0);
          }
        }}
        className="px-3 py-1.5 text-xs bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300 rounded hover:bg-orange-200 dark:hover:bg-orange-800 transition-colors"
        title="插入动作描述"
      >
        动作
      </button>

      {/* 过渡按钮 */}
      <button
        onClick={() => {
          const textarea = textareaRef.current;
          if (textarea) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const newText = `\t\tFADE IN:\n\n`;
            const newContent = editor.content.substring(0, start) + newText + editor.content.substring(end);
            updateContent(newContent);
            setTimeout(() => {
              textarea.focus();
              textarea.setSelectionRange(start + newText.length, start + newText.length);
            }, 0);
          }
        }}
        className="px-3 py-1.5 text-xs bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 rounded hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
        title="插入过渡"
      >
        过渡
      </button>

      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />

      {/* 格式化按钮 */}
      <button
        onClick={() => {
          const textarea = textareaRef.current;
          if (textarea) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const selectedText = editor.content.substring(start, end);
            const newText = `(${selectedText || '旁白'})\n\n`;
            const newContent = editor.content.substring(0, start) + newText + editor.content.substring(end);
            updateContent(newContent);
            setTimeout(() => {
              textarea.focus();
              textarea.setSelectionRange(start + newText.length, start + newText.length);
            }, 0);
          }
        }}
        className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        title="插入旁白"
      >
        旁白
      </button>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 h-full">
      {/* Fountain编辑工具栏 */}
      <FountainToolbar />

      {/* 编辑器标题栏 */}
      <div className="h-8 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-4">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {ui.showLineNumbers && `行 ${editor.cursorPosition}`}
        </span>
        <div className="flex-1" />
        <span className="text-xs text-gray-500 dark:text-gray-500">
          Fountain 直接编辑
        </span>
      </div>

      {/* 编辑器内容 */}
      <div className="flex-1 relative">
        {/* 语法高亮背景 */}
        <div className="absolute inset-0 p-4 pointer-events-none overflow-hidden z-0">
          <div className="fountain-editor" style={{
            fontSize: `${ui.fontSize}px`,
            lineHeight: ui.wordWrap ? '1.6' : '1.2',
            whiteSpace: ui.wordWrap ? 'pre-wrap' : 'pre',
          }}>
            {highlightedLines.map((line, index) => (
              <div key={index} className={line.className}>
                {line.text || '\u00A0'}
              </div>
            ))}
          </div>
        </div>
        
        {/* 可编辑文本区域 */}
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
          className="w-full h-full p-4 resize-none border-none outline-none bg-transparent text-transparent font-mono text-sm leading-relaxed relative z-10 caret-gray-900 dark:caret-gray-100"
          style={{
            fontSize: `${ui.fontSize}px`,
            lineHeight: ui.wordWrap ? '1.6' : '1.2',
            whiteSpace: ui.wordWrap ? 'pre-wrap' : 'pre',
            caretColor: ui.theme === 'dark' ? '#f3f4f6' : '#111827',
          }}
        />
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

export default FountainEditor;
