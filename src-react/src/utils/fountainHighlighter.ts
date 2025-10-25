// Fountain语法高亮工具
export interface HighlightedLine {
  text: string;
  type: 'scene' | 'character' | 'dialogue' | 'action' | 'transition' | 'parenthetical' | 'normal';
  className: string;
}

export class FountainHighlighter {
  // 场景标题正则
  private static sceneRegex = /^[A-Z][A-Z\s]+$/;
  
  // 角色名正则
  private static characterRegex = /^[A-Z][A-Z\s]+:$/;
  
  // 过渡正则
  private static transitionRegex = /^(FADE IN|FADE OUT|CUT TO|DISSOLVE TO|SMASH CUT|MATCH CUT|JUMP CUT|FADE TO BLACK|FADE TO WHITE)/i;
  
  // 括号内容正则
  private static parentheticalRegex = /^\([^)]+\)$/;

  static highlightLine(line: string): HighlightedLine {
    const trimmedLine = line.trim();
    
    // 空行
    if (!trimmedLine) {
      return {
        text: line,
        type: 'normal',
        className: 'fountain-normal'
      };
    }

    // 场景标题
    if (this.sceneRegex.test(trimmedLine) && !trimmedLine.includes(':')) {
      return {
        text: line,
        type: 'scene',
        className: 'fountain-scene'
      };
    }

    // 角色名
    if (this.characterRegex.test(trimmedLine)) {
      return {
        text: line,
        type: 'character',
        className: 'fountain-character'
      };
    }

    // 过渡
    if (this.transitionRegex.test(trimmedLine)) {
      return {
        text: line,
        type: 'transition',
        className: 'fountain-transition'
      };
    }

    // 括号内容（旁白）
    if (this.parentheticalRegex.test(trimmedLine)) {
      return {
        text: line,
        type: 'parenthetical',
        className: 'fountain-parenthetical'
      };
    }

    // 对话（在角色名之后）
    if (trimmedLine && !trimmedLine.startsWith('(') && !trimmedLine.startsWith('[')) {
      return {
        text: line,
        type: 'dialogue',
        className: 'fountain-dialogue'
      };
    }

    // 动作描述
    return {
      text: line,
      type: 'action',
      className: 'fountain-action'
    };
  }

  static highlightContent(content: string): HighlightedLine[] {
    return content.split('\n').map(line => this.highlightLine(line));
  }
}

