const fs = require('fs');
const md = fs.readFileSync('ai_writing.md', 'utf-8');

const prompts = [];
const regex = /## ([^\n]+)\s+?(?:[^\`]*?)````markdown\n([\s\S]*?)````/g;
let match;
let id = 10;
while ((match = regex.exec(md)) !== null) {
  let title = match[1].trim();
  let content = match[2].trim();
  // Filter out any skills or unwanted headings just in case. But looking at the regex, it only catches ` ` ` ` markdown` exactly under `## Title`.
  prompts.push({
    id: `def-ai-${id++}`,
    title: title,
    category: 'ai-writing',
    content: content,
    tags: ['AI写作', title.split('（')[0]],
    isDefault: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  });
}
fs.writeFileSync('parsed_prompts.json', JSON.stringify(prompts, null, 2));
console.log("Parsed " + prompts.length + " prompts.");
