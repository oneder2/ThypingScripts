# ThypingScripts

一个基于Tauri 2.0的跨平台桌面编剧工具，专注于简化的写作体验，支持Fountain格式。面向戏剧学习者、业余剧本编写者以及预算有限的剧本编写需求用户。

## 🎯 项目愿景

ThypingScripts旨在解决现有编剧软件过于复杂和昂贵的问题，提供一个开源、轻量级、专注于写作的桌面应用。

## ✨ 核心特性

- **极简界面**：专注于写作，减少视觉干扰
- **Fountain格式支持**：使用行业标准的纯文本标记语言
- **实时预览**：Fountain到HTML实时转换，所见即所得
- **智能导航**：场景导航和大纲视图，快速跳转
- **自动保存**：定时自动保存，防止数据丢失
- **崩溃恢复**：应用崩溃后自动恢复未保存内容
- **跨平台**：支持Windows、macOS、Linux
- **轻量级**：基于Tauri，应用体积小，启动快速
- **开源免费**：MIT许可证，社区驱动

## 🛠️ 技术栈

- **前端**：React 18 + TypeScript + Tailwind CSS + Vite
- **后端**：Rust (Tauri 2.0)
- **状态管理**：Zustand
- **文件格式**：Fountain (.fountain)
- **PDF导出**：wkhtmltopdf + HTML模板
- **临时文件系统**：跨平台临时文件管理
- **主题系统**：亮色/暗色主题切换

## 🚀 快速开始

### 环境要求

- **Node.js 18+** (推荐使用 LTS 版本)
- **Rust 1.70+** (最新稳定版)
- **Tauri 2.0**
- **系统WebView**：
  - Windows: WebView2
  - macOS: WKWebView
  - Linux: WebKit

### 项目结构

```
ThypingScripts/
├── src/
│   ├── frontend/          # React前端应用
│   │   ├── src/
│   │   │   ├── components/    # React组件
│   │   │   ├── hooks/         # 自定义Hooks
│   │   │   ├── stores/        # Zustand状态管理
│   │   │   ├── types/         # TypeScript类型定义
│   │   │   └── utils/         # 工具函数
│   │   └── package.json
│   └── backend/           # Rust后端应用
│       ├── src/
│       │   ├── file/          # 文件管理模块
│       │   ├── fountain/      # Fountain解析模块
│       │   └── pdf/           # PDF生成模块
│       └── Cargo.toml
├── docs/                 # 项目文档
├── .github/workflows/    # CI/CD配置
├── package.json          # 根项目配置
└── tauri.conf.json      # Tauri配置
```

### 安装与运行

#### 1. 克隆项目
```bash
git clone https://github.com/your-username/thypingscripts.git
cd thypingscripts
```

#### 2. 安装依赖
```bash
# 安装根项目依赖
npm install

# 安装前端依赖
npm run install:frontend

# 安装后端依赖
npm run install:backend
```

#### 3. 开发模式运行
```bash
# 启动完整应用（前端 + 后端）
npm run tauri:dev

# 或者分别启动
npm run dev          # 仅启动前端开发服务器
npm run tauri:dev    # 启动Tauri应用
```

#### 4. 构建应用
```bash
# 构建生产版本
npm run tauri:build

# 仅构建前端
npm run build
```

### 开发命令

```bash
# 前端开发
npm run dev                    # 启动前端开发服务器
npm run build                  # 构建前端
npm run preview                # 预览前端构建结果

# 后端开发
npm run install:backend        # 安装Rust依赖
cd src/backend && cargo build  # 构建Rust后端

# 完整应用
npm run tauri:dev              # 开发模式运行
npm run tauri:build            # 构建生产版本
```

## 📖 使用指南

### 界面布局

ThypingScripts采用三栏布局设计：
- **左侧导航面板**：场景导航、大纲视图、搜索功能
- **中央编辑器**：Fountain格式文本编辑器，支持语法高亮
- **右侧预览面板**：实时预览，Fountain到HTML转换

### Fountain格式基础

ThypingScripts使用Fountain格式，这是一种纯文本标记语言：

```fountain
FADE IN:

EXT. 咖啡厅 - 白天

一个忙碌的咖啡厅，顾客来来往往。

JOHN
（坐下）
你好，我要一杯咖啡。

服务员
好的，马上来。

JOHN
谢谢。

服务员离开，JOHN看着窗外。

FADE OUT.
```

### 主要功能

#### 1. 文件操作
- **新建文件**：点击工具栏"新建"按钮
- **保存文件**：`Ctrl+S` 或点击"保存"按钮
- **自动保存**：每30秒自动保存，防止数据丢失
- **崩溃恢复**：应用启动时自动检查并恢复未保存内容

#### 2. 编辑功能
- **实时预览**：编辑时右侧面板实时显示渲染结果
- **场景导航**：左侧面板显示所有场景，点击快速跳转
- **语法高亮**：自动识别Fountain元素类型
- **智能缩进**：自动调整缩进格式

#### 3. 视图模式
- **编辑模式**：仅显示编辑器
- **分屏模式**：编辑器和预览并排显示
- **预览模式**：仅显示预览

#### 4. 主题切换
- **亮色主题**：适合白天使用
- **暗色主题**：适合夜间使用
- **自动保存**：主题设置自动保存

### 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl+S` | 保存文件 |
| `Ctrl+N` | 新建文件 |
| `Ctrl+Z` | 撤销 |
| `Ctrl+Y` | 重做 |
| `Ctrl+F` | 查找 |
| `Ctrl+H` | 替换 |
| `F11` | 全屏模式 |
| `Ctrl+Shift+P` | 切换预览模式 |
| `Ctrl+Shift+N` | 切换导航面板 |

### 数据安全

- **自动保存**：每30秒自动保存到临时文件
- **崩溃恢复**：应用异常退出时自动恢复内容
- **数据清理**：定期清理过期临时文件
- **跨平台兼容**：Windows、macOS、Linux统一体验

## 🤝 贡献指南

我们欢迎所有形式的贡献！

### 开发环境设置

1. Fork项目并克隆到本地
2. 安装依赖：`npm install`
3. 运行开发服务器：`npm run tauri dev`
4. 创建功能分支：`git checkout -b feature/your-feature`

### 提交规范

使用Conventional Commits规范：

- `feat:` 新功能
- `fix:` 错误修复
- `docs:` 文档更新
- `style:` 代码格式调整
- `refactor:` 代码重构
- `test:` 测试相关
- `chore:` 构建过程或辅助工具的变动

## 📝 开发进展

### ✅ 已完成功能

#### 第一阶段：项目初始化与环境搭建
- [x] 项目结构搭建
- [x] Tauri 2.0配置
- [x] React + TypeScript + Tailwind CSS
- [x] CI/CD工作流
- [x] 开发环境配置

#### 第二阶段：数据基础设施实现
- [x] 临时文件系统（跨平台）
- [x] 自动保存服务（30秒间隔）
- [x] 崩溃恢复服务
- [x] 文件编辑系统
- [x] Fountain解析引擎
- [x] Tauri IPC集成

#### 第三阶段：前端界面开发
- [x] React应用架构
- [x] 核心编辑器组件
- [x] 实时预览系统
- [x] 导航面板组件
- [x] 工具栏组件
- [x] 状态管理与数据流
- [x] 样式系统与主题

### 🚧 计划中功能

#### 第四阶段：高级功能与优化
- [ ] 智能编辑功能（自动补全、语法检查）
- [ ] 协作功能（版本控制、变更跟踪）
- [ ] 导入导出功能（PDF导出优化、多格式支持）
- [ ] 性能优化（虚拟滚动、内存管理）
- [ ] 用户体验优化（动画效果、无障碍支持）

#### 第五阶段：扩展功能
- [ ] 插件系统
- [ ] 云同步
- [ ] 多人协作
- [ ] 高级模板
- [ ] 统计分析

## 🔧 故障排除

### 常见问题

#### 1. 应用无法启动
```bash
# 检查Node.js版本
node --version  # 应该是18+

# 检查Rust版本
rustc --version  # 应该是1.70+

# 重新安装依赖
npm run install:frontend
npm run install:backend
```

#### 2. 前端开发服务器问题
```bash
# 清理缓存并重新安装
cd src/frontend
rm -rf node_modules package-lock.json
npm install

# 检查端口占用
lsof -i :1420  # Linux/macOS
netstat -ano | findstr :1420  # Windows
```

#### 3. Rust编译错误
```bash
# 更新Rust工具链
rustup update

# 清理构建缓存
cd src/backend
cargo clean
cargo build
```

#### 4. Tauri配置问题
- 检查 `tauri.conf.json` 配置是否正确
- 确保 `src/frontend/dist` 目录存在
- 验证图标文件路径

### 开发调试

```bash
# 查看详细日志
npm run tauri:dev -- --verbose

# 仅启动前端（用于调试）
npm run dev

# 检查构建输出
npm run build
```

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

- [Fountain.io](http://fountain.io/) - Fountain格式规范
- [Tauri](https://tauri.app/) - 跨平台桌面应用框架
- [React](https://reactjs.org/) - 前端框架
- [Tailwind CSS](https://tailwindcss.com/) - CSS框架
- [Zustand](https://github.com/pmndrs/zustand) - 状态管理
- 所有贡献者和用户

---

**让编剧写作更简单！** 🎬✍️
