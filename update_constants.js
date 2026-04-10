import fs from 'fs';

const promptsData = JSON.parse(fs.readFileSync('parsed_prompts.json', 'utf-8'));
const constantsPath = 'src/lib/constants.ts';
let code = fs.readFileSync(constantsPath, 'utf-8');

// Filter out the first one which is '📖 为什么做这个项目' because it's not a prompt
const filteredPrompts = promptsData.filter(p => p.title !== '📖 为什么做这个项目' && p.title !== '模型选择');

// Convert string to array of objects representation safely
const promptsString = JSON.stringify(filteredPrompts, null, 2).replace(/"([^"]+)":/g, '$1:');

code = code.replace(
  /export const CATEGORIES = \[\s*\{[\s\S]*?\}\s*\] as const;/,
  `export interface Category {
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
];`
);

code = code.replace(
  /export type CategoryId = typeof CATEGORIES\[number\]\['id'\];/,
  `export type CategoryId = string;`
);

code = code.replace(
  /export const DEFAULT_PROMPTS: Prompt\[\] = \[([\s\S]*?)\];/,
  `export const DEFAULT_PROMPTS: Prompt[] = [...[\n$1\n], ...${promptsString}];`
);

fs.writeFileSync(constantsPath, code);
console.log('constants.ts updated');
