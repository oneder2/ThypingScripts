import { useState } from 'react';
import { useAppStore } from '@/stores/useAppStore';

const NavigationPanel = () => {
  const { editor } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');

  // 解析Fountain内容提取场景
  const parseScenes = (content: string) => {
    const lines = content.split('\n');
    const scenes: Array<{ title: string; line: number; content: string }> = [];
    
    lines.forEach((line, index) => {
      // 场景标题通常以大写字母开头，不包含对话标记
      if (line.trim().match(/^[A-Z][A-Z\s]+$/)) {
        scenes.push({
          title: line.trim(),
          line: index + 1,
          content: line.trim()
        });
      }
    });
    
    return scenes;
  };

  const scenes = parseScenes(editor.content);
  const filteredScenes = scenes.filter(scene =>
    scene.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSceneClick = (line: number) => {
    // 这里可以实现跳转到指定行的功能
    console.log('Jump to line:', line);
  };

  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* 标题 */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          场景导航
        </h2>
      </div>

      {/* 搜索框 */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <input
          type="text"
          placeholder="搜索场景..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {/* 场景列表 */}
      <div className="flex-1 overflow-y-auto">
        {filteredScenes.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            {searchTerm ? '未找到匹配的场景' : '暂无场景'}
          </div>
        ) : (
          <div className="p-2">
            {filteredScenes.map((scene, index) => (
              <div
                key={index}
                onClick={() => handleSceneClick(scene.line)}
                className="p-3 mb-1 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {scene.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      第 {scene.line} 行
                    </p>
                  </div>
                  <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 统计信息 */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <div>场景数量: {scenes.length}</div>
          <div>总行数: {editor.content.split('\n').length}</div>
        </div>
      </div>
    </div>
  );
};

export default NavigationPanel;
