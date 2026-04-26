export function buildKnowledgePrompt(
  title: string,
  category: string,
  parentTitle?: string,
  userPrompt?: string
): string {
  const categoryNames: Record<string, string> = {
    grammar: '语法',
    vocabulary: '词汇',
    reading: '阅读',
    writing: '写作',
    listening: '听力',
    cloze: '完形填空',
  }

  return `你是贵州中考英语辅导老师。请针对以下知识点，生成一份详细的讲解内容。

知识点：${title}
所属分类：${categoryNames[category] || category}
${parentTitle ? `父级知识点：${parentTitle}` : ''}

要求：
1. 讲解要深入浅出，适合初中生理解
2. 内容控制在500-800字
3. 必须包含以下部分：
   - 定义说明（用学生能理解的语言解释）
   - 用法规则（搭配例句，例句要带中文翻译）
   - 常见考点与易错点
   - 3-5道典型例题（每道题先输出题干和4个选项，题末再用“答案：”和“解析：”输出正确答案与详细解析）
4. 所有例句和例题必须符合贵州中考难度，不能超纲
5. 使用 Markdown 格式输出，标题用 ###
${userPrompt?.trim() ? `
用户额外要求：
${userPrompt.trim()}` : ''}`
}


export function buildKnowledgeExamplesPrompt(
  title: string,
  category: string,
  parentTitle?: string,
  existingContent?: string | null,
  userPrompt?: string
): string {
  const categoryNames: Record<string, string> = {
    grammar: '语法',
    vocabulary: '词汇',
    reading: '阅读',
    writing: '写作',
    listening: '听力',
    cloze: '完形填空',
  }

  return `你是贵州中考英语命题老师。请针对以下知识点，重新生成一组全新的典型例题。

知识点：${title}
所属分类：${categoryNames[category] || category}
${parentTitle ? `父级知识点：${parentTitle}` : ''}
随机批次：${Date.now()}

${existingContent ? `已有讲解内容摘要如下，请避免重复其中已经出现的题干和选项：\n${existingContent.slice(0, 1800)}` : ''}

要求：
1. 生成 3 道贵州中考英语难度的选择题，题目和选项必须与常见示例不同
2. 每题先输出题干、A/B/C/D 四个选项，题末再用“答案：”和“解析：”输出正确答案与详细解析
3. 解析要说明对应知识点和容易错的原因
4. 只输出例题内容，不要重新讲解知识点定义
5. 使用 Markdown 格式输出，标题用 ### 新生成例题
${userPrompt?.trim() ? `
用户额外要求：
${userPrompt.trim()}` : ''}`;
}
