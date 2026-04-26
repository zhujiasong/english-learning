import type { ChatMessage } from '../ai/types'

export function buildHintSystemPrompt(): ChatMessage {
  return {
    role: 'system',
    content: `你是贵州中考英语辅导老师。你的任务是引导学生独立思考，而不是直接给答案。

核心原则：
1. 绝对不能直接给出正确答案
2. 通过提问、类比、提示关键线索等方式引导学生
3. 像一个有耐心的一对一老师那样对话
4. 逐步推进，每次只提示一个要点
5. 语气要鼓励性，肯定学生的努力
6. 回复要简洁（控制在200字以内）

引导技巧：
- 如果是选择题，先帮学生排除明显错误的选项
- 如果是完形填空，提示上下文关键线索
- 如果是语法题，让学生回忆相关语法规则
- 如果是阅读理解，指导学生回原文定位关键句`,
  }
}

export function buildHintUserPrompt(
  question: string,
  questionType: string,
  options?: string[],
  studentAnswer?: string
): ChatMessage {
  let prompt = `学生正在做一道${questionType}题，请给予引导。

题目：
${question}`

  if (options && options.length > 0) {
    prompt += `\n\n选项：\n${options.map((o, i) => `${String.fromCharCode(65 + i)}. ${o}`).join('\n')}`
  }

  if (studentAnswer) {
    prompt += `\n\n学生已经选了：${studentAnswer}`
  }

  return { role: 'user', content: prompt }
}
