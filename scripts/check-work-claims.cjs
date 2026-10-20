#!/usr/bin/env node
// Read-only advisory check. Run: node scripts/check-work-claims.cjs [log-folder]
const fs = require('node:fs');
const path = require('node:path');
const active = new Set(['claimed', 'in_progress', 'blocked', 'handoff']);
const statuses = new Set([...active, 'done', 'cancelled']);

function check(folder) {
  const tasks = [];
  const errors = [];
  for (const name of fs.readdirSync(folder).sort()) {
    if (!name.endsWith('.md') || ['README.md', 'TEMPLATE.md'].includes(name)) continue;
    const content = fs.readFileSync(path.join(folder, name), 'utf8');
    const field = key => content.match(new RegExp(`^- ${key}: (.+)$`, 'm'))?.[1].trim();
    const status = field('Status');
    if (!statuses.has(status)) { errors.push(`${name}: missing or invalid Status`); continue; }
    if (!active.has(status)) continue;
    if (!field('Owner/session')) errors.push(`${name}: missing Owner/session`);
    const claims = field('Claims');
    if (!claims) { errors.push(`${name}: missing Claims`); continue; }
    const files = claims === 'none' ? [] : claims.split(',').map(s => s.trim().replace(/^`|`$/g, ''));
    for (const file of files) {
      if (!file || file.includes('\\') || file.startsWith('/') || file.split('/').includes('..') || /[*?]/.test(file)) {
        errors.push(`${name}: claim must be an exact repository-relative path: ${file}`);
      }
    }
    tasks.push({ name, owner: field('Owner/session'), files: [...new Set(files)] });
  }
  for (let i = 0; i < tasks.length; i++) {
    for (let j = i + 1; j < tasks.length; j++) {
      for (const a of tasks[i].files) {
        for (const b of tasks[j].files) {
          if (a === b || a.startsWith(b.replace(/\/$/, '') + '/') || b.startsWith(a.replace(/\/$/, '') + '/')) {
            errors.push(`Overlap: ${a} / ${b} — ${tasks[i].name} (${tasks[i].owner}) and ${tasks[j].name} (${tasks[j].owner})`);
          }
        }
      }
    }
  }
  return { tasks, errors };
}

if (require.main === module) {
  try {
    const result = check(process.argv[2] || path.resolve(__dirname, '../docs/work-log'));
    for (const task of result.tasks) console.log(`${task.owner}: ${task.files.join(', ') || 'no files reserved'}`);
    for (const error of result.errors) console.error(error);
    console.log(`${result.tasks.length} active task(s); ${result.errors.length} problem(s). Advisory only; refresh shared GitHub claims before editing.`);
    process.exitCode = result.errors.length ? 1 : 0;
  } catch (error) {
    console.error(`Cannot check work claims: ${error.message}`);
    process.exitCode = 1;
  }
}
module.exports = { check };
