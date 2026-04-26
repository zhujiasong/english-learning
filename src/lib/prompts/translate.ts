export function buildTranslatePrompt(text: string): string {
  const isChinese = /[\u4e00-\u9fff]/.test(text)
  const direction = isChinese ? '中文翻译成英文' : '英文翻译成中文'

  return `请将以下文本${direction}。

原文：
"${text}"

请同时提供：
1. **翻译结果**：准确、自然的翻译
2. **关键表达**：列出3-5个重要单词/短语的释义（如果是英译中，列出英文原词和中文释义）

要求：
- 翻译要准确，符合初中英语水平
- 如果是中译英，使用初中范围内学过的词汇和句型
- 用 Markdown 格式输出`
}
