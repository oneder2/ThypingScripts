import { useMemo } from 'react';
import { useAppStore } from '@/stores/useAppStore';

const PreviewPanel = () => {
  const { editor, ui } = useAppStore();

  // Fountain到HTML转换
  const convertFountainToHTML = (content: string) => {
    const lines = content.split('\n');
    let html = '<div class="script-preview">';
    let inDialogue = false;
    let currentCharacter = '';

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // 场景标题
      if (trimmedLine.match(/^[A-Z][A-Z\s]+$/) && !trimmedLine.includes(':')) {
        html += `<div class="scene-heading">${trimmedLine}</div>`;
        inDialogue = false;
      }
      // 角色名
      else if (trimmedLine.match(/^[A-Z][A-Z\s]+$/) && trimmedLine.includes(':')) {
        currentCharacter = trimmedLine.replace(':', '');
        html += `<div class="character">${currentCharacter}</div>`;
        inDialogue = true;
      }
      // 对话
      else if (inDialogue && trimmedLine && !trimmedLine.startsWith('(')) {
        html += `<div class="dialogue">${trimmedLine}</div>`;
      }
      // 动作描述
      else if (trimmedLine && !trimmedLine.startsWith('(') && !inDialogue) {
        html += `<div class="action">${trimmedLine}</div>`;
        inDialogue = false;
      }
      // 括号内容（旁白）
      else if (trimmedLine.startsWith('(') && trimmedLine.endsWith(')')) {
        html += `<div class="parenthetical">${trimmedLine}</div>`;
      }
      // 过渡
      else if (trimmedLine.match(/^(FADE IN|FADE OUT|CUT TO|DISSOLVE TO)/i)) {
        html += `<div class="transition">${trimmedLine}</div>`;
      }
      // 空行
      else if (!trimmedLine) {
        html += '<div class="spacing"></div>';
      }
    });

    html += '</div>';
    return html;
  };

  const htmlContent = useMemo(() => {
    return convertFountainToHTML(editor.content);
  }, [editor.content]);

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
      {/* 预览标题栏 */}
      <div className="h-8 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-4">
        <span className="text-sm text-gray-600 dark:text-gray-400">预览</span>
        <div className="flex-1" />
        <span className="text-xs text-gray-500 dark:text-gray-500">
          实时预览
        </span>
      </div>

      {/* 预览内容 */}
      <div className="flex-1 overflow-y-auto p-6">
        {editor.content ? (
          <div
            className="script-preview max-w-4xl mx-auto"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
            style={{
              fontFamily: 'Georgia, serif',
              lineHeight: '1.6',
              color: ui.theme === 'dark' ? '#e5e7eb' : '#374151',
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>开始编写剧本以查看预览</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreviewPanel;
