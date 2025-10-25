import { useState } from 'react';
import { useAppStore } from '@/stores/useAppStore';

const NavigationPanel = () => {
  const { editor } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'outline' | 'structure'>('outline');

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

  // 解析剧本结构
  const parseStructure = (content: string) => {
    const lines = content.split('\n');
    const structure: Array<{ type: string; title: string; line: number; content: string }> = [];
    
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // 场景标题
      if (trimmedLine.match(/^[A-Z][A-Z\s]+$/)) {
        structure.push({
          type: 'scene',
          title: trimmedLine,
          line: index + 1,
          content: trimmedLine
        });
      }
      // 角色名
      else if (trimmedLine.match(/^[A-Z][A-Z\s]*$/)) {
        structure.push({
          type: 'character',
          title: trimmedLine,
          line: index + 1,
          content: trimmedLine
        });
      }
      // 过渡
      else if (trimmedLine.match(/^(FADE IN|FADE OUT|CUT TO|DISSOLVE TO)/i)) {
        structure.push({
          type: 'transition',
          title: trimmedLine,
          line: index + 1,
          content: trimmedLine
        });
      }
    });
    
    return structure;
  };

  const scenes = parseScenes(editor.content);
  const structure = parseStructure(editor.content);
  const filteredScenes = scenes.filter(scene =>
    scene.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredStructure = structure.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSceneClick = (line: number) => {
    // 这里可以实现跳转到指定行的功能
    console.log('Jump to line:', line);
  };

  const renderOutline = () => (
    <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
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
  );

  const renderStructure = () => (
    <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
      {filteredStructure.length === 0 ? (
        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
          {searchTerm ? '未找到匹配的结构' : '暂无结构'}
        </div>
      ) : (
        <div className="p-2">
          {filteredStructure.map((item, index) => (
            <div
              key={index}
              onClick={() => handleSceneClick(item.line)}
              className="p-3 mb-1 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded ${
                      item.type === 'scene' 
                        ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                        : item.type === 'character'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                        : 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
                    }`}>
                      {item.type === 'scene' ? '场景' : item.type === 'character' ? '角色' : '过渡'}
                    </span>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    第 {item.line} 行
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
  );

  return (
    <div className="w-full h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* 标题和标签切换 */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          导航面板
        </h2>
        
        {/* 标签切换 */}
        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('outline')}
            className={`flex-1 px-3 py-1.5 text-sm rounded-md transition-colors ${
              activeTab === 'outline'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            提纲
          </button>
          <button
            onClick={() => setActiveTab('structure')}
            className={`flex-1 px-3 py-1.5 text-sm rounded-md transition-colors ${
              activeTab === 'structure'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            结构
          </button>
        </div>
      </div>

      {/* 搜索框 */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <input
          type="text"
          placeholder={activeTab === 'outline' ? '搜索场景...' : '搜索结构...'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'outline' ? renderOutline() : renderStructure()}
      </div>

      {/* 统计信息 */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {activeTab === 'outline' ? (
            <>
              <div>场景数量: {scenes.length}</div>
              <div>总行数: {editor.content.split('\n').length}</div>
            </>
          ) : (
            <>
              <div>场景: {structure.filter(s => s.type === 'scene').length}</div>
              <div>角色: {structure.filter(s => s.type === 'character').length}</div>
              <div>过渡: {structure.filter(s => s.type === 'transition').length}</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NavigationPanel;
