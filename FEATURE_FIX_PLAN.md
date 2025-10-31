# ThypingScripts 功能修复计划

**优先级**: 🔴 P0 - 立即修复  
**预计工作量**: 2-3小时  
**目标**: 修复前后端不匹配问题，实现完整的Fountain解析功能

---

## 问题分析

### 问题1: 缺失的Tauri命令

**现象**:
- 前端调用 `parse_fountain` 和 `validate_fountain` 命令
- 后端未在 `main.rs` 中注册这些命令
- 调用时会返回 "command not found" 错误

**根本原因**:
- Fountain模块为空 (`src-tauri/src/fountain/mod.rs`)
- 后端命令处理器未实现

**影响**:
- 任何使用这些命令的功能都会失败
- 前端错误处理会捕获异常

---

## 修复方案

### 步骤1: 实现Fountain模块 (30分钟)

**文件**: `src-tauri/src/fountain/mod.rs`

需要实现:
```rust
// 1. 定义Fountain元素类型
pub enum FountainElementType {
    SceneHeading,
    Character,
    Dialogue,
    Action,
    Parenthetical,
    Transition,
    TitlePage,
}

// 2. 定义Fountain元素结构
pub struct FountainElement {
    pub element_type: FountainElementType,
    pub content: String,
    pub line_number: usize,
}

// 3. 定义Fountain文档结构
pub struct FountainDocument {
    pub elements: Vec<FountainElement>,
    pub title: String,
    pub author: String,
    pub scene_count: usize,
    pub character_count: usize,
}

// 4. 实现解析器
pub fn parse_fountain(content: &str) -> Result<FountainDocument, String>

// 5. 实现验证器
pub fn validate_fountain(content: &str) -> Result<Vec<String>, String>
```

### 步骤2: 添加Tauri命令 (20分钟)

**文件**: `src-tauri/src/main.rs`

需要添加:
```rust
#[tauri::command]
fn parse_fountain(content: String) -> Result<FountainDocument, String> {
    thypingscripts::fountain::parse_fountain(&content)
}

#[tauri::command]
fn validate_fountain(content: String) -> Result<Vec<String>, String> {
    thypingscripts::fountain::validate_fountain(&content)
}
```

并在 `generate_handler!` 中注册:
```rust
.invoke_handler(tauri::generate_handler![
    greet,
    create_file,
    save_file,
    load_file,
    delete_file,
    check_crash_recovery,
    restore_from_recovery,
    cleanup_old_files,
    parse_fountain,      // 新增
    validate_fountain,   // 新增
])
```

### 步骤3: 更新类型定义 (15分钟)

**文件**: `src-tauri/src/lib.rs`

需要导出Fountain类型:
```rust
pub use fountain::{FountainDocument, FountainElement, FountainElementType};
```

### 步骤4: 测试修复 (30分钟)

1. 编译后端:
```bash
cd src-tauri && cargo build
```

2. 检查编译错误

3. 运行应用:
```bash
npm run tauri:dev
```

4. 测试命令:
- 在浏览器控制台测试 `parse_fountain`
- 在浏览器控制台测试 `validate_fountain`

---

## 实现细节

### Fountain解析规则

```
场景标题: INT./EXT. + 地点 + 时间
  例: INT. 咖啡厅 - 白天

角色名: 全大写字母
  例: JOHN

对话: 角色名后的文本
  例: 你好，我要一杯咖啡。

动作: 其他描述性文本
  例: JOHN坐下，看着菜单。

括号台词: (括号内的文本)
  例: (坐下，看着菜单)

过渡: FADE IN/OUT, CUT TO等
  例: FADE IN:

标题页: Title, Author等
  例: Title: 我的剧本
```

### 验证规则

检查以下内容:
- [ ] 是否有场景标题
- [ ] 是否有角色名
- [ ] 是否有对话
- [ ] 是否有动作描述
- [ ] 文本编码是否有效
- [ ] 是否有无效字符

---

## 验收标准

### 功能验收
- [ ] `parse_fountain` 命令可调用
- [ ] `validate_fountain` 命令可调用
- [ ] 返回正确的数据结构
- [ ] 错误处理正确

### 集成验收
- [ ] 前端可成功调用命令
- [ ] 返回数据可被前端正确处理
- [ ] 无运行时错误

### 性能验收
- [ ] 解析速度 < 100ms (1000行文本)
- [ ] 内存使用合理
- [ ] 无内存泄漏

---

## 后续工作

### P1 - 本周完成
1. 实现PDF导出功能
2. 完成工具栏菜单功能
3. 添加错误提示UI

### P2 - 下周完成
1. 添加单元测试
2. 性能优化
3. 文档完善

---

## 参考资源

- [Fountain格式规范](http://fountain.io/)
- [Tauri命令文档](https://tauri.app/v1/guides/features/command/)
- [Rust错误处理](https://doc.rust-lang.org/book/ch09-00-error-handling.html)

---

## 检查清单

- [ ] 创建Fountain模块
- [ ] 实现解析器
- [ ] 实现验证器
- [ ] 添加Tauri命令
- [ ] 更新类型定义
- [ ] 编译测试
- [ ] 功能测试
- [ ] 集成测试
- [ ] 文档更新

