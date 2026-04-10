import fs from 'fs';

const promptsData = JSON.parse(fs.readFileSync('parsed_prompts.json', 'utf-8'));
const filteredPrompts = promptsData.filter(p => p.title !== '📖 为什么做这个项目' && p.title !== '模型选择');

// We use a function replacement to avoid $ capturing group anomalies in JSON.stringify string containing '$`' or '$&'
const promptsStr = JSON.stringify(filteredPrompts, null, 2).replace(/"([^"]+)":/g, (match, p1) => `${p1}:`);

const newContent = `import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

export const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'ai-writing', name: 'AI写作', icon: 'PenTool', color: 'bg-blue-500' },
  { id: 'paper-reading', name: '论文精读', icon: 'BookOpen', color: 'bg-emerald-500' },
  { id: 'literature-org', name: '文献整理', icon: 'Library', color: 'bg-amber-500' },
  { id: 'review-synthesis', name: '综述整理', icon: 'FileText', color: 'bg-purple-500' },
  { id: 'other', name: '其他', icon: 'MoreHorizontal', color: 'bg-slate-500' },
];

export type CategoryId = string;

export interface Prompt {
  id: string;
  title: string;
  content: string;
  category: CategoryId;
  tags: string[];
  isDefault?: boolean;
  createdAt: number;
  updatedAt: number;
}

export const DEFAULT_PROMPTS: Prompt[] = [
  {
    id: 'def-1',
    title: '学术论文摘要润色',
    category: 'ai-writing',
    content: '你是一位资深的学术期刊编辑。请对以下论文摘要进行润色，要求：1. 语言专业、简洁、地道；2. 逻辑严密，突出研究的创新点和贡献；3. 符合顶级学术期刊（如Nature, Science）的表达风格。',
    tags: ['学术', '润色'],
    isDefault: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'def-2',
    title: '论文核心观点提取',
    category: 'paper-reading',
    content: '请阅读以下论文片段，并以列表形式总结其核心观点。要求：1. 准确还原作者意图；2. 区分背景、方法、结果和结论；3. 每条总结不超过50字。',
    tags: ['阅读', '总结'],
    isDefault: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'def-3',
    title: '文献综述大纲生成',
    category: 'review-synthesis',
    content: '基于我提供的研究主题和关键词，请生成一份详尽的文献综述大纲。要求：1. 包含引言、主题分类、研究现状、不足之处和未来方向；2. 逻辑结构清晰，具有深度。',
    tags: ['综述', '大纲'],
    isDefault: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'def-4',
    title: 'BibTeX 格式标准化',
    category: 'literature-org',
    content: '请将以下不规范的文献引用信息转换为标准的 BibTeX 格式。确保包含作者、年份、标题、期刊/会议名、卷号、期号和页码。',
    tags: ['工具', '格式'],
    isDefault: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  ...${promptsStr}
];
`;

fs.writeFileSync('src/lib/constants.ts', newContent);
console.log('constants.ts repaired and updated');
