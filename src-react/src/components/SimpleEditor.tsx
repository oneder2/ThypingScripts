import { useRef, forwardRef } from 'react';
import { useAppStore } from '@/stores/useAppStore';

const SimpleEditor = forwardRef<HTMLTextAreaElement>((_props, ref) => {
  const { editor, ui, updateContent, setCursorPosition, setSelection, undo, redo } = useAppStore();
  const internalRef = useRef<HTMLTextAreaElement>(null);
  const textareaRef = ref || internalRef;

  // 处理内容变化 - 原子性操作
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    updateContent(newContent);
    
    // 保持光标位置
    setTimeout(() => {
      const element = typeof textareaRef === 'function' ? null : textareaRef.current;
      if (element) {
        const cursorPos = element.selectionStart;
        element.setSelectionRange(cursorPos, cursorPos);
      }
    }, 0);
  };

  // 处理光标位置变化 - 一致性保证
  const handleSelectionChange = () => {
    const element = typeof textareaRef === 'function' ? null : textareaRef.current;
    if (element) {
      const start = element.selectionStart;
      const end = element.selectionEnd;
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
  };

  // 移除自动调整高度和自动聚焦，避免干扰光标位置

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 h-full">
      {/* 编辑器标题栏 */}
      <div className="h-8 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-4">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          行 {editor.cursorPosition}
        </span>
        <div className="flex-1" />
        <span className="text-xs text-gray-500 dark:text-gray-500">
          Fountain 源码
        </span>
      </div>

      {/* 编辑器内容 - 简单的textarea，无语法高亮 */}
      <div className="flex-1 relative">
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
      </div>

      {/* 状态栏 */}
      <div className="h-6 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center px-4 text-xs text-gray-500 dark:text-gray-400">
        <span>字符数: {editor.content.length}</span>
        <span className="ml-4">单词数: {editor.content.split(/\s+/).filter(word => word.length > 0).length}</span>
        <div className="flex-1" />
        <span>UTF-8</span>
      </div>
    </div>
  );
});

SimpleEditor.displayName = 'SimpleEditor';

export default SimpleEditor;
