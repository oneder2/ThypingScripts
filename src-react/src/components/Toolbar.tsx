import { useState } from 'react';
import { useAppStore } from '@/stores/useAppStore';
import { useFileOperations } from '@/hooks/useFileOperations';
import FindReplace from './FindReplace';

const Toolbar = () => {
  const { ui, toggleSidebar, setEditorMode, toggleTheme, undo, redo, canUndo, canRedo, saveToHistory, editor } = useAppStore();
  const { createNewFile, saveFile, needsSave } = useFileOperations();
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [showViewMenu, setShowViewMenu] = useState(false);
  const [showEditMenu, setShowEditMenu] = useState(false);

  const handleNewFile = async () => {
    try {
      await createNewFile();
      setShowFileMenu(false);
    } catch (error) {
      console.error('Failed to create new file:', error);
    }
  };

  const handleSave = async () => {
    try {
      await saveFile();
      setShowFileMenu(false);
    } catch (error) {
      console.error('Failed to save file:', error);
    }
  };

  return (
    <div className="relative">
      <FindReplace isOpen={showFindReplace} onClose={() => setShowFindReplace(false)} />
      <div className="h-12 w-full bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-4 gap-2">
        {/* 文件菜单 */}
        <div className="relative">
          <button
            onClick={() => setShowFileMenu(!showFileMenu)}
            className="px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            title="文件操作 (Ctrl+N 新建, Ctrl+S 保存)"
          >
            文件
          </button>
          {showFileMenu && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
              <button
                onClick={handleNewFile}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                新建文件
              </button>
              <button
                onClick={handleSave}
                disabled={!needsSave()}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                保存
              </button>
              <div className="border-t border-gray-200 dark:border-gray-700"></div>
              <button className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                打开文件
              </button>
              <button className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                另存为
              </button>
            </div>
          )}
        </div>

        {/* 编辑模式菜单 */}
        <div className="relative">
          <button
            onClick={() => setShowViewMenu(!showViewMenu)}
            className="px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            title="编辑模式 (Ctrl+1 Fountain, Ctrl+2 分屏)"
          >
            编辑模式
          </button>
          {showViewMenu && (
            <div className="absolute top-full left-0 mt-1 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                编辑模式
              </div>
              <button
                onClick={() => { setEditorMode('fountain'); setShowViewMenu(false); }}
                className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                  ui.editorMode === 'fountain'
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Fountain 直接编辑
                  <span className="ml-auto text-xs text-gray-400">Ctrl+1</span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 ml-6">
                  类似 Word/Notion 的编辑体验
                </div>
              </button>
              <button
                onClick={() => { setEditorMode('split'); setShowViewMenu(false); }}
                className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                  ui.editorMode === 'split'
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                  </svg>
                  分屏编辑
                  <span className="ml-auto text-xs text-gray-400">Ctrl+2</span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 ml-6">
                  源码与预览左右对照
                </div>
              </button>
              <div className="border-t border-gray-200 dark:border-gray-700"></div>
              <button
                onClick={() => { toggleSidebar(); setShowViewMenu(false); }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span>{ui.sidebarOpen ? '隐藏侧边栏' : '显示侧边栏'}</span>
                  <span className="text-xs text-gray-400">Ctrl+B</span>
                </div>
              </button>
            </div>
          )}
        </div>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />

        {/* 编辑工具 */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFindReplace(!showFindReplace)}
            className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            title="查找和替换"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          
          <button
            onClick={() => setShowEditMenu(!showEditMenu)}
            className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            title="编辑工具"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        </div>

        {/* 编辑工具菜单 */}
        {showEditMenu && (
          <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
            <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              编辑工具
            </div>
            <button
              onClick={() => {
                saveToHistory(editor.content);
                undo();
                setShowEditMenu(false);
              }}
              disabled={!canUndo}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              撤销 (Ctrl+Z)
            </button>
            <button
              onClick={() => {
                saveToHistory(editor.content);
                redo();
                setShowEditMenu(false);
              }}
              disabled={!canRedo}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              重做 (Ctrl+Y)
            </button>
            <div className="border-t border-gray-200 dark:border-gray-700"></div>
            <button className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              全选 (Ctrl+A)
            </button>
            <button className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              复制 (Ctrl+C)
            </button>
            <button className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              粘贴 (Ctrl+V)
            </button>
            <div className="border-t border-gray-200 dark:border-gray-700"></div>
            <button className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              格式化文档
            </button>
            <button className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              统计信息
            </button>
          </div>
        )}

        <div className="flex-1" />

        {/* 主题切换 */}
        <button
          onClick={toggleTheme}
          className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          title="切换主题 (Ctrl+D)"
        >
          {ui.theme === 'light' ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          )}
        </button>
      </div>
      
      {/* 点击外部关闭菜单 */}
      {(showFileMenu || showViewMenu || showEditMenu) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setShowFileMenu(false);
            setShowViewMenu(false);
            setShowEditMenu(false);
          }}
        />
      )}
    </div>
  );
};

export default Toolbar;
