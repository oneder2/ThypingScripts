# 富文本编辑器设计文档

**设计日期**: 2025-10-31  
**目标**: 实现Word/Notion风格的Fountain富文本编辑器  
**兼容性**: 临时文件系统 + Fountain格式

---

## 📋 Fountain语法总结

### 核心元素

| 元素 | 标记 | 示例 | 说明 |
|------|------|------|------|
| **场景标题** | INT/EXT/EST | `INT. HOUSE - DAY` | 场景开始标记 |
| **强制场景** | `.` 前缀 | `.SNIPER SCOPE POV` | 强制为场景标题 |
| **角色名** | 全大写 | `JOHN` | 对话前的角色 |
| **强制角色** | `@` 前缀 | `@JOHN` | 强制为角色名 |
| **对话** | 角色后 | `Hello world` | 角色说的话 |
| **括号台词** | `(括号)` | `(pause)` | 角色动作/语气 |
| **动作** | 普通文本 | `He walks away.` | 场景描述 |
| **强制动作** | `!` 前缀 | `!He walks away.` | 强制为动作 |
| **过渡** | 全大写+TO: | `CUT TO:` | 场景过渡 |
| **强制过渡** | `>` 前缀 | `> FADE TO BLACK <` | 强制为过渡 |
| **居中文本** | `>` 和 `<` | `> THE END <` | 居中显示 |
| **强调** | `*` `**` `_` | `*italic* **bold** _underline_` | 文本强调 |
| **歌词** | `~` 前缀 | `~La la la` | 歌词行 |
| **注释** | `[[` `]]` | `[[This is a note]]` | 编辑注释 |
| **分页符** | `===` | `===` | 强制分页 |

### 格式化规则

1. **空行处理**: 元素间需要空行分隔
2. **大小写**: 场景标题、角色名、过渡通常大写
3. **缩进**: 对话和括号台词有特定缩进
4. **强调组合**: 可组合使用 `***bold italic***`

---

## 🎨 编辑器设计架构

### 核心理念

```
用户输入 → 实时解析 → 块级元素识别 → 样式应用 → 渲染显示
   ↓
保存到临时文件 (Fountain格式)
```

### 编辑器层次结构

```
RichTextEditor (主容器)
├── EditorToolbar (工具栏)
│   ├── 格式按钮 (B/I/U)
│   ├── 元素类型选择
│   └── 快捷键提示
├── EditorContent (编辑区域)
│   ├── BlockRenderer (块级渲染)
│   │   ├── SceneHeadingBlock
│   │   ├── CharacterBlock
│   │   ├── DialogueBlock
│   │   ├── ActionBlock
│   │   ├── ParentheticalBlock
│   │   ├── TransitionBlock
│   │   └── CenteredBlock
│   └── InlineFormatter (行内格式)
│       ├── BoldFormatter
│       ├── ItalicFormatter
│       ├── UnderlineFormatter
│       └── StrikethroughFormatter
└── EditorStatus (状态栏)
    ├── 字数统计
    ├── 场景数
    └── 角色数
```

---

## 💾 数据流与存储

### 编辑器内部表示

```typescript
interface FountainBlock {
  id: string;
  type: 'scene' | 'character' | 'dialogue' | 'action' | 'parenthetical' | 'transition' | 'centered';
  content: string;
  metadata?: {
    sceneNumber?: string;
    characterExtension?: string;
  };
}

interface EditorState {
  blocks: FountainBlock[];
  cursorPosition: { blockId: string; offset: number };
  selectedRange?: { start: number; end: number };
}
```

### 保存到临时文件

```
编辑器状态 → 转换为Fountain文本 → 保存到临时文件
  ↓
自动保存 (30秒间隔)
  ↓
临时文件系统管理
```

---

## 🎯 关键功能

### 1. 实时块级识别

- 根据行首字符自动识别元素类型
- 支持强制标记 (`.` `@` `!` `>`)
- 自动处理空行分隔

### 2. 样式应用

- 场景标题: 粗体 + 大写 + 上边距
- 角色名: 居中 + 粗体
- 对话: 左对齐 + 缩进
- 括号台词: 居中 + 斜体
- 动作: 左对齐 + 正常
- 过渡: 右对齐 + 粗体
- 居中: 居中显示

### 3. 快捷键支持

| 快捷键 | 功能 |
|--------|------|
| `Ctrl+B` | 加粗 |
| `Ctrl+I` | 斜体 |
| `Ctrl+U` | 下划线 |
| `Ctrl+S` | 保存 |
| `Tab` | 增加缩进 |
| `Shift+Tab` | 减少缩进 |

### 4. 自动格式化

- 自动识别场景标题
- 自动大写角色名
- 自动处理对话缩进
- 自动添加空行

---

## 🔄 与临时文件系统集成

### 保存流程

```
编辑器修改 → 触发onChange
  ↓
转换为Fountain文本
  ↓
更新Zustand store
  ↓
自动保存到临时文件 (30秒)
  ↓
更新元数据 (字数、场景数、角色数)
```

### 加载流程

```
打开文件 → 读取临时文件
  ↓
解析Fountain格式
  ↓
转换为编辑器块
  ↓
渲染到编辑器
  ↓
启动自动保存
```

---

## 🎨 样式设计

### 浅色主题

```css
.scene-heading { color: #1f2937; font-weight: bold; margin-top: 1.5em; }
.character { color: #7c2d12; text-align: center; font-weight: bold; }
.dialogue { color: #374151; padding-left: 3em; }
.parenthetical { color: #6b7280; text-align: center; font-style: italic; }
.action { color: #4b5563; }
.transition { color: #ef4444; text-align: right; font-weight: bold; }
.centered { text-align: center; }
```

### 深色主题

```css
.scene-heading { color: #f3f4f6; font-weight: bold; margin-top: 1.5em; }
.character { color: #fca5a5; text-align: center; font-weight: bold; }
.dialogue { color: #d1d5db; padding-left: 3em; }
.parenthetical { color: #9ca3af; text-align: center; font-style: italic; }
.action { color: #9ca3af; }
.transition { color: #f87171; text-align: right; font-weight: bold; }
.centered { text-align: center; }
```

---

## 📊 实现优先级

### Phase 1 (基础)
- [ ] 块级元素识别
- [ ] 基础样式应用
- [ ] 纯文本编辑

### Phase 2 (增强)
- [ ] 行内格式 (B/I/U)
- [ ] 快捷键支持
- [ ] 自动格式化

### Phase 3 (优化)
- [ ] 性能优化
- [ ] 高级功能
- [ ] 用户体验改进

---

## ✅ 验收标准

1. ✅ 支持所有Fountain元素类型
2. ✅ 实时渲染和样式应用
3. ✅ 流畅的编辑体验 (无卡顿)
4. ✅ 正确保存到临时文件
5. ✅ 支持中文输入法
6. ✅ 性能: 大文件 (<10MB) 无明显延迟
7. ✅ 兼容现有的自动保存和崩溃恢复

---

## 🚀 下一步

1. 实现RichTextEditor核心组件
2. 添加块级元素识别和渲染
3. 实现行内格式化
4. 集成到应用
5. 进行集成测试

