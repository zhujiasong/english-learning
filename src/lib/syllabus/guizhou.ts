export interface KnowledgeNodeSeed {
  title: string
  category: string
  children?: KnowledgeNodeSeed[]
}

export const guizhouSyllabus: KnowledgeNodeSeed[] = [
  {
    title: '语法',
    category: 'grammar',
    children: [
      {
        title: '时态',
        category: 'grammar',
        children: [
          { title: '一般现在时', category: 'grammar' },
          { title: '一般过去时', category: 'grammar' },
          { title: '一般将来时', category: 'grammar' },
          { title: '现在进行时', category: 'grammar' },
          { title: '过去进行时', category: 'grammar' },
          { title: '现在完成时', category: 'grammar' },
        ],
      },
      {
        title: '被动语态',
        category: 'grammar',
        children: [
          { title: '一般现在时的被动语态', category: 'grammar' },
          { title: '一般过去时的被动语态', category: 'grammar' },
          { title: '含情态动词的被动语态', category: 'grammar' },
        ],
      },
      {
        title: '从句',
        category: 'grammar',
        children: [
          { title: '宾语从句', category: 'grammar' },
          { title: '状语从句', category: 'grammar' },
          { title: '定语从句（基础）', category: 'grammar' },
        ],
      },
      { title: '冠词', category: 'grammar' },
      { title: '介词', category: 'grammar' },
      { title: '连词', category: 'grammar' },
      { title: '代词', category: 'grammar' },
      {
        title: '形容词与副词',
        category: 'grammar',
        children: [
          { title: '比较级与最高级', category: 'grammar' },
        ],
      },
      { title: '情态动词', category: 'grammar' },
      {
        title: '非谓语动词',
        category: 'grammar',
        children: [
          { title: '动词不定式', category: 'grammar' },
          { title: '动名词', category: 'grammar' },
          { title: '分词', category: 'grammar' },
        ],
      },
      { title: '主谓一致', category: 'grammar' },
      { title: '疑问句', category: 'grammar' },
      { title: '祈使句与感叹句', category: 'grammar' },
    ],
  },
  {
    title: '词汇',
    category: 'vocabulary',
    children: [
      { title: '课标核心词汇', category: 'vocabulary' },
      { title: '常见短语搭配', category: 'vocabulary' },
      { title: '构词法', category: 'vocabulary' },
      { title: '近义词辨析', category: 'vocabulary' },
    ],
  },
  {
    title: '阅读',
    category: 'reading',
    children: [
      { title: '阅读理解策略', category: 'reading' },
      { title: '细节理解题', category: 'reading' },
      { title: '推理判断题', category: 'reading' },
      { title: '主旨大意题', category: 'reading' },
      { title: '词义猜测题', category: 'reading' },
      { title: '任务型阅读', category: 'reading' },
    ],
  },
  {
    title: '写作',
    category: 'writing',
    children: [
      { title: '书信与邮件', category: 'writing' },
      { title: '日记', category: 'writing' },
      { title: '通知与便条', category: 'writing' },
      { title: '话题作文', category: 'writing' },
      { title: '看图写话', category: 'writing' },
    ],
  },
  {
    title: '听力',
    category: 'listening',
    children: [
      { title: '听句子选图', category: 'listening' },
      { title: '短对话理解', category: 'listening' },
      { title: '长对话理解', category: 'listening' },
      { title: '短文理解', category: 'listening' },
    ],
  },
  {
    title: '完形填空',
    category: 'cloze',
    children: [
      { title: '上下文推理', category: 'cloze' },
      { title: '固定搭配', category: 'cloze' },
      { title: '语法选择', category: 'cloze' },
      { title: '短文填空', category: 'cloze' },
    ],
  },
]
