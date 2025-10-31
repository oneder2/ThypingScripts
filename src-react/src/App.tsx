import { useEffect, useRef } from 'react';
import { useAppStore } from '@/stores/useAppStore';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useScrollSync } from '@/hooks/useScrollSync';
import { tauriApi } from '@/utils/tauriApi';

// 组件导入
import Toolbar from '@/components/Toolbar';
import NavigationPanel from '@/components/NavigationPanel';
import SimpleEditor from '@/components/SimpleEditor';
import SimpleFountainEditor from '@/components/SimpleFountainEditor';
import DirectEditor from '@/components/DirectEditor';
import RichTextEditor from '@/components/RichTextEditor';
import PreviewPanel from '@/components/PreviewPanel';
import ErrorBoundary from '@/components/ErrorBoundary';

function App() {
  const { ui, setError, setRecoveryFiles } = useAppStore();
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  
  // 启用自动保存
  useAutoSave();
  
  // 启用快捷键
  useKeyboardShortcuts();
  
  // 启用滚动同步（仅在分屏模式下）
  useScrollSync({
    sourceRef: editorRef,
    targetRef: previewRef,
    enabled: ui.editorMode === 'split'
  });

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
      <div className={`h-screen w-full flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors`}>
        {/* 顶部导航栏 */}
        <Toolbar />
        
        {/* 主内容区域 - 3:9分栏布局 */}
        <div className="flex-1 flex overflow-hidden w-full">
          {/* 左侧导航面板 - 3/12 = 25% */}
          {ui.sidebarOpen && (
            <div className="w-1/4 min-w-0 flex-shrink-0">
              <NavigationPanel />
            </div>
          )}
          
          {/* 右侧编辑器区域 - 9/12 = 75% */}
          <div className={`${ui.sidebarOpen ? 'w-3/4' : 'w-full'} flex flex-col min-w-0`}>
            {/* Fountain直接编辑模式 (纯文本) */}
            {ui.editorMode === 'fountain' && (
              <div className="w-full flex flex-col h-full">
                <DirectEditor />
              </div>
            )}

            {/* Fountain富文本编辑模式 (Word/Notion风格) */}
            {ui.editorMode === 'richtext' && (
              <div className="w-full flex flex-col h-full">
                <RichTextEditor />
              </div>
            )}

            {/* 分屏编辑模式 */}
            {ui.editorMode === 'split' && (
              <div className="w-full flex h-full">
                {/* 源码编辑器 */}
                <div className="w-1/2 flex flex-col h-full border-r border-gray-200 dark:border-gray-700">
                  <SimpleEditor ref={editorRef} />
                </div>

                {/* 预览面板 */}
                <div className="w-1/2 flex flex-col h-full">
                  <PreviewPanel ref={previewRef} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;
