# **ThypingScripts - Tauri IPC API 契约与后端实现文档**

文件名称： ThypingScripts - Tauri IPC API 契约 V1.0  
创建人： gellar  
创建日期： 2025-10-24  
最近更新： 2025-10-24  
关联 SRS/版本： ThypingScripts - 软件需求规格说明书 V1.0  
项目描述： 基于Tauri 2.0的桌面编剧工具，使用临时文件系统和IPC进行前后端通信

## **1\. 核心数据模型 (Data Model)**

定义ThypingScripts中的核心数据实体，基于临时文件系统和Fountain格式。

| 实体名称 | 关键字段 (类型) | 关系 | 描述 |
| :---- | :---- | :---- | :---- |
| **TempFile** | id (String), content (String), save\_path (Option<String>), is\_saved (bool), created\_at (DateTime), modified\_at (DateTime) | N/A | 临时文件信息 |
| **Script** | temp\_file\_id (String), title (String), author (String), version (String) | TempFile(1:1) | 剧本元数据 |
| **Scene** | scene\_id (String), heading (String), action (String), characters (Vec<String>), dialogue (Vec<Dialogue>) | TempFile(1:N) | 场景信息 |
| **Character** | name (String), first\_appearance (String), dialogue\_count (u32) | TempFile(1:N) | 角色信息 |
| **Element** | element\_type (Enum), content (String), position (u32), parent\_scene (String) | Scene(1:N) | Fountain元素（场景标题、动作、对话等） |

## **2\. Tauri IPC 接口合同 (IPC API Contract)**

使用Tauri的IPC机制进行前后端通信，定义所有命令和事件。

### **2.1 文件操作命令**

| 命令名称 | 描述 | 参数 | 返回值 | 权限要求 |
| :---- | :---- | :---- | :---- | :---- |
| **open\_file** | 打开Fountain文件到临时文件 | file\_path: String | Result<TempFile, String> | 文件读取权限 |
| **save\_file** | 保存临时文件到指定路径 | temp\_file\_id: String, save\_path: String | Result<(), String> | 文件写入权限 |
| **new\_temp\_file** | 创建新临时文件 | title: String | Result<TempFile, String> | 临时目录权限 |
| **export\_pdf** | 从临时文件导出PDF | temp\_file\_id: String, output\_path: String | Result<(), String> | 文件读写权限 |
| **get\_temp\_file** | 获取临时文件内容 | temp\_file\_id: String | Result<TempFile, String> | 临时文件读取权限 |
| **update\_temp\_file** | 更新临时文件内容 | temp\_file\_id: String, content: String | Result<(), String> | 临时文件写入权限 |

### **2.2 Fountain解析命令**

| 命令名称 | 描述 | 参数 | 返回值 |
| :---- | :---- | :---- | :---- |
| **parse\_fountain** | 解析Fountain内容 | content: String | Result<Vec<Element>, String> |
| **get\_characters** | 提取角色列表 | content: String | Result<Vec<Character>, String> |
| **get\_scenes** | 提取场景列表 | content: String | Result<Vec<Scene>, String> |
| **validate\_fountain** | 验证Fountain格式 | content: String | Result<bool, String> |

### **2.3 界面状态管理**

| 命令名称 | 描述 | 参数 | 返回值 |
| :---- | :---- | :---- | :---- |
| **get\_app\_state** | 获取应用状态 | 无 | AppState |
| **update\_editor\_state** | 更新编辑器状态 | state: EditorState | Result<(), String> |
| **get\_recent\_files** | 获取最近文件 | 无 | Vec<String> |

## **3\. 业务逻辑实现规范**

### **3.1 核心业务流程**

详细描述复杂业务流程的**处理逻辑**和**状态转换**：

* **例如：订单创建流程：** 1\. 检查库存；2. 锁定库存；3. 创建订单记录；4. 调用支付服务；5. 更新订单状态。

### **3.2 标准错误码定义**

定义系统使用的统一错误码，便于前后端定位问题。

| 状态码 (HTTP) | 自定义 Error Code | 描述 | 适用场景 |
| :---- | :---- | :---- | :---- |
| **400 Bad Request** | 4001 | 输入参数验证失败 | 邮箱格式错误、必填项缺失 |
| **401 Unauthorized** | 4010 | 认证失败或 Token 无效 | 未提供 Token 或 Token 过期 |
| **403 Forbidden** | 4030 | 权限不足 | 试图访问他人数据 |
| **404 Not Found** | 4004 | 资源未找到 | URL 路径错误、数据 ID 不存在 |
| **500 Internal Server Error** | 5000 | 未知系统错误 | 数据库连接失败、代码运行时异常 |

## **4\. 数据库实现与安全**

### **4.1 数据库迁移 (Migration) 策略**

* **工具：** \[例如：Flyway/Alembic\]  
* **命名规范：** 迁移文件命名必须包含版本号和描述性名称。  
* **回滚机制：** 每个迁移必须提供可安全回滚的脚本。

### **4.2 隐私与安全实现**

* **数据脱敏：** 定义哪些敏感数据（如手机号、地址）在日志或非生产环境中需要脱敏。  
* **输入验证：** 所有用户输入必须进行严格的**服务器端**验证和清理，防止注入攻击。

**后续步骤：** 前后端开发团队依据此契约并行开发，同时 DevOps 团队准备部署环境。