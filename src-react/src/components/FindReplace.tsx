import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/stores/useAppStore';

interface FindReplaceProps {
  isOpen: boolean;
  onClose: () => void;
}

const FindReplace = ({ isOpen, onClose }: FindReplaceProps) => {
  const { editor, updateContent } = useAppStore();
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [matchCase, setMatchCase] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [currentMatch, setCurrentMatch] = useState(0);
  const [totalMatches, setTotalMatches] = useState(0);
  const [matches, setMatches] = useState<number[]>([]);
  
  const findInputRef = useRef<HTMLInputElement>(null);

  // 查找匹配项
  const findMatches = (text: string, searchText: string) => {
    if (!searchText) return [];
    
    const flags = matchCase ? 'g' : 'gi';
    const pattern = wholeWord ? `\\b${searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b` : searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(pattern, flags);
    const matches: number[] = [];
    let match;
    
    while ((match = regex.exec(text)) !== null) {
      matches.push(match.index);
    }
    
    return matches;
  };

  // 更新匹配结果
  useEffect(() => {
    if (findText) {
      const newMatches = findMatches(editor.content, findText);
      setMatches(newMatches);
      setTotalMatches(newMatches.length);
      setCurrentMatch(0);
    } else {
      setMatches([]);
      setTotalMatches(0);
      setCurrentMatch(0);
    }
  }, [findText, editor.content, matchCase, wholeWord]);

  // 跳转到下一个匹配
  const goToNext = () => {
    if (matches.length > 0) {
      const nextIndex = (currentMatch + 1) % matches.length;
      setCurrentMatch(nextIndex);
      scrollToMatch(matches[nextIndex]);
    }
  };

  // 跳转到上一个匹配
  const goToPrevious = () => {
    if (matches.length > 0) {
      const prevIndex = currentMatch === 0 ? matches.length - 1 : currentMatch - 1;
      setCurrentMatch(prevIndex);
      scrollToMatch(matches[prevIndex]);
    }
  };

  // 滚动到匹配位置
  const scrollToMatch = (position: number) => {
    // 这里可以实现滚动到指定位置的功能
    console.log('Scroll to position:', position);
  };

  // 替换当前匹配
  const replaceCurrent = () => {
    if (matches.length > 0 && currentMatch < matches.length) {
      const start = matches[currentMatch];
      const end = start + findText.length;
      const newContent = editor.content.substring(0, start) + replaceText + editor.content.substring(end);
      updateContent(newContent);
      
      // 更新匹配位置
      const newMatches = findMatches(newContent, findText);
      setMatches(newMatches);
      setTotalMatches(newMatches.length);
      
      if (currentMatch >= newMatches.length) {
        setCurrentMatch(Math.max(0, newMatches.length - 1));
      }
    }
  };

  // 替换所有匹配
  const replaceAll = () => {
    if (findText) {
      const flags = matchCase ? 'g' : 'gi';
      const pattern = wholeWord ? `\\b${findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b` : findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(pattern, flags);
      const newContent = editor.content.replace(regex, replaceText);
      updateContent(newContent);
      
      setMatches([]);
      setTotalMatches(0);
      setCurrentMatch(0);
    }
  };

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter' && e.ctrlKey) {
      goToNext();
    } else if (e.key === 'Enter' && e.shiftKey) {
      goToPrevious();
    }
  };

  // 聚焦到查找输入框
  useEffect(() => {
    if (isOpen && findInputRef.current) {
      findInputRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="absolute top-0 left-0 right-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 z-20">
      <div className="flex items-center gap-4">
        {/* 查找输入框 */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">查找:</label>
          <input
            ref={findInputRef}
            type="text"
            value={findText}
            onChange={(e) => setFindText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="输入要查找的文本..."
          />
        </div>

        {/* 替换输入框 */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">替换:</label>
          <input
            type="text"
            value={replaceText}
            onChange={(e) => setReplaceText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="输入替换文本..."
          />
        </div>

        {/* 选项 */}
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={matchCase}
              onChange={(e) => setMatchCase(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">区分大小写</span>
          </label>
          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={wholeWord}
              onChange={(e) => setWholeWord(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">全词匹配</span>
          </label>
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center gap-2">
          <button
            onClick={goToPrevious}
            disabled={totalMatches === 0}
            className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            上一个
          </button>
          <button
            onClick={goToNext}
            disabled={totalMatches === 0}
            className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            下一个
          </button>
          <button
            onClick={replaceCurrent}
            disabled={totalMatches === 0}
            className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            替换
          </button>
          <button
            onClick={replaceAll}
            disabled={totalMatches === 0}
            className="px-3 py-1 text-sm bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            全部替换
          </button>
        </div>

        {/* 匹配信息 */}
        {totalMatches > 0 && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {currentMatch + 1} / {totalMatches}
          </div>
        )}

        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default FindReplace;

