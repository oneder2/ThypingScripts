import { useRef, useEffect } from 'react';
import { useAppStore } from '@/stores/useAppStore';

const ScriptEditor = () => {
  const { editor, ui, updateContent, setCursorPosition, setSelection } = useAppStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 处理内容变化
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateContent(e.target.value);
  };

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
      // 这里可以触发保存
      console.log('Save triggered');
    }
    
    // Ctrl+Z 撤销
    if (e.ctrlKey && e.key === 'z') {
      e.preventDefault();
      // 这里可以触发撤销
      console.log('Undo triggered');
    }
    
    // Ctrl+Y 重做
    if (e.ctrlKey && e.key === 'y') {
      e.preventDefault();
      // 这里可以触发重做
      console.log('Redo triggered');
    }
  };

  // 自动调整高度
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [editor.content]);

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
      {/* 编辑器标题栏 */}
      <div className="h-8 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-4">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {ui.showLineNumbers && `行 ${editor.cursorPosition}`}
        </span>
        <div className="flex-1" />
        <span className="text-xs text-gray-500 dark:text-gray-500">
          Fountain
        </span>
      </div>

      {/* 编辑器内容 */}
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
          className="w-full h-full p-4 resize-none border-none outline-none bg-transparent text-gray-900 dark:text-white font-mono text-sm leading-relaxed"
          style={{
            fontSize: `${ui.fontSize}px`,
            lineHeight: ui.wordWrap ? '1.6' : '1.2',
            whiteSpace: ui.wordWrap ? 'pre-wrap' : 'pre',
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
};

export default ScriptEditor;
