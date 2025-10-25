import { useState, useEffect, useRef } from 'react';

interface CompletionItem {
  text: string;
  type: 'character' | 'scene' | 'transition';
  description?: string;
}

interface SmartCompletionProps {
  content: string;
  cursorPosition: number;
  onSelect: (text: string) => void;
  onClose: () => void;
  isVisible: boolean;
}

const SmartCompletion = ({ content, cursorPosition, onSelect, onClose, isVisible }: SmartCompletionProps) => {
  const [suggestions, setSuggestions] = useState<CompletionItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  // 提取内容中的角色名和场景标题
  useEffect(() => {
    if (!isVisible) return;

    const lines = content.split('\n');
    const characters = new Set<string>();
    const scenes = new Set<string>();
    const transitions = new Set<string>();

    lines.forEach(line => {
      const trimmedLine = line.trim();
      
      // 提取角色名
      if (trimmedLine.match(/^[A-Z][A-Z\s\.]+$/) && 
          !trimmedLine.match(/^(INT\.|EXT\.|I\.|E\.|INT|EXT)/i) &&
          !trimmedLine.endsWith(':') &&
          trimmedLine.length > 1) {
        characters.add(trimmedLine);
      }
      
      // 提取场景标题
      if (trimmedLine.match(/^(INT\.|EXT\.|I\.|E\.|INT|EXT)\s+[A-Z\s]+/i)) {
        scenes.add(trimmedLine);
      }
      
      // 提取过渡
      if (trimmedLine.match(/^(FADE IN|FADE OUT|CUT TO|DISSOLVE TO|SMASH CUT|MATCH CUT|JUMP CUT|FADE TO BLACK|FADE TO WHITE):?$/i)) {
        transitions.add(trimmedLine);
      }
    });

    // 获取当前行的上下文
    const currentLine = lines.find((_, index) => {
      let pos = 0;
      for (let i = 0; i < index; i++) {
        pos += lines[i].length + 1; // +1 for newline
      }
      return pos <= cursorPosition && cursorPosition <= pos + lines[index].length;
    }) || '';

    const newSuggestions: CompletionItem[] = [];

    // 根据上下文提供建议
    if (currentLine.trim().match(/^(INT\.|EXT\.|I\.|E\.|INT|EXT)\s*$/i)) {
      // 场景标题建议
      scenes.forEach(scene => {
        newSuggestions.push({
          text: scene,
          type: 'scene',
          description: '场景标题'
        });
      });
      
      // 添加常用场景
      newSuggestions.push(
        { text: 'INT. 咖啡厅 - 白天', type: 'scene', description: '常用场景' },
        { text: 'EXT. 街道 - 夜晚', type: 'scene', description: '常用场景' },
        { text: 'INT. 办公室 - 白天', type: 'scene', description: '常用场景' },
        { text: 'EXT. 公园 - 下午', type: 'scene', description: '常用场景' }
      );
    } else if (currentLine.trim() === '' || currentLine.trim().match(/^[A-Z\s]*$/)) {
      // 角色名建议
      characters.forEach(character => {
        newSuggestions.push({
          text: character,
          type: 'character',
          description: '已使用角色'
        });
      });
      
      // 添加常用角色名
      newSuggestions.push(
        { text: 'JOHN', type: 'character', description: '常用角色' },
        { text: 'MARY', type: 'character', description: '常用角色' },
        { text: '服务员', type: 'character', description: '常用角色' },
        { text: 'NARRATOR', type: 'character', description: '常用角色' }
      );
    } else if (currentLine.trim().startsWith('>')) {
      // 过渡建议
      transitions.forEach(transition => {
        newSuggestions.push({
          text: transition,
          type: 'transition',
          description: '已使用过渡'
        });
      });
      
      // 添加常用过渡
      newSuggestions.push(
        { text: '>FADE IN', type: 'transition', description: '常用过渡' },
        { text: '>FADE OUT', type: 'transition', description: '常用过渡' },
        { text: '>CUT TO:', type: 'transition', description: '常用过渡' },
        { text: '>DISSOLVE TO:', type: 'transition', description: '常用过渡' }
      );
    }

    setSuggestions(newSuggestions.slice(0, 8)); // 限制建议数量
    setSelectedIndex(0);
  }, [content, cursorPosition, isVisible]);

  // 键盘导航
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isVisible) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % suggestions.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
          break;
        case 'Enter':
          e.preventDefault();
          if (suggestions[selectedIndex]) {
            onSelect(suggestions[selectedIndex].text);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, suggestions, selectedIndex, onSelect, onClose]);

  // 滚动到选中项
  useEffect(() => {
    if (listRef.current && selectedIndex >= 0) {
      const selectedElement = listRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (!isVisible || suggestions.length === 0) return null;

  return (
    <div className="absolute z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
      <div ref={listRef} className="py-1">
        {suggestions.map((suggestion, index) => (
          <div
            key={`${suggestion.text}-${index}`}
            className={`px-3 py-2 cursor-pointer flex items-center gap-2 ${
              index === selectedIndex
                ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            onClick={() => onSelect(suggestion.text)}
          >
            <div className={`w-2 h-2 rounded-full ${
              suggestion.type === 'character' ? 'bg-green-500' :
              suggestion.type === 'scene' ? 'bg-blue-500' :
              'bg-purple-500'
            }`} />
            <div className="flex-1">
              <div className="font-medium">{suggestion.text}</div>
              {suggestion.description && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {suggestion.description}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
        使用 ↑↓ 导航，Enter 选择，Esc 关闭
      </div>
    </div>
  );
};

export default SmartCompletion;
