---
type: "always_apply"
---

# Changelog

所有重要的项目变更都会记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
项目遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [未发布]

### 新增 ✨
- **真正的富文本编辑器** - 实现Word/Notion风格的Fountain编辑器 ⭐⭐⭐
  - 使用overlay技术实现所见即所得的编辑体验
  - 透明的contentEditable层覆盖在格式化预览层上
  - 用户输入时实时看到格式化的内容（颜色、大小、缩进等）
  - 光标颜色可见，文本透明，完全保持光标稳定性
  - 支持11种Fountain元素类型的实时识别和格式化
  - 浅色/暗色主题支持
  - 与Zustand Store无缝集成
  - 自动保存支持
  - 代码行数: 243行 (RichTextEditor) + 300行 (fountainBlockParser)

- **编辑工具栏** - 提供Word风格的编辑工具
  - 撤销/重做按钮
  - 实时字数和行数统计
  - 按钮状态根据历史记录动态更新
  - 响应式设计，适配浅色/暗色主题

- **撤销/重做功能** - 完整的编辑历史管理
  - Ctrl+Z撤销上一步操作
  - Ctrl+Y或Ctrl+Shift+Z重做操作
  - 历史记录限制为50条，防止内存溢出
  - 新输入后自动清空重做历史
  - 撤销/重做时保持光标位置合理

- **块级解析工具** - fountainBlockParser工具库
  - `parseFountainBlock()` - 识别单个块的类型
  - `parseTextToBlocks()` - 将文本分解为块
  - `getBlockClassName()` - 获取块的CSS类名
  - `getBlockStyle()` - 获取块的样式对象
  - `parseInlineFormats()` - 识别行内格式

- **Fountain解析模块** - 实现完整的Rust后端Fountain解析器
  - 支持场景标题、角色、对话、动作等所有Fountain元素
  - 支持强制元素标记 (`.` 场景, `@` 动作, `#` 角色)
  - 支持过渡、括号台词、注释、分页符等特殊元素
  - 提供文档元数据统计 (字数、场景数、角色统计)

- **Tauri命令** - 添加Fountain解析相关命令
  - `parse_fountain` - 解析Fountain内容为结构化文档
  - `validate_fountain` - 验证Fountain格式并返回警告信息

### 修复 🐛
- **直接编辑模式完全重写** - 彻底解决编辑体验问题 ⭐
  - ✅ 完全消除光标跳转问题
  - ✅ 使用纯文本编辑模式 (`contentEditable="plaintext-only"`)
  - ✅ 移除所有HTML操作，避免DOM干扰
  - ✅ 提供类似Word/Notion的流畅编辑体验
  - ✅ 无分块感，统一的编辑区域
  - ✅ 完美支持中文输入法
  - ✅ 代码从~400行简化到~100行

- **前后端不匹配** - 修复前端调用后端命令失败的问题
  - 前端定义了 `parse_fountain` 和 `validate_fountain` 但后端未实现
  - 补充完整的Fountain模块实现
  - 在main.rs中注册缺失的命令

### 改进 🔧
- **代码注释** - 为所有新增代码添加详细注释
  - 文件头部注释说明模块用途
  - 函数/方法注释说明功能和参数
  - 复杂逻辑添加行内注释

- **错误处理** - 改进Fountain解析的错误处理
  - 提供详细的验证警告信息
  - 优雅处理空内容和无效格式

- **性能优化** - 优化直接编辑模式性能
  - 减少不必要的重新渲染
  - 使用元素引用映射避免重复查询DOM
  - 添加中文输入法状态管理避免重复更新

### 文档 📝
- 添加 `FEATURE_CHECK_REPORT.md` - 详细的功能检查报告
- 添加 `FEATURE_FIX_PLAN.md` - 修复计划和实现指南
- 添加 `FEATURE_CHECK_SUMMARY.md` - 快速参考总结
- 添加 `RICH_TEXT_EDITOR_DESIGN.md` - 富文本编辑器设计文档
- 添加 `RICH_TEXT_EDITOR_IMPLEMENTATION_REPORT.md` - 实现报告
- 添加 `RICH_TEXT_EDITOR_TEST_PLAN.md` - 测试计划
- 更新 `CHANGELOG.md` - 记录所有重要更改

### 技术债务 ⚠️
- PDF导出功能仍未实现 (计划在下个版本)
- 部分工具栏菜单项未完全实现 (Open File, Save As)
- 缺少单元测试覆盖

## [0.1.0] - 2024-12-19

### 新增
- 项目文档框架
- 架构设计文档
- 开发规范文档
- 需求文档模板
- 运维文档模板

### 变更
- 确定技术栈：Tauri + Rust + React + TypeScript
- 选择Fountain作为核心文件格式
- 制定代码规范和开发流程

### 修复
- 文档模板占位符问题
- 技术栈描述不一致问题

---

## 版本说明

- **主版本号**：不兼容的API修改
- **次版本号**：向下兼容的功能性新增
- **修订号**：向下兼容的问题修正

## 链接

- [Unreleased]: https://github.com/your-username/scriptwriter/compare/v0.1.0...HEAD
- [0.1.0]: https://github.com/your-username/scriptwriter/releases/tag/v0.1.0
