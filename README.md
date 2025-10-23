# ThypingScripts

一个基于Tauri 2.0的跨平台桌面编剧工具，专注于简化的写作体验，支持Fountain格式。面向戏剧学习者、业余剧本编写者以及预算有限的剧本编写需求用户。

## 🎯 项目愿景

ThypingScripts旨在解决现有编剧软件过于复杂和昂贵的问题，提供一个开源、轻量级、专注于写作的桌面应用。

## ✨ 核心特性

- **极简界面**：专注于写作，减少视觉干扰
- **Fountain格式支持**：使用行业标准的纯文本标记语言
- **跨平台**：支持Windows、macOS、Linux
- **轻量级**：基于Tauri，应用体积小，启动快速
- **开源免费**：MIT许可证，社区驱动

## 🛠️ 技术栈

- **前端**：React + TypeScript + Tailwind CSS
- **后端**：Rust (Tauri 2.0)
- **状态管理**：Zustand
- **文件格式**：Fountain (.fountain)
- **PDF导出**：wkhtmltopdf + HTML模板
- **临时文件系统**：跨平台临时文件管理

## 🚀 快速开始

### 环境要求

- Node.js 18+
- Rust 1.70+
- Tauri 2.0
- 系统WebView（Windows WebView2, macOS WKWebView, Linux WebKit）

### 安装与运行

```bash
# 克隆项目
git clone https://github.com/your-username/thypingscripts.git
cd thypingscripts

# 安装依赖
npm install

# 开发模式运行
npm run tauri dev

# 构建应用
npm run tauri build
```

## 📖 使用指南

### Fountain格式基础

ScriptWriter使用Fountain格式，这是一种纯文本标记语言：

```fountain
INT. COFFEE SHOP - DAY

小明不安地看着门外。

LI HUA
今天我们能完成这个剧本吗？

XIAO MING
(轻声地)
应该可以，我们还有时间。
```

### 快捷键

- `Ctrl+S`：保存文件
- `Ctrl+N`：新建文件
- `Ctrl+O`：打开文件
- `Ctrl+E`：导出PDF
- `Tab`：切换元素类型（场景标题→动作→角色名→对话）

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

## 📝 开发计划

- [ ] 基础编辑器功能
- [ ] Fountain格式解析
- [ ] 实时预览
- [ ] PDF导出
- [ ] 主题支持
- [ ] 插件系统

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

- [Fountain.io](http://fountain.io/) - Fountain格式规范
- [Tauri](https://tauri.app/) - 跨平台桌面应用框架
- 所有贡献者和用户

---

**让编剧写作更简单！** 🎬✍️
