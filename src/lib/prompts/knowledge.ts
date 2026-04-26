export function buildKnowledgePrompt(
  title: string,
  category: string,
  parentTitle?: string
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
   - 3-5道典型例题（每道题含题目、4个选项、正确答案、详细解析）
4. 所有例句和例题必须符合贵州中考难度，不能超纲
5. 使用 Markdown 格式输出，标题用 ###`
}
