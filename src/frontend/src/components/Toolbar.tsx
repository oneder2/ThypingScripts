import { useAppStore } from '@/stores/useAppStore';
import { useFileOperations } from '@/hooks/useFileOperations';

const Toolbar = () => {
  const { ui, toggleSidebar, setPreviewMode, toggleTheme } = useAppStore();
  const { createNewFile, saveFile, needsSave } = useFileOperations();

  const handleNewFile = async () => {
    try {
      await createNewFile();
    } catch (error) {
      console.error('Failed to create new file:', error);
    }
  };

  const handleSave = async () => {
    try {
      await saveFile();
    } catch (error) {
      console.error('Failed to save file:', error);
    }
  };

  return (
    <div className="h-12 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-4 gap-2">
      {/* 文件操作 */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleNewFile}
          className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
        >
          新建
        </button>
        <button
          onClick={handleSave}
          disabled={!needsSave()}
          className="px-3 py-1.5 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          保存
        </button>
      </div>

      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />

      {/* 视图控制 */}
      <div className="flex items-center gap-2">
        <button
          onClick={toggleSidebar}
          className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          title="切换侧边栏"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPreviewMode('editor')}
            className={`px-2 py-1 text-xs rounded ${
              ui.previewMode === 'editor'
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            编辑
          </button>
          <button
            onClick={() => setPreviewMode('split')}
            className={`px-2 py-1 text-xs rounded ${
              ui.previewMode === 'split'
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            分屏
          </button>
          <button
            onClick={() => setPreviewMode('preview')}
            className={`px-2 py-1 text-xs rounded ${
              ui.previewMode === 'preview'
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            预览
          </button>
        </div>
      </div>

      <div className="flex-1" />

      {/* 主题切换 */}
      <button
        onClick={toggleTheme}
        className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        title="切换主题"
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
  );
};

export default Toolbar;
