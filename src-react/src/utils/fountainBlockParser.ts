/**
 * Fountain块级元素解析器
 * 
 * 用途: 识别和分类Fountain文本中的各种块级元素
 * 支持: 场景标题、角色、对话、动作、括号台词、过渡、居中文本等
 * 
 * 使用示例:
 * const block = parseFountainBlock("INT. HOUSE - DAY");
 * // { type: 'scene', content: "INT. HOUSE - DAY", ... }
 */

export type FountainBlockType = 
  | 'scene'           // 场景标题
  | 'character'       // 角色名
  | 'dialogue'        // 对话
  | 'parenthetical'   // 括号台词
  | 'action'          // 动作描述
  | 'transition'      // 过渡
  | 'centered'        // 居中文本
  | 'lyrics'          // 歌词
  | 'note'            // 注释
  | 'pagebreak'       // 分页符
  | 'empty';          // 空行

export interface FountainBlock {
  id: string;
  type: FountainBlockType;
  content: string;
  rawContent: string;  // 原始内容（包含标记符）
  metadata?: {
    sceneNumber?: string;
    characterExtension?: string;
  };
}

/**
 * 识别Fountain块级元素类型
 * 
 * 规则优先级:
 * 1. 分页符 (===)
 * 2. 注释 ([[...]])
 * 3. 歌词 (~开头)
 * 4. 强制标记 (. @ ! >)
 * 5. 标准元素 (INT/EXT等)
 * 6. 空行
 */
export function parseFountainBlock(
  content: string,
  previousBlockType?: FountainBlockType
): FountainBlock {
  const id = Math.random().toString(36).substr(2, 9);
  const trimmed = content.trim();
  const rawContent = content;

  // 空行
  if (!trimmed) {
    return { id, type: 'empty', content: '', rawContent };
  }

  // 分页符
  if (trimmed === '===' || trimmed.match(/^={3,}$/)) {
    return { id, type: 'pagebreak', content: trimmed, rawContent };
  }

  // 注释 [[...]]
  if (trimmed.startsWith('[[') && trimmed.endsWith(']]')) {
    return { id, type: 'note', content: trimmed, rawContent };
  }

  // 歌词 ~开头
  if (trimmed.startsWith('~')) {
    return { id, type: 'lyrics', content: trimmed.substring(1).trim(), rawContent };
  }

  // 强制场景标题 .开头
  if (trimmed.startsWith('.') && trimmed.length > 1 && /^[.\w]/.test(trimmed)) {
    return { id, type: 'scene', content: trimmed.substring(1).trim(), rawContent };
  }

  // 强制角色 @开头
  if (trimmed.startsWith('@') && trimmed.length > 1) {
    return { id, type: 'character', content: trimmed.substring(1).trim(), rawContent };
  }

  // 强制动作 !开头
  if (trimmed.startsWith('!') && trimmed.length > 1) {
    return { id, type: 'action', content: trimmed.substring(1).trim(), rawContent };
  }

  // 强制过渡/居中 >开头
  if (trimmed.startsWith('>')) {
    if (trimmed.endsWith('<')) {
      // 居中文本 > ... <
      return { id, type: 'centered', content: trimmed.slice(1, -1).trim(), rawContent };
    } else {
      // 过渡
      return { id, type: 'transition', content: trimmed.substring(1).trim(), rawContent };
    }
  }

  // 标准场景标题 INT/EXT/EST等
  const sceneMatch = trimmed.match(/^(INT|EXT|EST|INT\.\/EXT|INT\/EXT|I\/E)[\.\s]/i);
  if (sceneMatch) {
    // 提取场景号 #1# 或 #1A#
    const sceneNumberMatch = trimmed.match(/#([^#]+)#/);
    return {
      id,
      type: 'scene',
      content: trimmed,
      rawContent,
      metadata: { sceneNumber: sceneNumberMatch?.[1] }
    };
  }

  // 括号台词 (...)
  if (trimmed.startsWith('(') && trimmed.endsWith(')')) {
    return { id, type: 'parenthetical', content: trimmed, rawContent };
  }

  // 过渡 全大写 + TO:
  if (trimmed.match(/^[A-Z\s]+TO:$/) || trimmed.match(/^(CUT|FADE|DISSOLVE|SMASH)\s+(TO|CUT)/i)) {
    return { id, type: 'transition', content: trimmed, rawContent };
  }

  // 角色名 全大写，长度合理，不是过渡
  if (
    trimmed === trimmed.toUpperCase() &&
    trimmed.length > 0 &&
    trimmed.length < 50 &&
    !trimmed.match(/^(FADE|CUT|DISSOLVE|TO:|SMASH)/i) &&
    trimmed.match(/^[A-Z\s\(\)]+$/) &&
    previousBlockType !== 'character'  // 避免连续的角色名
  ) {
    // 提取角色扩展 (V.O.) (O.S.) 等
    const extensionMatch = trimmed.match(/\(([^)]+)\)$/);
    return {
      id,
      type: 'character',
      content: trimmed,
      rawContent,
      metadata: { characterExtension: extensionMatch?.[1] }
    };
  }

  // 对话 (前一个块是角色名)
  if (previousBlockType === 'character') {
    return { id, type: 'dialogue', content: trimmed, rawContent };
  }

  // 默认为动作
  return { id, type: 'action', content: trimmed, rawContent };
}

/**
 * 将文本分解为Fountain块
 */
export function parseTextToBlocks(text: string): FountainBlock[] {
  const lines = text.split('\n');
  const blocks: FountainBlock[] = [];
  let previousBlockType: FountainBlockType | undefined;

  for (const line of lines) {
    const block = parseFountainBlock(line, previousBlockType);
    blocks.push(block);
    
    // 更新前一个块类型（用于对话识别）
    if (block.type !== 'empty') {
      previousBlockType = block.type;
    }
  }

  return blocks;
}

/**
 * 获取块级元素的CSS类名
 */
export function getBlockClassName(type: FountainBlockType): string {
  const baseClass = 'fountain-block';
  const typeClass = `fountain-${type}`;
  return `${baseClass} ${typeClass}`;
}

/**
 * 获取块级元素的样式对象
 */
export function getBlockStyle(type: FountainBlockType): React.CSSProperties {
  const baseStyle: React.CSSProperties = {
    margin: '0',
    padding: '0.5em 0',
    minHeight: '1.8em',
    lineHeight: '1.8',
  };

  const typeStyles: Record<FountainBlockType, React.CSSProperties> = {
    scene: {
      ...baseStyle,
      fontWeight: 'bold',
      textTransform: 'uppercase',
      marginTop: '1.5em',
      marginBottom: '0.5em',
      letterSpacing: '0.05em',
    },
    character: {
      ...baseStyle,
      textAlign: 'center',
      fontWeight: 'bold',
      marginTop: '1em',
      marginBottom: '0.25em',
    },
    dialogue: {
      ...baseStyle,
      textAlign: 'left',
      paddingLeft: '3em',
      paddingRight: '3em',
    },
    parenthetical: {
      ...baseStyle,
      textAlign: 'center',
      paddingLeft: '4em',
      paddingRight: '4em',
      fontStyle: 'italic',
    },
    action: {
      ...baseStyle,
      textAlign: 'left',
    },
    transition: {
      ...baseStyle,
      textAlign: 'right',
      fontWeight: 'bold',
      marginTop: '1em',
      marginBottom: '1em',
    },
    centered: {
      ...baseStyle,
      textAlign: 'center',
      marginTop: '1em',
      marginBottom: '1em',
    },
    lyrics: {
      ...baseStyle,
      textAlign: 'left',
      fontStyle: 'italic',
    },
    note: {
      ...baseStyle,
      color: '#999',
      fontSize: '0.9em',
    },
    pagebreak: {
      ...baseStyle,
      textAlign: 'center',
      margin: '2em 0',
      borderTop: '1px solid #ccc',
    },
    empty: {
      ...baseStyle,
      height: '0.5em',
    },
  };

  return typeStyles[type] || baseStyle;
}

/**
 * 检测行内格式 (B/I/U/S)
 */
export function parseInlineFormats(text: string): Array<{
  type: 'bold' | 'italic' | 'underline' | 'strikethrough';
  start: number;
  end: number;
  content: string;
}> {
  const formats: Array<any> = [];

  // 粗体 **text**
  const boldRegex = /\*\*(.+?)\*\*/g;
  let match;
  while ((match = boldRegex.exec(text)) !== null) {
    formats.push({
      type: 'bold',
      start: match.index,
      end: match.index + match[0].length,
      content: match[1],
    });
  }

  // 斜体 *text*
  const italicRegex = /\*(.+?)\*/g;
  while ((match = italicRegex.exec(text)) !== null) {
    // 跳过粗体
    if (!text.substring(match.index - 1, match.index + match[0].length + 1).includes('**')) {
      formats.push({
        type: 'italic',
        start: match.index,
        end: match.index + match[0].length,
        content: match[1],
      });
    }
  }

  // 下划线 _text_
  const underlineRegex = /_(.+?)_/g;
  while ((match = underlineRegex.exec(text)) !== null) {
    formats.push({
      type: 'underline',
      start: match.index,
      end: match.index + match[0].length,
      content: match[1],
    });
  }

  // 删除线 ~~text~~
  const strikeRegex = /~~(.+?)~~/g;
  while ((match = strikeRegex.exec(text)) !== null) {
    formats.push({
      type: 'strikethrough',
      start: match.index,
      end: match.index + match[0].length,
      content: match[1],
    });
  }

  return formats;
}

