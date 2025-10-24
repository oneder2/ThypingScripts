import { useEffect } from 'react';
import { useAppStore } from '@/stores/useAppStore';
import { useAutoSave } from '@/hooks/useAutoSave';
import { tauriApi } from '@/utils/tauriApi';

// 组件导入
import Toolbar from '@/components/Toolbar';
import NavigationPanel from '@/components/NavigationPanel';
import ScriptEditor from '@/components/ScriptEditor';
import PreviewPanel from '@/components/PreviewPanel';
import ErrorBoundary from '@/components/ErrorBoundary';

function App() {
  const { ui, setError, setRecoveryFiles } = useAppStore();
  
  // 启用自动保存
  useAutoSave();

  // 应用启动时检查崩溃恢复
  useEffect(() => {
    const checkRecovery = async () => {
      try {
        const recoveryFiles = await tauriApi.checkCrashRecovery();
        if (recoveryFiles.length > 0) {
          setRecoveryFiles(recoveryFiles);
          // 这里可以显示恢复对话框
          console.log('Found recovery files:', recoveryFiles);
        }
      } catch (error) {
        console.error('Failed to check recovery files:', error);
        setError(error as any);
      }
    };

    checkRecovery();
  }, [setError, setRecoveryFiles]);

  // 应用主题
  useEffect(() => {
    document.documentElement.classList.toggle('dark', ui.theme === 'dark');
  }, [ui.theme]);

  return (
    <ErrorBoundary>
      <div className={`h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors`}>
        {/* 工具栏 */}
        <Toolbar />
        
        {/* 主内容区域 */}
        <div className="flex-1 flex overflow-hidden">
          {/* 导航面板 */}
          {ui.sidebarOpen && (
            <NavigationPanel />
          )}
          
          {/* 编辑器区域 */}
          <div className="flex-1 flex">
            {/* 编辑器 */}
            {(ui.previewMode === 'split' || ui.previewMode === 'editor') && (
              <div className={`${ui.previewMode === 'split' ? 'w-1/2' : 'w-full'} flex flex-col`}>
                <ScriptEditor />
              </div>
            )}
            
            {/* 预览面板 */}
            {(ui.previewMode === 'split' || ui.previewMode === 'preview') && (
              <div className={`${ui.previewMode === 'split' ? 'w-1/2' : 'w-full'} flex flex-col border-l border-gray-200 dark:border-gray-700`}>
                <PreviewPanel />
              </div>
            )}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;
