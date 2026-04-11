import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit2, 
  Copy, 
  Info,
  PenTool,
  BookOpen,
  Library,
  MoreHorizontal,
  Loader2,
  Github,
  Settings,
  LayoutGrid,
  List as ListIcon,
  ChevronRight,
  Sparkles,
  Command,
  GripVertical,
  X,
  Crosshair,
  FileStack,
  BookMarked,
  BadgeCheck,
  RefreshCcw
} from 'lucide-react';
import { DEFAULT_CATEGORIES, CategoryId, Prompt, DEFAULT_PROMPTS, Category } from './lib/constants';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle
} from '@/components/ui/dialog';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

const categoryIcons = {
  'ai-writing': PenTool,
  'paper-reading': BookOpen,
  'final-review': BookOpen,
  'path-planning': Library,
  'literature-org': Library,
  'other': MoreHorizontal,
};

const categoryIconOptions = [
  { value: 'Library', icon: Library },
  { value: 'BookOpen', icon: BookOpen },
  { value: 'PenTool', icon: PenTool },
  { value: 'FileStack', icon: FileStack },
  { value: 'BookMarked', icon: BookMarked },
  { value: 'Crosshair', icon: Crosshair },
  { value: 'Sparkles', icon: Sparkles },
] as const;

const categoryColorOptions = [
  'bg-blue-500',
  'bg-emerald-500',
  'bg-rose-500',
  'bg-cyan-500',
  'bg-amber-500',
  'bg-violet-500',
  'bg-pink-500',
  'bg-slate-500',
] as const;

const iconByName = Object.fromEntries(
  categoryIconOptions.map(option => [option.value, option.icon])
) as Record<string, React.ComponentType<{ className?: string }>>;

const CATEGORY_ID_MIGRATIONS: Record<string, string> = {
  'review-synthesis': 'literature-org',
};

const REMOVED_CATEGORY_IDS = new Set<string>();

function normalizeCategoryId(categoryId: string): string {
  return CATEGORY_ID_MIGRATIONS[categoryId] || categoryId;
}

function getDefaultCategory(categoryId: string) {
  return DEFAULT_CATEGORIES.find(category => category.id === categoryId);
}

function normalizeCategory(category: Category): Category {
  const normalizedId = normalizeCategoryId(category.id);
  const defaultCategory = getDefaultCategory(normalizedId);

  if (defaultCategory) {
    return { ...defaultCategory };
  }

  return {
    ...category,
    id: normalizedId,
  };
}

function mergeDefaultCategories(savedCategories: Category[]): Category[] {
  const normalizedCategories = savedCategories.map(normalizeCategory);
  const defaultCategoryNameMap = new Map(
    DEFAULT_CATEGORIES.map(category => [category.name.trim().toLowerCase(), category.id])
  );
  const categoriesWithCanonicalIds = normalizedCategories.map(category => {
    const canonicalId = defaultCategoryNameMap.get(category.name.trim().toLowerCase());
    if (canonicalId) {
      const defaultCategory = getDefaultCategory(canonicalId);
      if (defaultCategory) return { ...defaultCategory };
    }

    return category;
  });
  const deduplicatedCategories = categoriesWithCanonicalIds.filter((category, index, list) => (
    list.findIndex(item => item.id === category.id) === index
  ));
  const visibleCategories = deduplicatedCategories.filter(category => !REMOVED_CATEGORY_IDS.has(category.id));
  const savedCategoryIds = new Set(visibleCategories.map(category => category.id));
  const missingDefaults = DEFAULT_CATEGORIES.filter(category => !savedCategoryIds.has(category.id));
  return [...visibleCategories, ...missingDefaults];
}

type DeletedCategory = Category & {
  deletedAt: number;
};

type DeletedPrompt = Prompt & {
  deletedAt: number;
  originalCategory: Category;
};

const STORAGE_KEYS = {
  legacyPrompts: 'prompthub_data',
  customPrompts: 'prompthub_custom_prompts',
  deletedBuiltInPrompts: 'prompthub_deleted_builtin_prompt_ids',
  deletedPrompts: 'prompthub_deleted_prompts',
  deletedCategories: 'prompthub_deleted_categories',
  promptOrder: 'prompthub_prompt_order',
  categories: 'prompthub_categories',
  language: 'prompthub_language',
  theme: 'prompthub_theme',
} as const;

function buildPromptState(
  customPrompts: Prompt[],
  deletedPromptIds: string[],
  orderedPromptIds: string[],
) {
  const normalizedCustomPrompts = customPrompts.map(prompt => ({
    ...prompt,
    category: normalizeCategoryId(prompt.category),
  })).filter(prompt => !REMOVED_CATEGORY_IDS.has(prompt.category));
  const visibleBuiltIns = DEFAULT_PROMPTS.filter(prompt => !deletedPromptIds.includes(prompt.id));
  const visibleCustomPrompts = normalizedCustomPrompts.filter(prompt => !deletedPromptIds.includes(prompt.id));
  const promptMap = new Map<string, Prompt>();

  [...visibleBuiltIns, ...visibleCustomPrompts].forEach(prompt => {
    promptMap.set(prompt.id, prompt);
  });

  const orderedPrompts = orderedPromptIds
    .map(id => promptMap.get(id))
    .filter((prompt): prompt is Prompt => Boolean(prompt));

  const missingPrompts = [...promptMap.values()].filter(
    prompt => !orderedPromptIds.includes(prompt.id)
  );

  return [...orderedPrompts, ...missingPrompts];
}

function parseStoredJson<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function ensureRecycleBinCategory(categories: Category[]) {
  const recycleBin = categories.find(category => category.id === 'other');
  if (recycleBin) {
    return [...categories.filter(category => category.id !== 'other'), recycleBin];
  }

  const defaultRecycleBin = DEFAULT_CATEGORIES.find(category => category.id === 'other')!;
  return [...categories, defaultRecycleBin];
}

function insertCategoryBeforeRecycleBin(categories: Category[], category: Category) {
  const withoutCategory = categories.filter(item => item.id !== category.id && item.id !== 'other');
  const recycleBin = categories.find(item => item.id === 'other')
    || DEFAULT_CATEGORIES.find(item => item.id === 'other')!;

  return [...withoutCategory, category, recycleBin];
}

type Language = 'zh' | 'en';

const DEFAULT_CATEGORY_NAME_BY_LANGUAGE: Record<Language, Record<string, string>> = {
  zh: {
    'ai-writing': '论文写作',
    'paper-reading': '论文阅读',
    'final-review': '考试复习',
    'path-planning': '路径规划',
    'literature-org': '文献整理',
    other: '回收站',
  },
  en: {
    'ai-writing': 'Paper Writing',
    'paper-reading': 'Paper Reading',
    'final-review': 'Exam Review',
    'path-planning': 'Path Planning',
    'literature-org': 'Literature Organization',
    other: 'Recycle Bin',
  },
};

const BUILT_IN_PROMPT_TITLE_BY_LANGUAGE: Record<Language, Record<string, string>> = {
  zh: {},
  en: {
    'def-1': 'Academic Abstract Polishing',
    'def-2a': 'Six-Dimension Paper Analysis',
    'def-2b': 'Literature Research',
    'def-2c': 'Rapid Literature Scan',
    'def-2d': 'Paragraph-by-Paragraph Reading & Formula Explanation',
    'def-final-1': 'Slide-by-Slide Lecture',
    'def-final-2': 'Feynman Concept Explainer',
    'def-final-3': 'Module-Based Lecture (ADHD)',
    'def-path-1': 'Study Plan (Full)',
    'def-path-2': 'Study Plan (Lite)',
    'def-path-3': 'Study Plan (Shortest Path)',
    'def-ai-10': 'Why This Project',
    'def-ai-11': 'EN to ZH',
    'def-ai-12': 'ZH to ZH Rewrite',
    'def-ai-13': 'Compress',
    'def-ai-14': 'Expand',
    'def-ai-15': 'English Paper Polishing',
    'def-ai-16': 'Chinese Paper Polishing',
    'def-ai-17': 'Logic Check',
    'def-ai-18': 'De-AI Tone (LaTeX English)',
    'def-ai-19': 'De-AI Tone (Word Chinese)',
    'def-ai-20': 'Paper Architecture Diagram',
    'def-ai-21': 'Experiment Figure Recommendations',
    'def-ai-22': 'Generate Figure Title',
    'def-ai-23': 'Generate Table Title',
    'def-ai-24': 'Experiment Analysis',
    'def-ai-25': 'Full-Paper Reviewer Audit',
  },
};

const BUILT_IN_PROMPT_CONTENT_BY_LANGUAGE: Record<Language, Record<string, string>> = {
  zh: {},
  en: {
    'def-1': 'You are a senior academic journal editor. Please polish the following abstract: (1) keep the language professional, concise, and natural; (2) maintain rigorous logic and highlight novelty and contributions; (3) align with top-tier journal style (e.g., Nature, Science).',
    'def-2a': 'You are a first-principles thinker. Read the paper carefully and explain it in markdown with six sections: Task, Challenge, Insight, Novelty, Potential Flaw, and Motivation. Use clear structure, no latex, and no pleasantries.',
    'def-2b': 'You are a rigorous research assistant. Provide answers based on real and verifiable literature only. Include structured references with author, year, title, venue, pages, DOI/arXiv, and retrieval evidence (database, keywords, URL). Distinguish strong evidence from hypotheses.',
    'def-2c': 'Role: quick paper skimming assistant. Goal: extract core information quickly. Please summarize title/authors/year, abstract, background, methods, key findings, conclusion/contribution, and keywords in a concise structured format.',
    'def-2d': 'Role: senior researcher. Goal: deeply explain selected paper sections and formulas with rigor and clarity. Output as: quoted original text, translation, and professional explanation. For formulas, explain components, meaning, and derivation in detail.',
    'def-final-1': 'Role: professional instructor. Goal: explain lecture slides page by page with structured output: quoted original text, translation when needed, detailed explanation, and markdown notes. Remove header/footer noise and keep mathematical notation standard.',
    'def-final-2': 'System: explain complex concepts in a Feynman style. Ask the user for topic and current level, provide simple analogies, identify confusion points, ask 3-5 diagnostic questions, iteratively refine explanation, and end with a concise teach-back summary.',
    'def-final-3': 'Role: patient ADHD-friendly tutor. Explain content in modules (3-5 related pages), in simple language with analogies, pause after each module, and adapt immediately when the user says the content is too hard or too much.',
    'def-path-1': 'You are a top learning strategist. Build an executable personalized learning plan using deliberate practice and efficient learning principles: measurable task decomposition, learning-zone difficulty, focused sessions, feedback loops, active recall, weak-point drills, and real-world output.',
    'def-path-2': 'You are a learning strategy coach. Create a concise and actionable personalized plan: measurable task breakdown, learning-zone training, focus schedule + feedback tests, knowledge framework first, active recall + Feynman + weak-point practice.',
    'def-path-3': 'Role: learning strategy agent. Input: domain, goal, baseline, daily time. Output: shortest actionable plan only. Enforce measurable sub-tasks, learning-zone difficulty, focus + feedback loop, structured progression, active recall, and deliberate practice.',
    'def-ai-11': 'Role: senior CS academic translator. Translate the given English LaTeX snippet into clear Chinese text. Remove citation/index commands, preserve meaning strictly, keep sentence structure aligned with source, and output plain Chinese only without LaTeX syntax.',
    'def-ai-12': 'Role: senior Chinese academic editor. Rewrite fragmented Chinese draft into a coherent formal academic paragraph. Reorganize logic, keep one core idea per paragraph, remove colloquial wording, and output: [Refined Text] + [Logic flow].',
    'def-ai-13': 'Role: concision-focused academic editor. Slightly shorten the provided English LaTeX (about 5-15 words) without losing any technical meaning or parameters. Output: [LaTeX], [Translation], [Modification Log].',
    'def-ai-14': 'Role: logic-focused academic editor. Slightly expand the provided English LaTeX (about 5-15 words) by making implicit logic explicit and improving coherence. No fluff. Output: [LaTeX], [Translation], [Modification Log].',
    'def-ai-15': 'Role: senior CS paper editor. Deeply polish the provided English LaTeX for top conference quality: fix grammar, improve clarity and rigor, keep commands and formulas, avoid unnecessary fancy wording. Output: [LaTeX], [Translation], [Modification Log].',
    'def-ai-16': 'Role: senior Chinese academic editor. Polish Chinese academic paragraphs only when needed (language errors, logic gaps, colloquial tone). Keep valid original phrasing. Output: [Refined Text] and [Review Comments].',
    'def-ai-17': 'Role: final manuscript checker. Perform high-threshold consistency review on English LaTeX. Report only substantial issues (logical contradiction, term inconsistency, severe grammar ambiguity). If no issue, output: [Pass: no substantial issue].',
    'def-ai-18': 'Rewrite the given English LaTeX paragraph to reduce generic AI style while preserving exact meaning, technical details, and structure. Keep it natural, concise, and publication-ready.',
    'def-ai-19': 'Rewrite the given Chinese paragraph to reduce generic AI tone while preserving meaning and evidence strength. Keep formal academic style and plain-text Word-friendly output.',
    'def-ai-20': 'Generate a clear paper architecture/logic diagram plan from the provided manuscript section, including module definitions, relationships, and recommended figure layout for publication.',
    'def-ai-21': 'Recommend suitable experiment figures for the given research results. For each figure, explain what it shows, why it is needed, and suggested chart type.',
    'def-ai-22': 'Generate concise and publication-quality figure titles for the provided experiment description, with style suitable for top-tier CS papers.',
    'def-ai-23': 'Generate concise and publication-quality table titles for the provided experiment description, aligned with academic paper conventions.',
    'def-ai-24': 'Provide rigorous experiment analysis: summarize main findings, compare baselines, explain causal factors, identify limitations, and suggest follow-up experiments.',
    'def-ai-25': 'Review the full paper from a strict reviewer perspective: evaluate novelty, clarity, methodology, experiments, writing quality, risks, and final recommendation with actionable revision points.',
  },
};

const messages = {
  zh: {
    appName: 'OurPrompt',
    categoryLibrary: '库分类',
    recycleBin: '回收站',
    allPrompts: '全部 Prompt',
    promptPrinciples: 'Prompt 原则',
    promptPrinciplesDesc: '点击查看我们推荐的提示词设计框架。',
    system: '系统',
    settings: '设置',
    githubOpenSource: 'GitHub 开源',
    newPrompt: '新建 Prompt',
    searchPlaceholder: '搜索标题、内容或标签...',
    totalTemplates: (count: number) => `共 ${count} 个模板`,
    builtin: '内置',
    custom: '自定义',
    copy: '复制',
    copied: '已复制',
    noPromptFound: '没有找到 Prompt',
    noPromptHint: '尝试更换搜索词或点击“新建”创建一个',
    promptEditor: '模板编辑器',
    editPrompt: '编辑模板',
    createPrompt: '创建新模板',
    title: '标题',
    titlePlaceholder: '给你的 Prompt 起个名字...',
    category: '分类',
    promptContent: 'Prompt 内容',
    promptDetails: 'Prompt 详情',
    promptDetailsDesc: '双击卡片或列表项，可以快速查看完整内容。',
    promptDetailsHint: '这里展示的是完整 Prompt 内容。',
    doubleClickHint: '双击可查看详情',
    viewPrompt: '查看',
    promptPlaceholder: '在这里输入你的 Prompt 指令，可以使用 {{input}} 作为占位符...',
    cancel: '取消',
    saveTemplate: '保存模板',
    createCategory: '新增分类',
    createCategoryDesc: '输入一个新的库分类名称，它会出现在左侧列表里。',
    categoryName: '分类名称',
    categoryNamePlaceholder: '例如：数据标注',
    createCategoryAction: '新建分类',
    categoryIcon: '图标',
    categoryColor: '颜色',
    renameCategory: '重命名分类',
    renameCategoryDesc: (name?: string) => `给“${name || ''}”换一个更合适的名字。`,
    renameCategoryPlaceholder: '输入新的分类名称',
    renameCategoryAction: '保存名称',
    deleteCategory: '删除分类',
    deleteCategoryDesc: (name?: string) => `确定要删除“${name || ''}”吗？这个分类和它下面的 Prompt 会进入回收站，并且可以恢复。`,
    deleteCategoryAction: '删除分类',
    enterCategoryName: '请输入分类名称',
    categoryExists: '这个分类已经存在',
    categoryCreated: '已新建分类',
    categoryRenamed: '已重命名分类',
    categoryDeleted: '库已删除',
    categoryRestored: '分类已恢复',
    fillTitleAndContent: '请填写标题和内容',
    updated: '已更新',
    created: '已创建',
    builtInPromptNoticeTitle: '内置 Prompt 不可编辑',
    builtInPromptNoticeDesc: '内置 Prompt 属于系统模板，为了保持内容稳定，不能直接编辑。你仍然可以删除它。',
    builtInPromptTooltip: '内置 Prompt 不可编辑',
    acknowledge: '知道了',
    deletePromptConfirm: '确定要删除这个 Prompt 吗？',
    deletePrompt: '删除 Prompt',
    deletePromptDesc: (name?: string) => `确定要删除“${name || ''}”吗？删除后将无法恢复。`,
    deletePromptAction: '删除',
    permanentlyDelete: '永久删除',
    permanentlyDeleteCategoryDesc: (name?: string) => `确定要永久删除“${name || ''}”吗？删除后将无法恢复。`,
    permanentlyDeletePromptDesc: (name?: string) => `确定要永久删除“${name || ''}”吗？删除后将无法恢复。`,
    deleted: '已删除',
    restored: '已恢复',
    deletedCategoriesTitle: '已删除分类',
    deletedPromptsTitle: '已删除 Prompt',
    recycleBinEmpty: '回收站是空的',
    recycleBinHint: '删除的分类和 Prompt 会出现在这里，并且可以恢复。',
    restore: '恢复',
    deletedAt: '删除时间',
    dragToSort: '拖动可排序',
    languageSettings: '语言设置',
    languageSettingsDesc: '选择界面显示语言。',
    themeSettings: '外观主题',
    themeSettingsDesc: '选择浅色或深色主题。',
    lightTheme: '浅色',
    darkTheme: '深色',
    chinese: '中文',
    english: 'English',
    principleTask: '1. Task（任务）',
    principleTaskDesc: '明确 AI 要做什么（具体 + 可执行）\n→ 可加入角色 + 输出格式提升质量',
    principleContext: '2. Context（背景）',
    principleContextDesc: '提供关键信息（越具体越好）\n→ 人物、偏好、约束、目标等',
    principleReference: '3. Reference（参考）',
    principleReferenceDesc: '提供示例 / 偏好 / 历史案例\n→ 帮助 AI 对齐风格与方向',
    principleEvaluate: '4. Evaluate（评估）',
    principleEvaluateDesc: '判断输出是否满足需求：\n→ 是否符合预期？\n→ 是否足够具体/有用？',
    principleIterate: '5. Iterate（迭代）',
    principleIterateDesc: '根据结果持续优化：\n→ 补充细节\n→ 调整表达\n→ 增加约束',
    principleSummary: '先把任务说清，再补背景和参考，最后根据结果继续收紧提示词。',
  },
  en: {
    appName: 'OurPrompt',
    categoryLibrary: 'Libraries',
    recycleBin: 'Recycle Bin',
    allPrompts: 'All Prompts',
    promptPrinciples: 'Prompt Principles',
    promptPrinciplesDesc: 'Open our recommended prompt design framework.',
    system: 'System',
    settings: 'Settings',
    githubOpenSource: 'GitHub',
    newPrompt: 'New Prompt',
    searchPlaceholder: 'Search titles, content, or tags...',
    totalTemplates: (count: number) => `${count} templates`,
    builtin: 'Built-in',
    custom: 'Custom',
    copy: 'Copy',
    copied: 'Copied',
    noPromptFound: 'No prompts found',
    noPromptHint: 'Try another keyword or create a new prompt',
    promptEditor: 'Prompt Editor',
    editPrompt: 'Edit Prompt',
    createPrompt: 'Create Prompt',
    title: 'Title',
    titlePlaceholder: 'Give your prompt a name...',
    category: 'Category',
    promptContent: 'Prompt Content',
    promptDetails: 'Prompt Details',
    promptDetailsDesc: 'Double-click a card or row to view the full content.',
    promptDetailsHint: 'This panel shows the full prompt content.',
    doubleClickHint: 'Double-click to view',
    viewPrompt: 'View',
    promptPlaceholder: 'Write your prompt here. You can use {{input}} as a placeholder...',
    cancel: 'Cancel',
    saveTemplate: 'Save Prompt',
    createCategory: 'New Category',
    createCategoryDesc: 'Enter a new category name for the sidebar.',
    categoryName: 'Category Name',
    categoryNamePlaceholder: 'For example: Data Labeling',
    createCategoryAction: 'Create',
    categoryIcon: 'Icon',
    categoryColor: 'Color',
    renameCategory: 'Rename Category',
    renameCategoryDesc: (name?: string) => `Rename “${name || ''}” to something clearer.`,
    renameCategoryPlaceholder: 'Enter a new category name',
    renameCategoryAction: 'Save',
    deleteCategory: 'Delete Category',
    deleteCategoryDesc: (name?: string) => `Delete “${name || ''}”? This category and its prompts will move to the recycle bin and can be restored later.`,
    deleteCategoryAction: 'Delete',
    enterCategoryName: 'Please enter a category name',
    categoryExists: 'That category already exists',
    categoryCreated: 'Category created',
    categoryRenamed: 'Category renamed',
    categoryDeleted: 'Category deleted',
    categoryRestored: 'Category restored',
    fillTitleAndContent: 'Please fill in both title and content',
    updated: 'Updated',
    created: 'Created',
    builtInPromptNoticeTitle: 'Built-in prompts cannot be edited',
    builtInPromptNoticeDesc: 'Built-in prompts are system templates and cannot be edited directly. You can still delete them.',
    builtInPromptTooltip: 'Built-in prompts cannot be edited',
    acknowledge: 'OK',
    deletePromptConfirm: 'Delete this prompt?',
    deletePrompt: 'Delete Prompt',
    deletePromptDesc: (name?: string) => `Delete “${name || ''}”? This action cannot be undone.`,
    deletePromptAction: 'Delete',
    permanentlyDelete: 'Delete Permanently',
    permanentlyDeleteCategoryDesc: (name?: string) => `Permanently delete “${name || ''}”? This action cannot be undone.`,
    permanentlyDeletePromptDesc: (name?: string) => `Permanently delete “${name || ''}”? This action cannot be undone.`,
    deleted: 'Deleted',
    restored: 'Restored',
    deletedCategoriesTitle: 'Deleted Categories',
    deletedPromptsTitle: 'Deleted Prompts',
    recycleBinEmpty: 'Recycle bin is empty',
    recycleBinHint: 'Deleted categories and prompts will appear here and can be restored.',
    restore: 'Restore',
    deletedAt: 'Deleted at',
    dragToSort: 'Drag to reorder',
    languageSettings: 'Language',
    languageSettingsDesc: 'Choose the interface language.',
    themeSettings: 'Theme',
    themeSettingsDesc: 'Choose light or dark mode.',
    lightTheme: 'Light',
    darkTheme: 'Dark',
    chinese: '中文',
    english: 'English',
    principleTask: '1. Task',
    principleTaskDesc: 'State exactly what the AI should do in a concrete, executable way.\n→ Add role and output format to improve quality.',
    principleContext: '2. Context',
    principleContextDesc: 'Provide key background information as specifically as possible.\n→ Include people, preferences, constraints, and goals.',
    principleReference: '3. Reference',
    principleReferenceDesc: 'Provide examples, preferences, or past cases.\n→ This helps the AI align with your style and direction.',
    principleEvaluate: '4. Evaluate',
    principleEvaluateDesc: 'Check whether the output meets the need:\n→ Does it match expectations?\n→ Is it specific and useful enough?',
    principleIterate: '5. Iterate',
    principleIterateDesc: 'Keep improving based on the result:\n→ Add detail\n→ Adjust wording\n→ Add constraints',
    principleSummary: 'Clarify the task first, add context and references next, then tighten the prompt based on results.',
  }
} as const;

export default function App() {
  const categoryScrollAreaRef = useRef<HTMLDivElement | null>(null);
  const promptScrollAreaRef = useRef<HTMLDivElement | null>(null);
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.language);
    return saved === 'en' ? 'en' : 'zh';
  });
  const theme: string = 'light';
  const [deletedPrompts, setDeletedPrompts] = useState<DeletedPrompt[]>(() => []);
  const [deletedCategories, setDeletedCategories] = useState<DeletedCategory[]>(() => []);
  const [prompts, setPrompts] = useState<Prompt[]>(() => {
    const customPrompts = parseStoredJson<Prompt[]>(
      localStorage.getItem(STORAGE_KEYS.customPrompts),
      [],
    ).map(prompt => ({
      ...prompt,
      category: normalizeCategoryId(prompt.category),
    }));
    const orderedPromptIds = parseStoredJson<string[]>(
      localStorage.getItem(STORAGE_KEYS.promptOrder),
      [],
    );

    if (
      localStorage.getItem(STORAGE_KEYS.customPrompts) ||
      localStorage.getItem(STORAGE_KEYS.promptOrder)
    ) {
      return buildPromptState(
        customPrompts,
        [],
        orderedPromptIds,
      );
    }

    const legacyPrompts = parseStoredJson<Prompt[]>(
      localStorage.getItem(STORAGE_KEYS.legacyPrompts),
      DEFAULT_PROMPTS,
    ).map(prompt => ({
      ...prompt,
      category: normalizeCategoryId(prompt.category),
    }));
    const migratedCustomPrompts = legacyPrompts.filter(prompt => !prompt.isDefault);
    const migratedPromptOrder = legacyPrompts.map(prompt => prompt.id);

    return buildPromptState(
      migratedCustomPrompts,
      [],
      migratedPromptOrder,
    );
  });
  const [searchQuery, setSearchQuery] = useState('');

  const [categories, setCategories] = useState<Category[]>(() => {
    return ensureRecycleBinCategory(mergeDefaultCategories(parseStoredJson<Category[]>(
      localStorage.getItem(STORAGE_KEYS.categories),
      DEFAULT_CATEGORIES,
    )));
  });

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.categories,
      JSON.stringify(ensureRecycleBinCategory(mergeDefaultCategories(categories))),
    );
  }, [categories]);

  const [activeCategory, setActiveCategory] = useState<CategoryId | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPrinciplesOpen, setIsPrinciplesOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState<(typeof categoryIconOptions)[number]['value']>('Library');
  const [newCategoryColor, setNewCategoryColor] = useState<(typeof categoryColorOptions)[number]>('bg-blue-500');
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [categoryToRename, setCategoryToRename] = useState<Category | null>(null);
  const [renameCategoryName, setRenameCategoryName] = useState('');
  const [renameCategoryIcon, setRenameCategoryIcon] = useState<(typeof categoryIconOptions)[number]['value']>('Library');
  const [renameCategoryColor, setRenameCategoryColor] = useState<(typeof categoryColorOptions)[number]>('bg-blue-500');
  const [draggedCategoryId, setDraggedCategoryId] = useState<string | null>(null);
  const [dragOverCategoryId, setDragOverCategoryId] = useState<string | null>(null);
  const [dragOverCategoryPosition, setDragOverCategoryPosition] = useState<'before' | 'after' | null>(null);
  const draggedCategoryIdRef = useRef<string | null>(null);
  const dragOverCategoryIdRef = useRef<string | null>(null);
  const dragOverCategoryPositionRef = useRef<'before' | 'after' | null>(null);
  const [promptToDelete, setPromptToDelete] = useState<Prompt | null>(null);
  const [deletedCategoryToPurge, setDeletedCategoryToPurge] = useState<DeletedCategory | null>(null);
  const [deletedPromptToPurge, setDeletedPromptToPurge] = useState<DeletedPrompt | null>(null);
  const [builtInPromptNotice, setBuiltInPromptNotice] = useState<Prompt | null>(null);
  const [draggedPromptId, setDraggedPromptId] = useState<string | null>(null);
  const [dragOverPromptId, setDragOverPromptId] = useState<string | null>(null);
  const [dragOverPromptPosition, setDragOverPromptPosition] = useState<'before' | 'after' | null>(null);
  const draggedPromptIdRef = useRef<string | null>(null);
  const dragOverPromptIdRef = useRef<string | null>(null);
  const dragOverPromptPositionRef = useRef<'before' | 'after' | null>(null);
  const [dragMode, setDragMode] = useState<'category' | 'prompt' | null>(null);
  const [viewingPrompt, setViewingPrompt] = useState<Prompt | null>(null);
  
  // Prompt Editor State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [editorTitle, setEditorTitle] = useState('');
  const [editorContent, setEditorContent] = useState('');
  const [editorCategory, setEditorCategory] = useState<CategoryId>('ai-writing');
  const [isSaving, setIsSaving] = useState(false);

  const t = messages[language];
  const getCategoryDisplayName = (category: Category) => {
    if (category.id === 'other') return t.recycleBin;
    return DEFAULT_CATEGORY_NAME_BY_LANGUAGE[language][category.id] || category.name;
  };
  const getCategoryDisplayNameById = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return t.category;
    return getCategoryDisplayName(category);
  };
  const localizedPrompts = useMemo(() => {
    const localizedTitleMap = BUILT_IN_PROMPT_TITLE_BY_LANGUAGE[language];
    const localizedContentMap = BUILT_IN_PROMPT_CONTENT_BY_LANGUAGE[language];
    return prompts.map(prompt => {
      if (!prompt.isDefault) return prompt;
      const localizedTitle = localizedTitleMap[prompt.id];
      const localizedContent = localizedContentMap[prompt.id];
      if (!localizedTitle && !localizedContent) return prompt;
      return {
        ...prompt,
        title: localizedTitle || prompt.title,
        content: localizedContent || prompt.content,
      };
    });
  }, [prompts, language]);

  useEffect(() => {
    if (activeCategory !== 'all' && !categories.some(category => category.id === activeCategory)) {
      setActiveCategory('all');
    }
  }, [activeCategory, categories]);

  // Save data to localStorage
  useEffect(() => {
    const customPrompts = prompts.filter(prompt => !prompt.isDefault);
    const orderedPromptIds = prompts.map(prompt => prompt.id);

    localStorage.setItem(STORAGE_KEYS.customPrompts, JSON.stringify(customPrompts));
    localStorage.setItem(STORAGE_KEYS.promptOrder, JSON.stringify(orderedPromptIds));
  }, [prompts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.deletedPrompts, JSON.stringify(deletedPrompts));
  }, [deletedPrompts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.deletedCategories, JSON.stringify(deletedCategories));
  }, [deletedCategories]);

  useEffect(() => {
    localStorage.removeItem(STORAGE_KEYS.deletedBuiltInPrompts);
    localStorage.removeItem(STORAGE_KEYS.deletedPrompts);
    localStorage.removeItem(STORAGE_KEYS.deletedCategories);
    setDeletedPrompts([]);
    setDeletedCategories([]);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.language, language);
  }, [language]);

  const addCategory = () => {
    setNewCategoryName('');
    setNewCategoryIcon('Library');
    setNewCategoryColor('bg-blue-500');
    setIsCategoryDialogOpen(true);
  };

  const submitCategory = () => {
    const name = newCategoryName.trim();
    if (!name) {
      toast.error(t.enterCategoryName);
      return;
    }

    const exists = categories.some(category => category.name.toLowerCase() === name.toLowerCase());
    if (exists) {
      toast.error(t.categoryExists);
      return;
    }

    const newId = `cat-${Date.now()}`;

    setCategories(prev => insertCategoryBeforeRecycleBin(prev, {
        id: newId,
        name,
        icon: newCategoryIcon,
        color: newCategoryColor
      }));
    setEditorCategory(newId);
    setIsCategoryDialogOpen(false);
    setNewCategoryName('');
    setNewCategoryIcon('Library');
    setNewCategoryColor('bg-blue-500');
    toast.success(t.categoryCreated);
  };

  const requestDeleteCategory = (category: Category, e: React.MouseEvent) => {
    e.stopPropagation();
    setCategoryToDelete(category);
  };

  const requestRenameCategory = (category: Category, e: React.MouseEvent) => {
    e.stopPropagation();
    setCategoryToRename(category);
    setRenameCategoryName(category.name);
    setRenameCategoryIcon((iconByName[category.icon] ? category.icon : 'Library') as (typeof categoryIconOptions)[number]['value']);
    setRenameCategoryColor((categoryColorOptions.includes(category.color as (typeof categoryColorOptions)[number])
      ? category.color
      : 'bg-blue-500') as (typeof categoryColorOptions)[number]);
  };

  const confirmRenameCategory = () => {
    if (!categoryToRename) return;

    const name = renameCategoryName.trim();
    if (!name) {
      toast.error(t.enterCategoryName);
      return;
    }

    const exists = categories.some(category => (
      category.id !== categoryToRename.id &&
      category.name.toLowerCase() === name.toLowerCase()
    ));

    if (exists) {
      toast.error(t.categoryExists);
      return;
    }

    setCategories(prev => prev.map(category => (
      category.id === categoryToRename.id
        ? { ...category, name, icon: renameCategoryIcon, color: renameCategoryColor }
        : category
    )));
    setCategoryToRename(null);
    setRenameCategoryName('');
    setRenameCategoryIcon('Library');
    setRenameCategoryColor('bg-blue-500');
    toast.success(t.categoryRenamed);
  };

  const confirmDeleteCategory = () => {
    if (!categoryToDelete) return;

    const deletedAt = Date.now();
    const category = categoryToDelete;
    const promptsToTrash = prompts.filter(prompt => prompt.category === category.id);

    setDeletedCategories(prev => [...prev.filter(item => item.id !== category.id), { ...category, deletedAt }]);
    setDeletedPrompts(prev => [
      ...prev.filter(prompt => !promptsToTrash.some(item => item.id === prompt.id)),
      ...promptsToTrash.map(prompt => ({
        ...prompt,
        deletedAt,
        originalCategory: category,
      })),
    ]);
    setCategories(prev => ensureRecycleBinCategory(prev.filter(c => c.id !== category.id)));
    setPrompts(prev => prev.filter(prompt => prompt.category !== category.id));
    if (activeCategory === category.id) setActiveCategory('other');
    if (editorCategory === category.id) setEditorCategory('ai-writing');
    setCategoryToDelete(null);
    toast.success(t.categoryDeleted);
  };

  const moveCategory = (sourceId: string, targetId: string, position: 'before' | 'after' = 'before') => {
    if (sourceId === targetId) return;

    setCategories(prev => {
      const sourceIndex = prev.findIndex(category => category.id === sourceId);
      const targetIndex = prev.findIndex(category => category.id === targetId);

      if (sourceIndex === -1 || targetIndex === -1) return prev;

      const next = [...prev];
      const [moved] = next.splice(sourceIndex, 1);
      const adjustedTargetIndex = sourceIndex < targetIndex ? targetIndex - 1 : targetIndex;
      const insertIndex = position === 'after' ? adjustedTargetIndex + 1 : adjustedTargetIndex;
      next.splice(insertIndex, 0, moved);
      return next;
    });
  };

  const savePrompt = async () => {
    if (!editorTitle.trim() || !editorContent.trim()) {
      toast.error(t.fillTitleAndContent);
      return;
    }

    setIsSaving(true);
    const now = Date.now();
    
    if (editingPrompt) {
      setPrompts(prev => prev.map(p => p.id === editingPrompt.id ? {
        ...p,
        title: editorTitle,
        content: editorContent,
        category: editorCategory,
        updatedAt: now
      } : p));
      toast.success(t.updated);
    } else {
      const newPrompt: Prompt = {
        id: `user-${now}`,
        title: editorTitle,
        content: editorContent,
        category: editorCategory,
        tags: [],
        createdAt: now,
        updatedAt: now,
      };
      setPrompts(prev => [newPrompt, ...prev]);
      toast.success(t.created);
    }
    
    setIsEditorOpen(false);
    setIsSaving(false);
    resetEditor();
  };

  const requestDeletePrompt = (prompt: Prompt) => {
    setPromptToDelete(prompt);
  };

  const confirmDeletePrompt = () => {
    if (!promptToDelete) return;

    const originalCategory = categories.find(category => category.id === promptToDelete.category)
      || deletedCategories.find(category => category.id === promptToDelete.category)
      || DEFAULT_CATEGORIES.find(category => category.id === promptToDelete.category)
      || DEFAULT_CATEGORIES.find(category => category.id === 'other')!;

    setDeletedPrompts(prev => [
      ...prev.filter(prompt => prompt.id !== promptToDelete.id),
      {
        ...promptToDelete,
        deletedAt: Date.now(),
        originalCategory,
      },
    ]);
    setPrompts(prev => prev.filter(p => p.id !== promptToDelete.id));
    setPromptToDelete(null);
    toast.success(t.deleted);
  };

  const restoreCategory = (category: DeletedCategory) => {
    const promptsToRestore = deletedPrompts.filter(prompt => prompt.originalCategory.id === category.id);
    const restoredPrompts: Prompt[] = promptsToRestore.map(({ deletedAt, originalCategory, ...prompt }) => ({
      ...prompt,
      category: category.id,
    }));

    setCategories(prev => insertCategoryBeforeRecycleBin(prev, {
      id: category.id,
      name: category.name,
      icon: category.icon,
      color: category.color,
    }));
    setDeletedCategories(prev => prev.filter(item => item.id !== category.id));
    setDeletedPrompts(prev => prev.filter(prompt => prompt.originalCategory.id !== category.id));
    setPrompts(prev => [...prev, ...restoredPrompts]);
    toast.success(t.categoryRestored);
  };

  const restorePrompt = (deletedPrompt: DeletedPrompt) => {
    const targetCategory = categories.find(category => category.id === deletedPrompt.originalCategory.id);

    if (!targetCategory && deletedPrompt.originalCategory.id !== 'other') {
      setCategories(prev => insertCategoryBeforeRecycleBin(prev, deletedPrompt.originalCategory));
      setDeletedCategories(prev => prev.filter(category => category.id !== deletedPrompt.originalCategory.id));
    }

    setDeletedPrompts(prev => prev.filter(prompt => prompt.id !== deletedPrompt.id));
    const { deletedAt, originalCategory, ...restoredPrompt } = deletedPrompt;
    setPrompts(prev => [
      ...prev,
      {
        ...restoredPrompt,
        category: deletedPrompt.originalCategory.id,
      },
    ]);
    toast.success(t.restored);
  };

  const permanentlyDeleteCategory = () => {
    if (!deletedCategoryToPurge) return;

    setDeletedCategories(prev => prev.filter(category => category.id !== deletedCategoryToPurge.id));
    setDeletedPrompts(prev => prev.filter(prompt => prompt.originalCategory.id !== deletedCategoryToPurge.id));
    setDeletedCategoryToPurge(null);
    toast.success(t.deleted);
  };

  const permanentlyDeletePrompt = () => {
    if (!deletedPromptToPurge) return;

    setDeletedPrompts(prev => prev.filter(prompt => prompt.id !== deletedPromptToPurge.id));
    setDeletedPromptToPurge(null);
    toast.success(t.deleted);
  };

  const resetEditor = () => {
    setEditingPrompt(null);
    setEditorTitle('');
    setEditorContent('');
    setEditorCategory('ai-writing');
  };

  const openEditor = (prompt?: Prompt) => {
    if (prompt?.isDefault) {
      setBuiltInPromptNotice(prompt);
      return;
    }

    if (prompt) {
      setEditingPrompt(prompt);
      setEditorTitle(prompt.title);
      setEditorContent(prompt.content);
      setEditorCategory(prompt.category);
    } else {
      resetEditor();
    }
    setIsEditorOpen(true);
  };

  const openPromptViewer = (prompt: Prompt) => {
    setViewingPrompt(prompt);
  };

  const openPromptEditorFromViewer = (prompt: Prompt) => {
    setViewingPrompt(null);
    openEditor(prompt);
  };

  const movePrompt = (sourceId: string, targetId: string, position: 'before' | 'after' = 'before') => {
    if (sourceId === targetId) return;

    setPrompts(prev => {
      const sourceIndex = prev.findIndex(prompt => prompt.id === sourceId);
      const targetIndex = prev.findIndex(prompt => prompt.id === targetId);

      if (sourceIndex === -1 || targetIndex === -1) return prev;

      const next = [...prev];
      const [moved] = next.splice(sourceIndex, 1);
      const adjustedTargetIndex = sourceIndex < targetIndex ? targetIndex - 1 : targetIndex;
      const insertIndex = position === 'after' ? adjustedTargetIndex + 1 : adjustedTargetIndex;
      next.splice(insertIndex, 0, moved);
      return next;
    });
  };

  const updatePromptDropTargetFromPoint = (
    clientX: number,
    clientY: number,
    sourcePromptId: string,
  ) => {
    const targetElement = document
      .elementFromPoint(clientX, clientY)
      ?.closest('[data-prompt-dnd-id]') as HTMLDivElement | null;
    const targetPromptId = targetElement?.dataset.promptDndId ?? null;

    if (!targetPromptId || targetPromptId === sourcePromptId) {
      dragOverPromptIdRef.current = null;
      dragOverPromptPositionRef.current = null;
      setDragOverPromptId(null);
      setDragOverPromptPosition(null);
      return;
    }

    const rect = targetElement.getBoundingClientRect();
    const position: 'before' | 'after' = viewMode === 'grid'
      ? (clientX >= rect.left + rect.width / 2 ? 'after' : 'before')
      : (clientY >= rect.top + rect.height / 2 ? 'after' : 'before');

    dragOverPromptIdRef.current = targetPromptId;
    dragOverPromptPositionRef.current = position;
    setDragOverPromptId(targetPromptId);
    setDragOverPromptPosition(position);
  };

  const updateCategoryDropTargetFromPoint = (
    clientX: number,
    clientY: number,
    sourceCategoryId: string,
  ) => {
    const targetElement = document
      .elementFromPoint(clientX, clientY)
      ?.closest('[data-category-dnd-id]') as HTMLDivElement | null;
    const targetCategoryId = targetElement?.dataset.categoryDndId ?? null;

    if (!targetCategoryId || targetCategoryId === sourceCategoryId) {
      dragOverCategoryIdRef.current = null;
      dragOverCategoryPositionRef.current = null;
      setDragOverCategoryId(null);
      setDragOverCategoryPosition(null);
      return;
    }

    const rect = targetElement.getBoundingClientRect();
    const position: 'before' | 'after' = clientY >= rect.top + rect.height / 2 ? 'after' : 'before';

    dragOverCategoryIdRef.current = targetCategoryId;
    dragOverCategoryPositionRef.current = position;
    setDragOverCategoryId(targetCategoryId);
    setDragOverCategoryPosition(position);
  };

  const startCategoryPointerDrag = (categoryId: string) => {
    draggedCategoryIdRef.current = categoryId;
    dragOverCategoryIdRef.current = null;
    dragOverCategoryPositionRef.current = null;
    setDraggedCategoryId(categoryId);
    setDragOverCategoryId(null);
    setDragOverCategoryPosition(null);
    setDragMode('category');
  };

  const startPromptPointerDrag = (promptId: string) => {
    draggedPromptIdRef.current = promptId;
    dragOverPromptIdRef.current = null;
    dragOverPromptPositionRef.current = null;
    setDraggedPromptId(promptId);
    setDragOverPromptId(null);
    setDragOverPromptPosition(null);
    setDragMode('prompt');
  };

  useEffect(() => {
    if (!dragMode) return;

    const onPointerMove = (event: PointerEvent) => {
      if (dragMode === 'category') {
        const sourceCategoryId = draggedCategoryIdRef.current;
        if (!sourceCategoryId) return;
        autoScrollCategoryArea(event.clientY);
        updateCategoryDropTargetFromPoint(event.clientX, event.clientY, sourceCategoryId);
        return;
      }

      const sourcePromptId = draggedPromptIdRef.current;
      if (!sourcePromptId) return;
      autoScrollPromptArea(event.clientY);
      updatePromptDropTargetFromPoint(event.clientX, event.clientY, sourcePromptId);
    };

    const onPointerUp = (event: PointerEvent) => {
      if (dragMode === 'category') {
        const sourceCategoryId = draggedCategoryIdRef.current;
        let targetCategoryId = dragOverCategoryIdRef.current;
        if (!targetCategoryId) {
          const targetElement = document
            .elementFromPoint(event.clientX, event.clientY)
            ?.closest('[data-category-dnd-id]') as HTMLElement | null;
          targetCategoryId = targetElement?.dataset.categoryDndId ?? null;
        }
        if (
          sourceCategoryId &&
          targetCategoryId &&
          sourceCategoryId !== targetCategoryId
        ) {
          moveCategory(
            sourceCategoryId,
            targetCategoryId,
            dragOverCategoryPositionRef.current || 'before',
          );
        }
        draggedCategoryIdRef.current = null;
        dragOverCategoryIdRef.current = null;
        dragOverCategoryPositionRef.current = null;
        setDraggedCategoryId(null);
        setDragOverCategoryId(null);
        setDragOverCategoryPosition(null);
        setDragMode(null);
        return;
      }

      const sourcePromptId = draggedPromptIdRef.current;
      let targetPromptId = dragOverPromptIdRef.current;
      if (!targetPromptId) {
        const targetElement = document
          .elementFromPoint(event.clientX, event.clientY)
          ?.closest('[data-prompt-dnd-id]') as HTMLElement | null;
        targetPromptId = targetElement?.dataset.promptDndId ?? null;
      }
      if (
        sourcePromptId &&
        targetPromptId &&
        sourcePromptId !== targetPromptId
      ) {
        movePrompt(
          sourcePromptId,
          targetPromptId,
          dragOverPromptPositionRef.current || 'before',
        );
      }
      draggedPromptIdRef.current = null;
      dragOverPromptIdRef.current = null;
      dragOverPromptPositionRef.current = null;
      setDraggedPromptId(null);
      setDragOverPromptId(null);
      setDragOverPromptPosition(null);
      setDragMode(null);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, [dragMode, viewMode]);

  const autoScrollPromptArea = (clientY: number) => {
    const viewport = promptScrollAreaRef.current?.querySelector('[data-slot="scroll-area-viewport"]') as HTMLDivElement | null;
    if (!viewport) return;

    const rect = viewport.getBoundingClientRect();
    const edgeThreshold = 72;
    const scrollStep = 18;

    if (clientY < rect.top + edgeThreshold) {
      viewport.scrollTop -= scrollStep;
    } else if (clientY > rect.bottom - edgeThreshold) {
      viewport.scrollTop += scrollStep;
    }
  };

  const autoScrollCategoryArea = (clientY: number) => {
    const viewport = categoryScrollAreaRef.current?.querySelector('[data-slot="scroll-area-viewport"]') as HTMLDivElement | null;
    if (!viewport) return;

    const rect = viewport.getBoundingClientRect();
    const edgeThreshold = 56;
    const scrollStep = 14;

    if (clientY < rect.top + edgeThreshold) {
      viewport.scrollTop -= scrollStep;
    } else if (clientY > rect.bottom - edgeThreshold) {
      viewport.scrollTop += scrollStep;
    }
  };

  const filteredDeletedCategories = useMemo(() => {
    return deletedCategories.filter(category =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [deletedCategories, searchQuery]);

  const filteredDeletedPrompts = useMemo(() => {
    return deletedPrompts.filter(prompt =>
      prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [deletedPrompts, searchQuery]);

  const isRecycleBinView = activeCategory === 'other';

  const filteredPrompts = useMemo(() => {
    if (isRecycleBinView) return [];

    return localizedPrompts.filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           p.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [localizedPrompts, searchQuery, activeCategory, isRecycleBinView]);

  const openRepo = async () => {
    const repoUrl = 'https://github.com/llm-chaser/OurPrompt-A-Prompt-Management-Tool-for-Researchers';
    try {
      const internalInvoke = (window as any).__TAURI_INTERNALS__?.invoke;
      const coreInvoke = (window as any).__TAURI__?.core?.invoke;
      const invoke = internalInvoke || coreInvoke;

      if (invoke) {
        await invoke('open_external_url', { url: repoUrl });
        return;
      }
    } catch {
      // Fallback below.
    }

    window.open(repoUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={`flex flex-col h-screen font-sans overflow-hidden ${theme === 'dark' ? 'bg-[#0F1115] text-[#EDEDED]' : 'bg-[#F9F9F9] text-[#1A1A1A]'}`}>
      <Toaster position="top-right" />
      
      {/* Desktop Title Bar (Simulated) */}
      <div data-tauri-drag-region className={`h-8 border-b flex items-center justify-between px-4 select-none drag-region ${theme === 'dark' ? 'bg-[#141821] border-[#2A3040]' : 'bg-white border-[#E5E5E5]'}`}>
        <div className="flex items-center gap-2">
          {/* Spacer for native macOS traffic lights */}
          <div className="w-14" />
          <span className={`text-[11px] font-medium ${theme === 'dark' ? 'text-[#C8D0E5]' : 'text-[#666]'}`}>OurPrompt</span>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className={`h-4 text-[9px] px-1.5 font-bold uppercase ${theme === 'dark' ? 'border-[#36405A] text-[#90A0C8]' : 'border-[#E5E5E5] text-[#A1A1A1]'}`}>v1.0.0 Stable</Badge>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Sidebar */}
        <aside className={`w-64 flex-shrink-0 border-r flex flex-col min-h-0 ${theme === 'dark' ? 'border-[#2A3040] bg-[#11151E]' : 'border-[#E5E5E5] bg-white'}`}>
          <div className="p-6 flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm ${theme === 'dark' ? 'bg-[#0A0E18]' : 'bg-[#1A1A1A]'}`}>
              <Command className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-bold tracking-tight">{t.appName}</h1>
          </div>

          <ScrollArea ref={categoryScrollAreaRef} className="flex-1 min-h-0 px-3">
            <div className="space-y-6 py-2">
              <div className="space-y-1">
                <div className="flex items-center justify-between px-3 mb-2">
                  <h2 className={`text-[10px] font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-[#7E8AA6]' : 'text-[#A1A1A1]'}`}>{t.categoryLibrary}</h2>
                  <button onClick={addCategory} className={`transition-colors ${theme === 'dark' ? 'text-[#7E8AA6] hover:text-[#D8E0F8]' : 'text-[#A1A1A1] hover:text-[#1A1A1A]'}`}>
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                {categories.map((cat) => {
                  const Icon = iconByName[cat.icon] || categoryIcons[cat.id as keyof typeof categoryIcons] || Library;
                  const canManageCategory = cat.id !== 'other';
                  const categoryLabel = getCategoryDisplayName(cat);
                  return (
                    <div
                      key={cat.id}
                      data-category-dnd-id={cat.id}
                      className={`relative group w-full rounded-md transition-transform duration-150 ease-out ${
                        draggedCategoryId === cat.id ? 'scale-[0.985] opacity-75' : ''
                      }`}
                    >
                      {dragOverCategoryId === cat.id && dragOverCategoryPosition && (
                        <div className={`pointer-events-none absolute ${dragOverCategoryPosition === 'before' ? '-top-2' : '-bottom-2'} left-0 right-0 z-20 flex items-center gap-2 px-1`}>
                          <div className="h-2.5 w-2.5 rounded-full bg-[#1A1A1A]" />
                          <div className="h-0.5 flex-1 rounded-full bg-[#1A1A1A]" />
                        </div>
                      )}
                      <button
                        onClick={() => setActiveCategory(cat.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                          activeCategory === cat.id
                            ? (theme === 'dark' ? 'bg-[#20283A] text-[#EDF2FF]' : 'bg-[#F0F0F0] text-[#1A1A1A]')
                            : (theme === 'dark' ? 'text-[#B8C2DA] hover:bg-[#1A2232]' : 'text-[#666] hover:bg-[#F5F5F5]')
                        } ${
                          dragOverCategoryId === cat.id ? 'ring-1 ring-[#DADADA]' : ''
                        } ${
                          draggedCategoryId === cat.id ? 'shadow-lg shadow-black/10 cursor-grabbing' : ''
                        }`}
                      >
                        <span
                          className="flex items-center"
                          onPointerDown={(e) => {
                            e.preventDefault();
                            startCategoryPointerDrag(cat.id);
                          }}
                        >
                          <GripVertical className={`w-3.5 h-3.5 text-[#B0B0B0] ${draggedCategoryId === cat.id ? 'cursor-grabbing' : 'cursor-grab'}`} />
                        </span>
                        <Icon className="w-4 h-4" /> {categoryLabel}
                      </button>
                      {canManageCategory && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <button
                            onClick={(e) => requestRenameCategory(cat, e)}
                            className={`p-1 transition-all ${theme === 'dark' ? 'text-[#9AA7C8] hover:text-[#EDF2FF]' : 'text-[#A1A1A1] hover:text-[#1A1A1A]'}`}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => requestDeleteCategory(cat, e)}
                            className="p-1 text-[#A1A1A1] hover:text-red-500 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
                <button
                  onClick={() => setActiveCategory('all')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    activeCategory === 'all'
                      ? (theme === 'dark' ? 'bg-[#20283A] text-[#EDF2FF]' : 'bg-[#F0F0F0] text-[#1A1A1A]')
                      : (theme === 'dark' ? 'text-[#B8C2DA] hover:bg-[#1A2232]' : 'text-[#666] hover:bg-[#F5F5F5]')
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" /> {t.allPrompts}
                </button>
              </div>

              <div className="space-y-1">
                <h2 className={`px-3 text-[10px] font-bold uppercase tracking-widest mb-2 ${theme === 'dark' ? 'text-[#7E8AA6]' : 'text-[#A1A1A1]'}`}>{t.system}</h2>
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium ${theme === 'dark' ? 'text-[#B8C2DA] hover:bg-[#1A2232]' : 'text-[#666] hover:bg-[#F5F5F5]'}`}
                >
                  <Settings className="w-4 h-4" /> {t.settings}
                </button>
                <button
                  type="button"
                  onClick={openRepo}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium ${theme === 'dark' ? 'text-[#B8C2DA] hover:bg-[#1A2232]' : 'text-[#666] hover:bg-[#F5F5F5]'}`}
                >
                  <Github className="w-4 h-4" /> {t.githubOpenSource}
                </button>
              </div>
            </div>
          </ScrollArea>

          <div className={`p-4 border-t ${theme === 'dark' ? 'border-[#2A3040]' : 'border-[#E5E5E5]'}`}>
            <Button 
              onClick={() => openEditor()} 
              className={`w-full text-white rounded-lg h-10 shadow-sm ${theme === 'dark' ? 'bg-[#0A0E18] hover:bg-[#151D2F]' : 'bg-[#1A1A1A] hover:bg-[#333]'}`}
            >
              <Plus className="w-4 h-4 mr-2" /> {t.newPrompt}
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className={`flex-1 flex flex-col min-w-0 min-h-0 ${theme === 'dark' ? 'bg-[#0F1115]' : 'bg-[#F9F9F9]'}`}>
          {/* Top Bar */}
          <header className={`h-16 border-b flex items-center justify-between px-8 flex-shrink-0 ${theme === 'dark' ? 'border-[#2A3040] bg-[#141821]' : 'border-[#E5E5E5] bg-white'}`}>
            <div className="flex items-center gap-4 flex-1 max-w-xl">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1A1]" />
                <Input 
                  placeholder={t.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`pl-10 h-9 border-none focus-visible:ring-1 focus-visible:ring-[#1A1A1A] ${
                    theme === 'dark' ? 'bg-[#1A2232] text-[#E6ECFF] placeholder:text-[#8C98B7]' : 'bg-[#F5F5F5]'
                  }`}
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2 ml-4">
              <div className={`flex items-center rounded-md p-1 ${theme === 'dark' ? 'bg-[#1A2232]' : 'bg-[#F0F0F0]'}`}>
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded ${viewMode === 'grid' ? (theme === 'dark' ? 'bg-[#0A0E18] shadow-sm' : 'bg-white shadow-sm') : (theme === 'dark' ? 'text-[#AEB9D4]' : 'text-[#666]')}`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded ${viewMode === 'list' ? (theme === 'dark' ? 'bg-[#0A0E18] shadow-sm' : 'bg-white shadow-sm') : (theme === 'dark' ? 'text-[#AEB9D4]' : 'text-[#666]')}`}
                >
                  <ListIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </header>

          {/* Grid/List Area */}
          <ScrollArea ref={promptScrollAreaRef} className="flex-1 min-h-0">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">
                    {activeCategory === 'all'
                      ? t.allPrompts
                      : activeCategory === 'other'
                        ? t.recycleBin
                        : getCategoryDisplayNameById(activeCategory)}
                  </h2>
                  <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-[#B7C0D8]' : 'text-[#666]'}`}>
                    {isRecycleBinView
                      ? t.totalTemplates(filteredDeletedCategories.length + filteredDeletedPrompts.length)
                      : t.totalTemplates(filteredPrompts.length)}
                  </p>
                </div>
                <button
                  onClick={() => setIsPrinciplesOpen(true)}
                  className="group flex items-center gap-3 rounded-2xl border border-[#E8DFC7] bg-[linear-gradient(135deg,_#FFFDF7_0%,_#F5EFE1_100%)] px-4 py-3 text-left shadow-[0_1px_0_rgba(26,26,26,0.03)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(26,26,26,0.08)]"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#8A6A2F] shadow-sm">
                    <Info className="h-4 w-4" />
                  </div>
                  <div className="leading-tight">
                    <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#9B8A62]">
                      Prompt
                    </div>
                    <div className="mt-1 text-sm font-bold text-[#1A1A1A] group-hover:text-[#6F5A22]">
                      {t.promptPrinciples}
                    </div>
                  </div>
                </button>
              </div>

              {isRecycleBinView ? (
                <div className="space-y-8">
                  <section className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold uppercase tracking-widest text-[#A1A1A1]">{t.deletedCategoriesTitle}</h3>
                    </div>
                    {filteredDeletedCategories.length > 0 ? (
                      <div className="space-y-3">
                        {filteredDeletedCategories.map((category) => (
                          <div key={category.id} className="flex items-center justify-between rounded-lg border border-[#E5E5E5] bg-white p-4">
                            <div className="flex items-center gap-3">
                              <div className={`h-2.5 w-2.5 rounded-full ${category.color}`} />
                              <div>
                                <p className="text-sm font-bold">{getCategoryDisplayName(category)}</p>
                                <p className="text-xs text-[#666]">{t.deletedAt}: {new Date(category.deletedAt).toLocaleString()}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" onClick={() => restoreCategory(category)}>
                                {t.restore}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setDeletedCategoryToPurge(category)}
                                className="border-red-200 text-red-500 hover:border-red-300 hover:text-red-600"
                              >
                                {t.deletePromptAction}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-lg border border-dashed border-[#E5E5E5] bg-white px-4 py-6 text-sm text-[#666]">
                        {t.recycleBinHint}
                      </div>
                    )}
                  </section>

                  <section className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold uppercase tracking-widest text-[#A1A1A1]">{t.deletedPromptsTitle}</h3>
                    </div>
                    {filteredDeletedPrompts.length > 0 ? (
                      <div className="space-y-3">
                        {filteredDeletedPrompts.map((prompt) => (
                          <div key={prompt.id} className="flex items-center justify-between rounded-lg border border-[#E5E5E5] bg-white p-4">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-bold">{prompt.title}</p>
                              <p className="mt-1 text-xs text-[#666]">
                                {prompt.originalCategory.id === 'other' ? t.recycleBin : prompt.originalCategory.name}
                              </p>
                              <p className="mt-1 text-xs text-[#666]">{t.deletedAt}: {new Date(prompt.deletedAt).toLocaleString()}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" onClick={() => restorePrompt(prompt)}>
                                {t.restore}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setDeletedPromptToPurge(prompt)}
                                className="border-red-200 text-red-500 hover:border-red-300 hover:text-red-600"
                              >
                                {t.deletePromptAction}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-lg border border-dashed border-[#E5E5E5] bg-white px-4 py-6 text-sm text-[#666]">
                        {t.recycleBinHint}
                      </div>
                    )}
                  </section>
                </div>
              ) : (
                <div
                  className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" : "space-y-3"}
                >
                  <AnimatePresence mode="popLayout">
                    {filteredPrompts.map((prompt) => {
                    return (
                    <motion.div
                      key={prompt.id}
                      data-prompt-dnd-id={prompt.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className={`relative transition-transform duration-150 ease-out ${draggedPromptId === prompt.id ? 'scale-[0.985] opacity-75' : ''}`}
                    >
                      {dragOverPromptId === prompt.id && dragOverPromptPosition && (
                        <>
                          {viewMode === 'grid' ? (
                            <div
                              className={`pointer-events-none absolute ${dragOverPromptPosition === 'before' ? '-left-2' : '-right-2'} top-3 bottom-3 z-20 flex flex-col items-center`}
                            >
                              <div className="h-2.5 w-2.5 rounded-full bg-[#1A1A1A]" />
                              <div className="w-0.5 flex-1 rounded-full bg-[#1A1A1A]" />
                              <div className="h-2.5 w-2.5 rounded-full bg-[#1A1A1A]" />
                            </div>
                          ) : (
                            <div
                              className={`pointer-events-none absolute ${dragOverPromptPosition === 'before' ? '-top-3' : '-bottom-3'} left-0 right-0 z-20 flex items-center gap-2 px-1`}
                            >
                              <div className="h-2.5 w-2.5 rounded-full bg-[#1A1A1A]" />
                              <div className="h-0.5 flex-1 rounded-full bg-[#1A1A1A]" />
                            </div>
                          )}
                        </>
                      )}
                      {viewMode === 'grid' ? (
                        <Card
                          onDoubleClick={() => openPromptViewer(prompt)}
                          className={`group transition-all shadow-none h-64 flex flex-col overflow-hidden ${
                            theme === 'dark'
                              ? 'border-[#2A3040] hover:border-[#9FB0D8] bg-[#141A27]'
                              : 'border-[#E5E5E5] hover:border-[#1A1A1A] bg-white'
                          } ${dragOverPromptId === prompt.id ? 'ring-2 ring-[#DADADA]' : ''} ${draggedPromptId === prompt.id ? 'shadow-xl shadow-black/10 cursor-grabbing' : ''} ${draggedPromptId !== prompt.id ? 'cursor-pointer' : ''}`}
                        >
                          <CardHeader className="p-5 pb-2">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  className="flex items-center"
                                  onPointerDown={(e) => {
                                    e.preventDefault();
                                    startPromptPointerDrag(prompt.id);
                                  }}
                                >
                                  <GripVertical className={`w-3.5 h-3.5 text-[#B0B0B0] ${draggedPromptId === prompt.id ? 'cursor-grabbing' : 'cursor-grab'}`} />
                                </button>
                                <div className={`w-2 h-2 rounded-full ${categories.find(c => c.id === prompt.category)?.color}`} />
                                <span className="text-[10px] font-bold text-[#A1A1A1] uppercase tracking-widest">
                                  {getCategoryDisplayNameById(prompt.category)}
                                </span>
                              </div>
                              {prompt.isDefault && (
                                <Badge variant="secondary" className="bg-[#F0F0F0] text-[#666] text-[9px] px-1.5 py-0 h-4 font-bold uppercase">{t.builtin}</Badge>
                              )}
                              {!prompt.isDefault && (
                                <Badge variant="secondary" className="bg-[#F6F6F6] text-[#666] text-[9px] px-1.5 py-0 h-4 font-bold uppercase">{t.custom}</Badge>
                              )}
                            </div>
                            <CardTitle className={`text-base font-bold mt-2 line-clamp-1 ${theme === 'dark' ? 'text-[#EAF0FF]' : ''}`}>{prompt.title}</CardTitle>
                          </CardHeader>
                          <CardContent className="px-5 py-2 flex-1 overflow-hidden">
                            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#B0B0B0]">
                              {t.doubleClickHint}
                            </p>
                            <p className={`text-sm line-clamp-4 leading-relaxed font-mono text-[13px] ${theme === 'dark' ? 'text-[#BFC9E4]' : 'text-[#666]'}`}>
                              {prompt.content}
                            </p>
                          </CardContent>
                          <CardFooter className={`px-5 py-4 border-t flex justify-between items-center opacity-100 ${
                            theme === 'dark' ? 'bg-[#101523] border-[#2A3040]' : 'bg-[#FAFAFA] border-[#E5E5E5]'
                          }`}>
                            <div className="flex gap-1">
                              <span title={prompt.isDefault ? t.builtInPromptTooltip : undefined}>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openEditor(prompt)}
                                  disabled={prompt.isDefault}
                                  className={`h-8 w-8 hover:bg-white ${prompt.isDefault ? 'cursor-not-allowed text-[#BDBDBD] opacity-50 hover:bg-transparent' : ''}`}
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </Button>
                              </span>
                              <Button variant="ghost" size="icon" onClick={() => requestDeletePrompt(prompt)} className={`h-8 w-8 text-red-500 hover:text-red-600 ${theme === 'dark' ? 'hover:bg-[#1D2538]' : 'hover:bg-white'}`}>
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className={`h-8 text-[11px] font-bold ${theme === 'dark' ? 'border-[#36405A] bg-[#1B2436] text-[#E6ECFF]' : 'border-[#E5E5E5] bg-white'}`}
                                onClick={() => {
                                  navigator.clipboard.writeText(prompt.content);
                                  toast.success(t.copied);
                                }}
                              >
                                {t.copy}
                              </Button>
                            </div>
                          </CardFooter>
                        </Card>
                      ) : (
                        <div
                          onDoubleClick={() => openPromptViewer(prompt)}
                          className={`group flex items-center justify-between p-4 border rounded-lg transition-all ${
                            theme === 'dark'
                              ? 'bg-[#141A27] border-[#2A3040] hover:border-[#9FB0D8]'
                              : 'bg-white border-[#E5E5E5] hover:border-[#1A1A1A]'
                          } ${dragOverPromptId === prompt.id ? 'ring-2 ring-[#DADADA]' : ''} ${draggedPromptId === prompt.id ? 'shadow-xl shadow-black/10 cursor-grabbing' : ''} ${draggedPromptId !== prompt.id ? 'cursor-pointer' : ''}`}
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            <button
                              type="button"
                              className="flex items-center flex-shrink-0"
                              onPointerDown={(e) => {
                                e.preventDefault();
                                startPromptPointerDrag(prompt.id);
                              }}
                            >
                              <GripVertical className={`w-3.5 h-3.5 text-[#B0B0B0] ${draggedPromptId === prompt.id ? 'cursor-grabbing' : 'cursor-grab'}`} />
                            </button>
                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${categories.find(c => c.id === prompt.category)?.color}`} />
                            <div className="min-w-0">
                              <h3 className={`text-sm font-bold truncate ${theme === 'dark' ? 'text-[#EAF0FF]' : ''}`}>{prompt.title}</h3>
                              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#B0B0B0] mt-1">{t.doubleClickHint}</p>
                              <p className={`text-xs truncate mt-0.5 ${theme === 'dark' ? 'text-[#BFC9E4]' : 'text-[#666]'}`}>{prompt.content}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                            <Button
                              variant="outline"
                              size="sm"
                              className={`h-8 text-[11px] font-bold ${theme === 'dark' ? 'border-[#36405A] bg-[#1B2436] text-[#E6ECFF]' : 'border-[#E5E5E5] bg-white'}`}
                              onClick={() => {
                                navigator.clipboard.writeText(prompt.content);
                                toast.success(t.copied);
                              }}
                            >
                              {t.copy}
                            </Button>
                            <span title={prompt.isDefault ? t.builtInPromptTooltip : undefined}>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditor(prompt)}
                                disabled={prompt.isDefault}
                                className={`h-8 w-8 ${prompt.isDefault ? 'cursor-not-allowed text-[#BDBDBD] opacity-50 hover:bg-transparent' : ''}`}
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </Button>
                            </span>
                            <Button variant="ghost" size="icon" onClick={() => requestDeletePrompt(prompt)} className="h-8 w-8 text-red-500 hover:text-red-600">
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                    );
                    })}
                  </AnimatePresence>
                </div>
              )}

              {!isRecycleBinView && filteredPrompts.length === 0 && (
                <div className="flex flex-col items-center justify-center py-32 text-center">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${theme === 'dark' ? 'bg-[#1A2232]' : 'bg-[#F0F0F0]'}`}>
                    <Search className="w-6 h-6 text-[#A1A1A1]" />
                  </div>
                  <h3 className="text-lg font-bold">{t.noPromptFound}</h3>
                  <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-[#B7C0D8]' : 'text-[#666]'}`}>{t.noPromptHint}</p>
                </div>
              )}

              {isRecycleBinView && filteredDeletedCategories.length === 0 && filteredDeletedPrompts.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${theme === 'dark' ? 'bg-[#1A2232]' : 'bg-[#F0F0F0]'}`}>
                    <Trash2 className="w-6 h-6 text-[#A1A1A1]" />
                  </div>
                  <h3 className="text-lg font-bold">{t.recycleBinEmpty}</h3>
                  <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-[#B7C0D8]' : 'text-[#666]'}`}>{t.recycleBinHint}</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </main>
      </div>

      <Dialog
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
      >
        <DialogContent className={`sm:max-w-[420px] p-0 overflow-hidden border-none shadow-2xl rounded-xl ${theme === 'dark' ? 'bg-[#141A27] text-[#EAF0FF]' : ''}`}>
          <div className="p-6">
            <DialogHeader className="mb-5">
              <DialogTitle className="text-xl font-bold tracking-tight">{t.languageSettings}</DialogTitle>
              <DialogDescription className={theme === 'dark' ? 'text-[#B7C0D8]' : ''}>{t.languageSettingsDesc}</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={language === 'zh' ? 'default' : 'outline'}
                onClick={() => setLanguage('zh')}
                className={language === 'zh' ? 'bg-[#1A1A1A] hover:bg-[#333] text-white' : ''}
              >
                {t.chinese}
              </Button>
              <Button
                variant={language === 'en' ? 'default' : 'outline'}
                onClick={() => setLanguage('en')}
                className={language === 'en' ? 'bg-[#1A1A1A] hover:bg-[#333] text-white' : ''}
              >
                {t.english}
              </Button>
            </div>
          </div>
          <DialogFooter className={theme === 'dark' ? 'border-[#2A3040] bg-[#101523]' : 'border-[#E5E5E5] bg-[#FAFAFA]'}>
            <Button variant="ghost" onClick={() => setIsSettingsOpen(false)} className="font-bold text-xs">
              {t.cancel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isPrinciplesOpen}
        onOpenChange={setIsPrinciplesOpen}
      >
        <DialogContent className="sm:max-w-[680px] p-0 overflow-hidden border-none shadow-2xl rounded-[24px] bg-[#FBFBF8]">
          <div className="border-b border-[#EAE7DE] bg-[radial-gradient(circle_at_top_left,_rgba(250,204,21,0.16),_transparent_32%),linear-gradient(135deg,_#FCFBF7_0%,_#F4F1E8_100%)] px-6 py-6">
            <DialogHeader className="mb-0">
              <div className="mb-3 inline-flex w-fit items-center rounded-full border border-[#E8DFC7] bg-white/80 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-[#8A6A2F]">
                Prompt Framework
              </div>
              <DialogTitle className="text-xl font-bold tracking-tight text-[#1A1A1A]">
                {t.promptPrinciples}
              </DialogTitle>
              <DialogDescription className="mt-2 max-w-2xl text-[14px] leading-6 text-[#5F5A4F]">
                {t.promptPrinciplesDesc}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="px-6 py-5">
            <div className="grid gap-3 md:grid-cols-2">
              {[
                { label: '01', title: t.principleTask, desc: t.principleTaskDesc, accent: 'bg-[#F7E7BE] text-[#8A6A2F]', icon: Crosshair },
                { label: '02', title: t.principleContext, desc: t.principleContextDesc, accent: 'bg-[#DDECD9] text-[#44624A]', icon: FileStack },
                { label: '03', title: t.principleReference, desc: t.principleReferenceDesc, accent: 'bg-[#DCE8F8] text-[#3F5F8C]', icon: BookMarked },
                { label: '04', title: t.principleEvaluate, desc: t.principleEvaluateDesc, accent: 'bg-[#F6DDD7] text-[#9A5446]', icon: BadgeCheck },
                { label: '05', title: t.principleIterate, desc: t.principleIterateDesc, accent: 'bg-[#E8DFF6] text-[#6B56A5]', icon: RefreshCcw },
              ].map((item) => (
                <div
                  key={item.label}
                  className="group rounded-[18px] border border-[#EAE7DE] bg-white/90 p-4 shadow-[0_1px_0_rgba(26,26,26,0.03)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(26,26,26,0.06)]"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold ${item.accent}`}>
                        {item.label}
                      </div>
                      <div className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${item.accent}`}>
                        <item.icon className="h-3.5 w-3.5" />
                      </div>
                    </div>
                    <div className="h-px flex-1 bg-[#F1EEE6] ml-3" />
                  </div>
                  <h3 className="text-[15px] font-bold text-[#1A1A1A]">{item.title}</h3>
                  <p className="mt-2 whitespace-pre-line text-[13px] leading-6 text-[#5F5A4F]">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-[18px] border border-dashed border-[#E1D9C8] bg-[#F8F4EA] px-4 py-3 text-[13px] leading-6 text-[#6C6558]">
              {t.principleSummary}
            </div>
          </div>

          <DialogFooter className="border-[#E5E5E5] bg-[#FAFAFA]">
            <Button variant="ghost" onClick={() => setIsPrinciplesOpen(false)} className="font-bold text-xs">
              {t.cancel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isCategoryDialogOpen}
        onOpenChange={(open) => {
          setIsCategoryDialogOpen(open);
          if (!open) {
            setNewCategoryName('');
            setNewCategoryIcon('Library');
            setNewCategoryColor('bg-blue-500');
          }
        }}
      >
        <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden border-none shadow-2xl rounded-xl">
          <div className="p-6">
            <DialogHeader className="mb-5">
              <DialogTitle className="text-xl font-bold tracking-tight">{t.createCategory}</DialogTitle>
              <DialogDescription>{t.createCategoryDesc}</DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#666] uppercase tracking-wider">{t.categoryName}</label>
              <Input
                autoFocus
                placeholder={t.categoryNamePlaceholder}
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    submitCategory();
                  }
                }}
                className="h-11 bg-[#F5F5F5] border-none focus-visible:ring-1 focus-visible:ring-[#1A1A1A]"
              />
            </div>
            <div className="mt-4 space-y-2">
              <label className="text-xs font-bold text-[#666] uppercase tracking-wider">{t.categoryIcon}</label>
              <div className="grid grid-cols-7 gap-2">
                {categoryIconOptions.map(option => {
                  const Icon = option.icon;
                  const isActive = newCategoryIcon === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setNewCategoryIcon(option.value)}
                      className={`h-10 w-10 rounded-lg border transition-all flex items-center justify-center ${
                        isActive ? 'border-[#1A1A1A] bg-[#F3F3F3]' : 'border-[#E5E5E5] hover:border-[#CFCFCF]'
                      }`}
                      title={option.value}
                    >
                      <Icon className="w-4 h-4 text-[#1A1A1A]" />
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <label className="text-xs font-bold text-[#666] uppercase tracking-wider">{t.categoryColor}</label>
              <div className="grid grid-cols-8 gap-2">
                {categoryColorOptions.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewCategoryColor(color)}
                    className={`h-7 w-7 rounded-full ${color} ring-offset-2 transition-all ${
                      newCategoryColor === color ? 'ring-2 ring-[#1A1A1A]' : 'ring-0'
                    }`}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="border-[#E5E5E5] bg-[#FAFAFA]">
            <Button variant="ghost" onClick={() => setIsCategoryDialogOpen(false)} className="font-bold text-xs">
              {t.cancel}
            </Button>
            <Button onClick={submitCategory} className="bg-[#1A1A1A] hover:bg-[#333] text-white font-bold text-xs px-6">
              {t.createCategoryAction}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(categoryToDelete)}
        onOpenChange={(open) => {
          if (!open) {
            setCategoryToDelete(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden border-none shadow-2xl rounded-xl">
          <div className="p-6">
            <DialogHeader className="mb-3">
              <DialogTitle className="text-xl font-bold tracking-tight">{t.deleteCategory}</DialogTitle>
              <DialogDescription>
                {t.deleteCategoryDesc(categoryToDelete ? getCategoryDisplayName(categoryToDelete) : undefined)}
              </DialogDescription>
            </DialogHeader>
          </div>
          <DialogFooter className="border-[#E5E5E5] bg-[#FAFAFA]">
            <Button variant="ghost" onClick={() => setCategoryToDelete(null)} className="font-bold text-xs">
              {t.cancel}
            </Button>
            <Button onClick={confirmDeleteCategory} className="bg-red-500 hover:bg-red-600 text-white font-bold text-xs px-6">
              {t.deleteCategoryAction}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(categoryToRename)}
        onOpenChange={(open) => {
          if (!open) {
            setCategoryToRename(null);
            setRenameCategoryName('');
            setRenameCategoryIcon('Library');
            setRenameCategoryColor('bg-blue-500');
          }
        }}
      >
        <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden border-none shadow-2xl rounded-xl">
          <div className="p-6">
            <DialogHeader className="mb-5">
              <DialogTitle className="text-xl font-bold tracking-tight">{t.renameCategory}</DialogTitle>
              <DialogDescription>{t.renameCategoryDesc(categoryToRename ? getCategoryDisplayName(categoryToRename) : undefined)}</DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#666] uppercase tracking-wider">{t.categoryName}</label>
              <Input
                autoFocus
                placeholder={t.renameCategoryPlaceholder}
                value={renameCategoryName}
                onChange={(e) => setRenameCategoryName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    confirmRenameCategory();
                  }
                }}
                className="h-11 bg-[#F5F5F5] border-none focus-visible:ring-1 focus-visible:ring-[#1A1A1A]"
              />
            </div>
            <div className="mt-4 space-y-2">
              <label className="text-xs font-bold text-[#666] uppercase tracking-wider">{t.categoryIcon}</label>
              <div className="grid grid-cols-7 gap-2">
                {categoryIconOptions.map(option => {
                  const Icon = option.icon;
                  const isActive = renameCategoryIcon === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setRenameCategoryIcon(option.value)}
                      className={`h-10 w-10 rounded-lg border transition-all flex items-center justify-center ${
                        isActive ? 'border-[#1A1A1A] bg-[#F3F3F3]' : 'border-[#E5E5E5] hover:border-[#CFCFCF]'
                      }`}
                      title={option.value}
                    >
                      <Icon className="w-4 h-4 text-[#1A1A1A]" />
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <label className="text-xs font-bold text-[#666] uppercase tracking-wider">{t.categoryColor}</label>
              <div className="grid grid-cols-8 gap-2">
                {categoryColorOptions.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setRenameCategoryColor(color)}
                    className={`h-7 w-7 rounded-full ${color} ring-offset-2 transition-all ${
                      renameCategoryColor === color ? 'ring-2 ring-[#1A1A1A]' : 'ring-0'
                    }`}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="border-[#E5E5E5] bg-[#FAFAFA]">
            <Button
              variant="ghost"
              onClick={() => {
                setCategoryToRename(null);
                setRenameCategoryName('');
                setRenameCategoryIcon('Library');
                setRenameCategoryColor('bg-blue-500');
              }}
              className="font-bold text-xs"
            >
              {t.cancel}
            </Button>
            <Button onClick={confirmRenameCategory} className="bg-[#1A1A1A] hover:bg-[#333] text-white font-bold text-xs px-6">
              {t.renameCategoryAction}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(promptToDelete)}
        onOpenChange={(open) => {
          if (!open) {
            setPromptToDelete(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden border-none shadow-2xl rounded-xl">
          <div className="p-6">
            <DialogHeader className="mb-3">
              <DialogTitle className="text-xl font-bold tracking-tight">{t.deletePrompt}</DialogTitle>
              <DialogDescription>
                {t.deletePromptDesc(promptToDelete?.title)}
              </DialogDescription>
            </DialogHeader>
          </div>
          <DialogFooter className="border-[#E5E5E5] bg-[#FAFAFA]">
            <Button variant="ghost" onClick={() => setPromptToDelete(null)} className="font-bold text-xs">
              {t.cancel}
            </Button>
            <Button onClick={confirmDeletePrompt} className="bg-red-500 hover:bg-red-600 text-white font-bold text-xs px-6">
              {t.deletePromptAction}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(deletedCategoryToPurge)}
        onOpenChange={(open) => {
          if (!open) {
            setDeletedCategoryToPurge(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden border-none shadow-2xl rounded-xl">
          <div className="p-6">
            <DialogHeader className="mb-3">
              <DialogTitle className="text-xl font-bold tracking-tight">{t.permanentlyDelete}</DialogTitle>
              <DialogDescription>
                {t.permanentlyDeleteCategoryDesc(deletedCategoryToPurge?.name)}
              </DialogDescription>
            </DialogHeader>
          </div>
          <DialogFooter className="border-[#E5E5E5] bg-[#FAFAFA]">
            <Button variant="ghost" onClick={() => setDeletedCategoryToPurge(null)} className="font-bold text-xs">
              {t.cancel}
            </Button>
            <Button onClick={permanentlyDeleteCategory} className="bg-red-500 hover:bg-red-600 text-white font-bold text-xs px-6">
              {t.permanentlyDelete}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(deletedPromptToPurge)}
        onOpenChange={(open) => {
          if (!open) {
            setDeletedPromptToPurge(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden border-none shadow-2xl rounded-xl">
          <div className="p-6">
            <DialogHeader className="mb-3">
              <DialogTitle className="text-xl font-bold tracking-tight">{t.permanentlyDelete}</DialogTitle>
              <DialogDescription>
                {t.permanentlyDeletePromptDesc(deletedPromptToPurge?.title)}
              </DialogDescription>
            </DialogHeader>
          </div>
          <DialogFooter className="border-[#E5E5E5] bg-[#FAFAFA]">
            <Button variant="ghost" onClick={() => setDeletedPromptToPurge(null)} className="font-bold text-xs">
              {t.cancel}
            </Button>
            <Button onClick={permanentlyDeletePrompt} className="bg-red-500 hover:bg-red-600 text-white font-bold text-xs px-6">
              {t.permanentlyDelete}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(builtInPromptNotice)}
        onOpenChange={(open) => {
          if (!open) {
            setBuiltInPromptNotice(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden border-none shadow-2xl rounded-xl">
          <div className="p-6">
            <DialogHeader className="mb-3">
              <DialogTitle className="text-xl font-bold tracking-tight">{t.builtInPromptNoticeTitle}</DialogTitle>
              <DialogDescription>
                {t.builtInPromptNoticeDesc}
              </DialogDescription>
            </DialogHeader>
          </div>
          <DialogFooter className="border-[#E5E5E5] bg-[#FAFAFA]">
            <Button onClick={() => setBuiltInPromptNotice(null)} className="bg-[#1A1A1A] hover:bg-[#333] text-white font-bold text-xs px-6">
              {t.acknowledge}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(viewingPrompt)}
        onOpenChange={(open) => {
          if (!open) {
            setViewingPrompt(null);
          }
        }}
      >
        <DialogContent className={`sm:max-w-[760px] p-0 overflow-hidden border-none shadow-2xl rounded-[22px] ${theme === 'dark' ? 'bg-[#141A27] text-[#EAF0FF]' : ''}`}>
          {viewingPrompt && (
            <>
              <div className={theme === 'dark' ? 'border-b border-[#2A3040] bg-[#141A27] px-7 py-6' : 'border-b border-[#ECE8DE] bg-[linear-gradient(135deg,_#FCFBF8_0%,_#F5F1E8_100%)] px-7 py-6'}>
                <DialogHeader className="gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className={theme === 'dark' ? 'bg-[#1E2638] text-[#C9D4F2] text-[10px] px-2 py-0.5 h-6 font-bold uppercase shadow-sm border border-[#36405A]' : 'bg-white text-[#666] text-[10px] px-2 py-0.5 h-6 font-bold uppercase shadow-sm'}>
                      {getCategoryDisplayNameById(viewingPrompt.category)}
                    </Badge>
                    <Badge variant="secondary" className={`text-[10px] px-2 py-0.5 h-6 font-bold uppercase ${
                      theme === 'dark'
                        ? (viewingPrompt.isDefault ? 'bg-[#2A3247] text-[#C9D4F2]' : 'bg-[#1F3A2C] text-[#A8E5C4]')
                        : (viewingPrompt.isDefault ? 'bg-[#F0F0F0] text-[#666]' : 'bg-[#EEF4EA] text-[#4E6B4E]')
                    }`}>
                      {viewingPrompt.isDefault ? t.builtin : t.custom}
                    </Badge>
                    <Badge variant="outline" className={theme === 'dark' ? 'border-[#55638A] bg-transparent text-[10px] px-2 py-0.5 h-6 font-bold uppercase tracking-[0.18em] text-[#A8B5D8]' : 'border-[#E6DFD0] bg-transparent text-[10px] px-2 py-0.5 h-6 font-bold uppercase tracking-[0.18em] text-[#9B8A67]'}>
                      {t.viewPrompt}
                    </Badge>
                  </div>
                  <DialogTitle className={theme === 'dark' ? 'text-2xl font-bold tracking-tight text-[#EAF0FF]' : 'text-2xl font-bold tracking-tight text-[#1A1A1A]'}>
                    {viewingPrompt.title}
                  </DialogTitle>
                  <DialogDescription className={theme === 'dark' ? 'text-[14px] leading-6 text-[#B7C0D8]' : 'text-[14px] leading-6 text-[#6D6558]'}>
                    {viewingPrompt.isDefault ? t.builtInPromptNoticeDesc : t.promptDetailsDesc}
                  </DialogDescription>
                </DialogHeader>
              </div>

              <div className="px-7 py-6">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className={theme === 'dark' ? 'text-[11px] font-bold uppercase tracking-[0.18em] text-[#A8B5D8]' : 'text-[11px] font-bold uppercase tracking-[0.18em] text-[#A1A1A1]'}>
                    {t.promptContent}
                  </p>
                  <p className={theme === 'dark' ? 'text-xs text-[#B7C0D8]' : 'text-xs text-[#8B8B8B]'}>
                    {t.promptDetailsHint}
                  </p>
                </div>
                <div className={theme === 'dark' ? 'max-h-[420px] overflow-y-auto rounded-[18px] border border-[#2A3040] bg-[#101523] p-5' : 'max-h-[420px] overflow-y-auto rounded-[18px] border border-[#E8E5DD] bg-[#FBFBFA] p-5'}>
                  <pre className={theme === 'dark' ? 'whitespace-pre-wrap break-words font-mono text-[13px] leading-7 text-[#D4DEFA]' : 'whitespace-pre-wrap break-words font-mono text-[13px] leading-7 text-[#333]'}>
                    {viewingPrompt.content}
                  </pre>
                </div>
              </div>

              <DialogFooter className={theme === 'dark' ? 'border-[#2A3040] bg-[#101523]' : 'border-[#E5E5E5] bg-[#FAFAFA]'}>
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(viewingPrompt.content);
                    toast.success(t.copied);
                  }}
                  className={theme === 'dark' ? 'font-bold text-xs border-[#36405A] bg-[#1B2436] text-[#E6ECFF]' : 'font-bold text-xs border-[#E5E5E5] bg-white'}
                >
                  <Copy className="w-3.5 h-3.5 mr-2" />
                  {t.copy}
                </Button>
                <span title={viewingPrompt.isDefault ? t.builtInPromptTooltip : undefined}>
                  <Button
                    onClick={() => openPromptEditorFromViewer(viewingPrompt)}
                    disabled={viewingPrompt.isDefault}
                    className={`font-bold text-xs px-6 ${viewingPrompt.isDefault ? 'bg-[#D9D9D9] text-[#8C8C8C] hover:bg-[#D9D9D9] cursor-not-allowed' : 'bg-[#1A1A1A] hover:bg-[#333] text-white'}`}
                  >
                    <Edit2 className="w-3.5 h-3.5 mr-2" />
                    {t.editPrompt}
                  </Button>
                </span>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Editor Dialog */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="sm:max-w-[640px] p-0 overflow-hidden border-none shadow-2xl rounded-xl max-h-[90vh] flex flex-col">
          <div className="p-8 overflow-y-auto flex-1 min-h-0">
            <DialogHeader className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span className="text-[10px] font-bold text-[#A1A1A1] uppercase tracking-widest">{t.promptEditor}</span>
              </div>
              <DialogTitle className="text-2xl font-bold tracking-tight">
                {editingPrompt ? t.editPrompt : t.createPrompt}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#666] uppercase tracking-wider">{t.title}</label>
                <Input 
                  placeholder={t.titlePlaceholder}
                  value={editorTitle}
                  onChange={(e) => setEditorTitle(e.target.value)}
                  className="h-11 bg-[#F5F5F5] border-none focus-visible:ring-1 focus-visible:ring-[#1A1A1A] text-base font-medium"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#666] uppercase tracking-wider">{t.category}</label>
                <div className="flex flex-wrap gap-2">
                  {categories.filter(cat => cat.id !== 'other').map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setEditorCategory(cat.id)}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                        editorCategory === cat.id 
                          ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]' 
                          : 'bg-white text-[#666] border-[#E5E5E5] hover:border-[#A1A1A1]'
                      }`}
                    >
                      {getCategoryDisplayName(cat)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#666] uppercase tracking-wider">{t.promptContent}</label>
                <Textarea 
                  placeholder={t.promptPlaceholder}
                  value={editorContent}
                  onChange={(e) => setEditorContent(e.target.value)}
                  className="field-sizing-fixed min-h-[240px] max-h-[45vh] overflow-y-auto bg-[#F5F5F5] border-none focus-visible:ring-1 focus-visible:ring-[#1A1A1A] font-mono text-[13px] leading-relaxed p-4"
                />
              </div>
            </div>
          </div>
          
          <div className="p-6 bg-[#FAFAFA] border-t border-[#E5E5E5] flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setIsEditorOpen(false)} className="font-bold text-xs">{t.cancel}</Button>
            <Button 
              onClick={savePrompt} 
              disabled={isSaving}
              className="bg-[#1A1A1A] hover:bg-[#333] text-white font-bold text-xs px-8"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : t.saveTemplate}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
