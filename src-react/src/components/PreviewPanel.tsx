import { useMemo, forwardRef } from 'react';
import { useAppStore } from '@/stores/useAppStore';
import '@/styles/fountain.css';

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

const PreviewPanel = forwardRef<HTMLDivElement>((_props, ref) => {
  const { editor } = useAppStore();

  // Fountain到HTML转换 - 根据官方规范改进
  const convertFountainToHTML = (content: string) => {
    const lines = content.split('\n');
    let html = '<div class="script-preview">';
    let inDialogue = false;
    let currentCharacter = '';

    lines.forEach((line) => {
      const trimmedLine = line.trim();

      // 空行
      if (!trimmedLine) {
        html += '<div class="spacing"></div>';
        return;
      }

      // 标题页信息
      if (trimmedLine.includes(':') && !inDialogue) {
        const [key, value] = trimmedLine.split(':', 2);
        if (['Title', 'Credit', 'Author', 'Draft date', 'Contact'].includes(key.trim())) {
          html += `<div class="title-page"><strong>${key.trim()}:</strong> ${value.trim()}</div>`;
          return;
        }
      }

      // 强制元素标记
      if (trimmedLine.startsWith('.')) {
        // 强制场景标题
        html += `<div class="scene-heading">${trimmedLine.substring(1)}</div>`;
        inDialogue = false;
      }
      else if (trimmedLine.startsWith('@')) {
        // 强制动作
        html += `<div class="action">${trimmedLine.substring(1)}</div>`;
        inDialogue = false;
      }
      else if (trimmedLine.startsWith('#')) {
        // 强制角色名
        currentCharacter = trimmedLine.substring(1);
        html += `<div class="character">${currentCharacter}</div>`;
        inDialogue = true;
      }
      // 场景标题 (Scene Heading) - 改进识别规则
      else if (trimmedLine.match(/^(INT\.|EXT\.|I\.|E\.|INT|EXT)\s+[A-Z\s]+/i)) {
        html += `<div class="scene-heading">${trimmedLine.toUpperCase()}</div>`;
        inDialogue = false;
      }
      // 角色名 (Character) - 改进识别规则
      else if (trimmedLine.match(/^[A-Z][A-Z\s\.]+$/) && 
               !trimmedLine.match(/^(INT\.|EXT\.|I\.|E\.|INT|EXT)/i) &&
               !trimmedLine.endsWith(':') &&
               trimmedLine.length > 1) {
        currentCharacter = trimmedLine;
        html += `<div class="character">${trimmedLine}</div>`;
        inDialogue = true;
      }
      // 对话 (Dialogue) - 改进识别规则
      else if (inDialogue && currentCharacter && !trimmedLine.startsWith('(') && !trimmedLine.startsWith('[')) {
        html += `<div class="dialogue">${formatFountainText(trimmedLine)}</div>`;
      }
      // 括号台词 (Parenthetical) - 改进识别规则
      else if (trimmedLine.startsWith('(') && trimmedLine.endsWith(')')) {
        html += `<div class="parenthetical">${trimmedLine}</div>`;
      }
      // 过渡 (Transition) - 改进识别规则
      else if (trimmedLine.startsWith('>') || 
               trimmedLine.match(/^(FADE IN|FADE OUT|CUT TO|DISSOLVE TO|SMASH CUT|MATCH CUT|JUMP CUT|FADE TO BLACK|FADE TO WHITE):?$/i)) {
        html += `<div class="transition">${trimmedLine}</div>`;
        inDialogue = false;
      }
      // 注释 (Notes) - 导出时忽略
      else if (trimmedLine.startsWith('[[') && trimmedLine.endsWith(']]')) {
        // 注释在预览中不显示
        return;
      }
      // 动作/描述 (Action) - 默认情况
      else if (trimmedLine) {
        html += `<div class="action">${formatFountainText(trimmedLine)}</div>`;
        inDialogue = false;
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
      <div ref={ref} className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
        {editor.content ? (
          <div
            className="script-preview w-full"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
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
});

PreviewPanel.displayName = 'PreviewPanel';

export default PreviewPanel;
