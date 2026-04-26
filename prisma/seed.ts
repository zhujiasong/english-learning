import { Prisma, PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { guizhouSyllabus, type KnowledgeNodeSeed } from '../src/lib/syllabus/guizhou'

const adapter = new PrismaLibSql({ url: 'file:./prisma/dev.db' })
const prisma = new PrismaClient({ adapter })
const verbose = process.env.SEED_VERBOSE === '1'
const log = (...args: unknown[]) => {
  if (verbose) console.log(...args)
}

async function createKnowledgeNodes(
  nodes: KnowledgeNodeSeed[],
  parentId: string | null = null,
  level: number = 0
): Promise<void> {
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    const created = await prisma.knowledgeNode.create({
      data: {
        title: node.title,
        parentId,
        level,
        sortOrder: i,
        category: node.category,
      },
    })

    if (node.children && node.children.length > 0) {
      await createKnowledgeNodes(node.children, created.id, level + 1)
    }
  }
}

async function createSampleExamPapers(): Promise<void> {
  // 题库：选择题
  const choiceBank = [
    { stem: '—What did you do last weekend?\n—I ______ my grandparents in the countryside.', options: ['A. visit', 'B. visited', 'C. will visit', 'D. am visiting'], answer: 'B', explanation: '时间状语 last weekend 表示过去，用一般过去时 visited。' },
    { stem: 'The book on the desk is ______. I bought it yesterday.', options: ['A. I', 'B. me', 'C. my', 'D. mine'], answer: 'D', explanation: '空格后没有名词，需要用名词性物主代词 mine = my book。' },
    { stem: 'We should try our best to protect the environment, ______ we?', options: ['A. should', "B. shouldn't", 'C. will', "D. won't"], answer: 'B', explanation: '反意疑问句，主句为肯定祈使句，附加问句用 should。' },
    { stem: 'There ______ a basketball game between Class 1 and Class 2 tomorrow.', options: ['A. is going to have', 'B. will have', 'C. is going to be', 'D. are going to be'], answer: 'C', explanation: 'There be 句型表示"有"，不用 have。a basketball game 是单数。' },
    { stem: '—Could you tell me ______?\n—Sure. Go along this street and turn left.', options: ['A. where is the nearest hospital', 'B. where the nearest hospital is', 'C. how can I get to the hospital', 'D. how I can get to hospital'], answer: 'B', explanation: '宾语从句用陈述语序（主语+谓语），排除A和C。' },
    { stem: 'My brother is taller than ______ in his class.', options: ['A. any other boy', 'B. any boy', 'C. other boy', 'D. any other boys'], answer: 'A', explanation: '比较级 than 后用 any other + 单数名词。' },
    { stem: 'The movie ______ by millions of people last year.', options: ['A. saw', 'B. was seen', 'C. sees', 'D. is seen'], answer: 'B', explanation: '被动语态：The movie was seen by millions of people.' },
    { stem: 'I don\'t know ______ he will come or not.', options: ['A. whether', 'B. if', 'C. what', 'D. how'], answer: 'A', explanation: 'whether...or not 是固定搭配，表示"是否"。' },
    { stem: 'Please ______ the TV. The baby is sleeping.', options: ['A. turn on', 'B. turn off', 'C. turn up', 'D. turn down'], answer: 'B', explanation: 'turn off TV 表示关掉电视。' },
    { stem: 'Tom ______ his homework when I called him yesterday.', options: ['A. does', 'B. did', 'C. was doing', 'D. is doing'], answer: 'C', explanation: '过去进行时：when + 过去动作，用 was doing。' },
    { stem: '______ beautiful the flowers are!', options: ['A. What', 'B. How', 'C. What a', 'D. How a'], answer: 'B', explanation: '感叹句：How + 形容词 + 主语 + 谓语！' },
    { stem: 'He has lived here ______ 2018.', options: ['A. for', 'B. since', 'C. in', 'D. at'], answer: 'B', explanation: 'since + 时间点（2018），for + 时间段。' },
    { stem: 'She enjoys ______ books in her free time.', options: ['A. read', 'B. reads', 'C. reading', 'D. to read'], answer: 'C', explanation: 'enjoy doing sth 是固定搭配。' },
    { stem: 'If it ______ tomorrow, we will stay at home.', options: ['A. rains', 'B. will rain', 'C. rained', 'D. is raining'], answer: 'A', explanation: '条件状语从句：主将从现，if从句用一般现在时。' },
    { stem: 'The teacher asked us ______ late for school.', options: ['A. not be', 'B. not to be', 'C. to not be', 'D. don\'t be'], answer: 'B', explanation: 'ask sb not to do sth 是固定搭配。' },
    { stem: 'This is the factory ______ we visited last week.', options: ['A. who', 'B. which', 'C. where', 'D. when'], answer: 'B', explanation: '定语从句，先行词 factory 指物，用 which/that。' },
    { stem: 'I ______ to Beijing three times.', options: ['A. have been', 'B. have gone', 'C. went', 'D. go'], answer: 'A', explanation: 'have been to 表示"去过已回"，have gone to 表示"去了未回"。' },
    { stem: '______ of the students in our class are boys.', options: ['A. Two third', 'B. Two thirds', 'C. Second three', 'D. Two three'], answer: 'B', explanation: '分数表达：分子用基数词，分母用序数词，分子>1时分母加s。' },
  ]

  // 题库：完形填空
  const clozeBank = [
    { stem: 'I have a good friend. __(1)__ name is Jack. He __(2)__ playing basketball. Last week, he __(3)__ a game and __(4)__ very happy.\n1. A. He  B. His  C. Him  D. Himself\n2. A. like  B. likes  C. liked  D. liking\n3. A. win  B. wins  C. won  D. winning\n4. A. feel  B. feels  C. felt  D. feeling', options: null, answer: null, explanation: null },
  ]

  // 题库：阅读理解
  const readingBank = [
    { stem: '阅读短文，回答问题：\nTom is a student. He gets up at 6:30 every day. After breakfast, he goes to school by bike. He has four classes in the morning and two in the afternoon. He likes English very much...\n1. What time does Tom get up?\n2. How does Tom go to school?\n3. How many classes does Tom have a day?', options: null, answer: null, explanation: null },
  ]

  // 题库：写作
  const writingBank = [
    { stem: '假如你是李华，你的美国笔友Tom来信询问你的暑假计划。请你用英语写一封回信，内容包括：\n1. 暑假的主要活动安排\n2. 选择这些活动的原因\n3. 期待他的回信\n\n要求：80词左右，信的开头和结尾已给出。', options: null, answer: null, explanation: null },
    { stem: '请以"My Favorite Hobby"为题写一篇80词左右的英语短文。内容包括：\n1. 你最喜欢的爱好是什么\n2. 你为什么喜欢这个爱好\n3. 你通常怎么做这个爱好\n\n要求：语句通顺，表达准确。', options: null, answer: null, explanation: null },
    { stem: '假如你是李明，请你写一篇日记，记录你上周末的一次户外活动。内容包括：\n1. 活动的地点和时间\n2. 你做了什么\n3. 你的感受\n\n要求：80词左右，格式正确。', options: null, answer: null, explanation: null },
    { stem: '请以"What Can We Do for the Environment"为题，写一篇80词左右的英语短文。内容包括：\n1. 环境问题的现状\n2. 我们可以采取的行动\n3. 呼吁大家一起保护环境', options: null, answer: null, explanation: null },
  ]

  // 创建20套试卷（10套真题2016-2025，10套模拟2025）
  const papers = [
    ...Array.from({ length: 10 }, (_, i) => ({ title: `${2016 + i}年贵州省中考英语真题`, year: 2016 + i, type: 'real' as const })),
    ...Array.from({ length: 10 }, (_, i) => ({ title: `2025年贵州中考英语模拟卷（${i + 1}）`, year: 2025, type: 'mock' as const })),
  ]

  for (const paperData of papers) {
    const paper = await prisma.examPaper.create({
      data: {
        title: paperData.title,
        year: paperData.year,
        region: '贵州',
        type: paperData.type,
      },
    })

    const questions: Prisma.QuestionCreateManyInput[] = []
    const questionCount = 6 + Math.floor(Math.random() * 3) // 6-8题

    for (let i = 1; i <= questionCount; i++) {
      const rand = Math.random()
      if (rand < 0.7) {
        // 70% 选择题
        const q = choiceBank[Math.floor(Math.random() * choiceBank.length)]
        questions.push({
          paperId: paper.id,
          type: 'choice',
          stem: q.stem,
          options: JSON.stringify(q.options),
          answer: q.answer,
          explanation: q.explanation,
          sortOrder: i,
        })
      } else if (rand < 0.85) {
        // 15% 完形填空
        const q = clozeBank[Math.floor(Math.random() * clozeBank.length)]
        questions.push({
          paperId: paper.id,
          type: 'cloze',
          stem: q.stem,
          options: q.options,
          answer: q.answer,
          explanation: q.explanation,
          sortOrder: i,
        })
      } else if (rand < 0.95) {
        // 10% 阅读理解
        const q = readingBank[Math.floor(Math.random() * readingBank.length)]
        questions.push({
          paperId: paper.id,
          type: 'reading',
          stem: q.stem,
          options: q.options,
          answer: q.answer,
          explanation: q.explanation,
          sortOrder: i,
        })
      } else {
        // 5% 写作
        const q = writingBank[Math.floor(Math.random() * writingBank.length)]
        questions.push({
          paperId: paper.id,
          type: 'writing',
          stem: q.stem,
          options: q.options,
          answer: q.answer,
          explanation: q.explanation,
          sortOrder: i,
        })
      }
    }

    await prisma.question.createMany({ data: questions })
    log(`已创建：${paperData.title}（${questionCount}题）`)
  }
}

async function main() {
  log('开始填充种子数据...')

  await prisma.question.deleteMany()
  await prisma.examPaper.deleteMany()
  await prisma.knowledgeNode.deleteMany()

  log('创建知识点结构...')
  await createKnowledgeNodes(guizhouSyllabus)

  log('创建样卷...')
  await createSampleExamPapers()

  const nodeCount = await prisma.knowledgeNode.count()
  const paperCount = await prisma.examPaper.count()

  log(`种子数据填充完成! ${nodeCount} 个知识点, ${paperCount} 套试卷`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
