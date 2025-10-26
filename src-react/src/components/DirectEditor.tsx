import { useRef, useEffect, useState, useCallback } from 'react';
import { useAppStore } from '@/stores/useAppStore';

// Fountain格式处理函数
const formatFountainText = (text: string): string => {
  return text
    // 处理加粗 **text**
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // 处理斜体 *text*
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    // 处理下划线 _text_
    .replace(/_([^_]+)_/g, '<u>$1</u>')
    // 处理删除线 ~~text~~
    .replace(/~~(.*?)~~/g, '<del>$1</del>')
    // 处理上标 ^text^
    .replace(/\^([^^]+)\^/g, '<sup>$1</sup>')
    // 处理下标 ~text~
    .replace(/~([^~]+)~/g, '<sub>$1</sub>');
};

// Fountain元素类型
type FountainElementType = 'scene-heading' | 'character' | 'dialogue' | 'action' | 'parenthetical' | 'transition' | 'title-page';

interface FountainElement {
  type: FountainElementType;
  content: string;
  formattedContent: string;
  lineNumber: number;
}

const DirectEditor = () => {
  const { editor, ui, updateContent } = useAppStore();
  const editorRef = useRef<HTMLDivElement>(null);
  const [elements, setElements] = useState<FountainElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<number | null>(null);

  // 解析Fountain内容为元素
  const parseFountainContent = useCallback((content: string): FountainElement[] => {
    const lines = content.split('\n');
    const parsedElements: FountainElement[] = [];
    let inDialogue = false;
    let currentCharacter = '';

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      if (!trimmedLine) {
        return; // 跳过空行
      }

      // 标题页信息
      if (trimmedLine.includes(':') && !inDialogue) {
        const [key, value] = trimmedLine.split(':', 2);
        if (['Title', 'Credit', 'Author', 'Draft date', 'Contact'].includes(key.trim())) {
          parsedElements.push({
            type: 'title-page',
            content: trimmedLine,
            formattedContent: `<strong>${key.trim()}:</strong> ${value.trim()}`,
            lineNumber: index
          });
          return;
        }
      }

      // 强制元素标记
      if (trimmedLine.startsWith('.')) {
        parsedElements.push({
          type: 'scene-heading',
          content: trimmedLine.substring(1),
          formattedContent: trimmedLine.substring(1).toUpperCase(),
          lineNumber: index
        });
        inDialogue = false;
      }
      else if (trimmedLine.startsWith('@')) {
        parsedElements.push({
          type: 'action',
          content: trimmedLine.substring(1),
          formattedContent: formatFountainText(trimmedLine.substring(1)),
          lineNumber: index
        });
        inDialogue = false;
      }
      else if (trimmedLine.startsWith('#')) {
        currentCharacter = trimmedLine.substring(1);
        parsedElements.push({
          type: 'character',
          content: currentCharacter,
          formattedContent: currentCharacter,
          lineNumber: index
        });
        inDialogue = true;
      }
      // 场景标题
      else if (trimmedLine.match(/^(INT\.|EXT\.|I\.|E\.|INT|EXT)\s+[A-Z\s]+/i)) {
        parsedElements.push({
          type: 'scene-heading',
          content: trimmedLine,
          formattedContent: trimmedLine.toUpperCase(),
          lineNumber: index
        });
        inDialogue = false;
      }
      // 角色名
      else if (trimmedLine.match(/^[A-Z][A-Z\s\.]+$/) && 
               !trimmedLine.match(/^(INT\.|EXT\.|I\.|E\.|INT|EXT)/i) &&
               !trimmedLine.endsWith(':') &&
               trimmedLine.length > 1) {
        currentCharacter = trimmedLine;
        parsedElements.push({
          type: 'character',
          content: trimmedLine,
          formattedContent: trimmedLine,
          lineNumber: index
        });
        inDialogue = true;
      }
      // 对话
      else if (inDialogue && currentCharacter && !trimmedLine.startsWith('(') && !trimmedLine.startsWith('[')) {
        parsedElements.push({
          type: 'dialogue',
          content: trimmedLine,
          formattedContent: formatFountainText(trimmedLine),
          lineNumber: index
        });
      }
      // 括号台词
      else if (trimmedLine.startsWith('(') && trimmedLine.endsWith(')')) {
        parsedElements.push({
          type: 'parenthetical',
          content: trimmedLine,
          formattedContent: trimmedLine,
          lineNumber: index
        });
      }
      // 过渡
      else if (trimmedLine.startsWith('>') || 
               trimmedLine.match(/^(FADE IN|FADE OUT|CUT TO|DISSOLVE TO|SMASH CUT|MATCH CUT|JUMP CUT|FADE TO BLACK|FADE TO WHITE):?$/i)) {
        parsedElements.push({
          type: 'transition',
          content: trimmedLine,
          formattedContent: trimmedLine,
          lineNumber: index
        });
        inDialogue = false;
      }
      // 动作/描述
      else {
        parsedElements.push({
          type: 'action',
          content: trimmedLine,
          formattedContent: formatFountainText(trimmedLine),
          lineNumber: index
        });
        inDialogue = false;
      }
    });

    return parsedElements;
  }, []);

  // 更新元素列表
  useEffect(() => {
    const newElements = parseFountainContent(editor.content);
    setElements(newElements);
  }, [editor.content, parseFountainContent]);

  // 处理元素点击
  const handleElementClick = (index: number) => {
    setSelectedElement(index);
  };

  // 处理元素内容变化
  const handleElementChange = (index: number, newContent: string) => {
    const lines = editor.content.split('\n');
    lines[elements[index].lineNumber] = newContent;
    const newContentToUpdate = lines.join('\n');
    updateContent(newContentToUpdate);
    
    // 保持元素选择状态
    setSelectedElement(index);
  };

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // 在元素后插入新行
      const lines = editor.content.split('\n');
      const insertIndex = elements[index].lineNumber + 1;
      lines.splice(insertIndex, 0, '');
      const newContent = lines.join('\n');
      updateContent(newContent);
    }
  };

  // 渲染元素
  const renderElement = (element: FountainElement, index: number) => {
    const isSelected = selectedElement === index;
    
    return (
      <div
        key={index}
        className={`fountain-element ${element.type} ${isSelected ? 'selected' : ''}`}
        onClick={() => handleElementClick(index)}
        onKeyDown={(e) => handleKeyDown(e, index)}
        contentEditable
        suppressContentEditableWarning
        onInput={(e) => {
          const newContent = e.currentTarget.textContent || '';
          handleElementChange(index, newContent);
        }}
        onBlur={(e) => {
          const newContent = e.currentTarget.textContent || '';
          handleElementChange(index, newContent);
        }}
        onCompositionStart={() => {}}
        onCompositionEnd={() => {}}
        style={{
          outline: 'none',
          minHeight: '1.5em',
          padding: '2px 4px',
          margin: '1px 0',
          borderRadius: '2px',
          cursor: 'text',
          ...(isSelected && {
            backgroundColor: ui.theme === 'dark' ? '#374151' : '#f3f4f6',
            border: `1px solid ${ui.theme === 'dark' ? '#6b7280' : '#d1d5db'}`
          })
        }}
        dangerouslySetInnerHTML={{ __html: element.formattedContent }}
      />
    );
  };

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 h-full">
      {/* 编辑器标题栏 */}
      <div className="h-8 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-4">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          直接编辑模式
        </span>
        <div className="flex-1" />
        <span className="text-xs text-gray-500 dark:text-gray-500">
          Fountain 渲染编辑
        </span>
      </div>

      {/* 编辑器内容 */}
      <div 
        ref={editorRef}
        className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent"
        style={{
          fontFamily: 'Georgia, serif',
          lineHeight: '1.6',
          color: ui.theme === 'dark' ? '#e5e7eb' : '#374151',
        }}
      >
        {elements.length > 0 ? (
          <div className="max-w-4xl mx-auto">
            {elements.map((element, index) => renderElement(element, index))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>开始编写剧本以查看渲染编辑</p>
            </div>
          </div>
        )}
      </div>

      {/* 状态栏 */}
      <div className="h-6 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center px-4 text-xs text-gray-500 dark:text-gray-400">
        <span>字符数: {editor.content.length}</span>
        <span className="ml-4">单词数: {editor.content.split(/\s+/).filter(word => word.length > 0).length}</span>
        <div className="flex-1" />
        <span>直接编辑</span>
      </div>
    </div>
  );
};

export default DirectEditor;
