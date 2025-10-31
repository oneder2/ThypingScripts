/**
 * Fountain格式解析模块
 *
 * 实现Fountain剧本格式的解析和验证功能
 * 支持场景标题、角色、对话、动作等元素的识别
 */

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Fountain元素类型枚举
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum FountainElementType {
    TitlePage,
    SceneHeading,
    Action,
    Character,
    Dialogue,
    Parenthetical,
    Transition,
    Note,
    Centered,
    PageBreak,
}

/// Fountain元素结构
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FountainElement {
    pub element_type: FountainElementType,
    pub content: String,
    pub line_number: usize,
    pub position: usize,
}

/// 文档元数据
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DocumentMetadata {
    pub word_count: usize,
    pub character_count: usize,
    pub scene_count: usize,
    pub character_count_map: HashMap<String, usize>,
}

/// Fountain文档结构
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FountainDocument {
    pub title_page: HashMap<String, String>,
    pub elements: Vec<FountainElement>,
    pub metadata: DocumentMetadata,
}

/// Fountain解析器
pub struct FountainParser {
    content: String,
    lines: Vec<String>,
}

impl FountainParser {
    /// 创建新的解析器
    pub fn new(content: &str) -> Self {
        let lines: Vec<String> = content.lines().map(|s| s.to_string()).collect();
        Self {
            content: content.to_string(),
            lines,
        }
    }

    /// 解析Fountain内容
    pub fn parse(&self) -> Result<FountainDocument, String> {
        let mut elements = Vec::new();
        let mut title_page = HashMap::new();
        let mut in_title_page = true;
        let mut position = 0;
        let mut scene_count = 0;
        let mut character_count_map: HashMap<String, usize> = HashMap::new();

        for (line_number, line) in self.lines.iter().enumerate() {
            let trimmed = line.trim();

            // 跳过空行
            if trimmed.is_empty() {
                in_title_page = false;
                position += line.len() + 1;
                continue;
            }

            // 解析标题页
            if in_title_page && trimmed.contains(':') {
                if let Some((key, value)) = trimmed.split_once(':') {
                    title_page.insert(
                        key.trim().to_lowercase(),
                        value.trim().to_string(),
                    );
                    position += line.len() + 1;
                    continue;
                }
            }

            in_title_page = false;

            // 解析元素
            let element = self.parse_line(line, line_number, position)?;

            // 统计场景和角色
            match &element.element_type {
                FountainElementType::SceneHeading => scene_count += 1,
                FountainElementType::Character => {
                    let char_name = element.content.trim().to_string();
                    *character_count_map.entry(char_name).or_insert(0) += 1;
                }
                _ => {}
            }

            elements.push(element);
            position += line.len() + 1;
        }

        // 计算元数据
        let word_count = self.content.split_whitespace().count();
        let character_count = self.content.chars().count();

        let metadata = DocumentMetadata {
            word_count,
            character_count,
            scene_count,
            character_count_map,
        };

        Ok(FountainDocument {
            title_page,
            elements,
            metadata,
        })
    }

    /// 解析单行内容
    fn parse_line(
        &self,
        line: &str,
        line_number: usize,
        position: usize,
    ) -> Result<FountainElement, String> {
        let trimmed = line.trim();

        // 场景标题 (INT./EXT./I/E 开头)
        if self.is_scene_heading(trimmed) {
            return Ok(FountainElement {
                element_type: FountainElementType::SceneHeading,
                content: trimmed.to_string(),
                line_number,
                position,
            });
        }

        // 强制场景标题 (以 . 开头)
        if trimmed.starts_with('.') && trimmed.len() > 1 {
            return Ok(FountainElement {
                element_type: FountainElementType::SceneHeading,
                content: trimmed[1..].trim().to_string(),
                line_number,
                position,
            });
        }

        // 过渡 (全大写且以TO:结尾)
        if self.is_transition(trimmed) {
            return Ok(FountainElement {
                element_type: FountainElementType::Transition,
                content: trimmed.to_string(),
                line_number,
                position,
            });
        }

        // 强制过渡 (以 > 开头)
        if trimmed.starts_with('>') && !trimmed.starts_with(">>") {
            return Ok(FountainElement {
                element_type: FountainElementType::Transition,
                content: trimmed[1..].trim().to_string(),
                line_number,
                position,
            });
        }

        // 居中文本 (以 > 开头和结尾)
        if trimmed.starts_with('>') && trimmed.ends_with('<') {
            return Ok(FountainElement {
                element_type: FountainElementType::Centered,
                content: trimmed[1..trimmed.len() - 1].trim().to_string(),
                line_number,
                position,
            });
        }

        // 注释 (以 [[ 开头)
        if trimmed.starts_with("[[") {
            return Ok(FountainElement {
                element_type: FountainElementType::Note,
                content: trimmed.to_string(),
                line_number,
                position,
            });
        }

        // 分页符
        if trimmed == "===" || trimmed == "====" {
            return Ok(FountainElement {
                element_type: FountainElementType::PageBreak,
                content: String::new(),
                line_number,
                position,
            });
        }

        // 括号台词 (以 ( 开头)
        if trimmed.starts_with('(') && trimmed.ends_with(')') {
            return Ok(FountainElement {
                element_type: FountainElementType::Parenthetical,
                content: trimmed.to_string(),
                line_number,
                position,
            });
        }

        // 角色名 (全大写，不以空格开头)
        if self.is_character(trimmed) {
            return Ok(FountainElement {
                element_type: FountainElementType::Character,
                content: trimmed.to_string(),
                line_number,
                position,
            });
        }

        // 强制角色名 (以 @ 开头)
        if trimmed.starts_with('@') && trimmed.len() > 1 {
            return Ok(FountainElement {
                element_type: FountainElementType::Character,
                content: trimmed[1..].trim().to_string(),
                line_number,
                position,
            });
        }

        // 默认为动作/描述
        Ok(FountainElement {
            element_type: FountainElementType::Action,
            content: trimmed.to_string(),
            line_number,
            position,
        })
    }

    /// 判断是否为场景标题
    fn is_scene_heading(&self, line: &str) -> bool {
        let upper = line.to_uppercase();
        upper.starts_with("INT.")
            || upper.starts_with("EXT.")
            || upper.starts_with("INT/EXT")
            || upper.starts_with("EXT/INT")
            || upper.starts_with("I/E")
            || upper.starts_with("E/I")
    }

    /// 判断是否为过渡
    fn is_transition(&self, line: &str) -> bool {
        if line != line.to_uppercase() {
            return false;
        }
        line.ends_with("TO:")
            || line == "FADE IN:"
            || line == "FADE OUT:"
            || line == "CUT TO:"
    }

    /// 判断是否为角色名
    fn is_character(&self, line: &str) -> bool {
        // 必须全大写
        if line != line.to_uppercase() {
            return false;
        }

        // 不能以空格开头
        if line.starts_with(' ') {
            return false;
        }

        // 不能是场景标题或过渡
        if self.is_scene_heading(line) || self.is_transition(line) {
            return false;
        }

        // 长度限制
        if line.len() > 50 {
            return false;
        }

        true
    }
}

/// 验证Fountain内容
pub fn validate_fountain(content: &str) -> Result<Vec<String>, String> {
    let mut warnings = Vec::new();

    if content.trim().is_empty() {
        warnings.push("内容为空".to_string());
        return Ok(warnings);
    }

    let parser = FountainParser::new(content);

    // 尝试解析
    match parser.parse() {
        Ok(doc) => {
            // 检查是否有场景
            if doc.metadata.scene_count == 0 {
                warnings.push("未找到场景标题".to_string());
            }

            // 检查是否有对话
            let has_dialogue = doc.elements.iter().any(|e| {
                matches!(e.element_type, FountainElementType::Dialogue)
            });

            if !has_dialogue {
                warnings.push("未找到对话内容".to_string());
            }

            // 检查标题页
            if doc.title_page.is_empty() {
                warnings.push("建议添加标题页信息 (Title, Author等)".to_string());
            }
        }
        Err(e) => {
            warnings.push(format!("解析错误: {}", e));
        }
    }

    Ok(warnings)
}

/// 解析Fountain内容
pub fn parse_fountain(content: &str) -> Result<FountainDocument, String> {
    let parser = FountainParser::new(content);
    parser.parse()
}

