#!/usr/bin/env node
/**
 * Strip em dashes (—) from project text so copy reads more naturally.
 *
 * Rules:
 *   quoted placeholder "—" / '—'     →  "-" / '-'
 *   "word — word" / "word—word"      →  "word - word"
 *   any remaining —                  →  -
 *
 * Usage: node scripts/strip-em-dashes.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DRY_RUN = process.argv.includes('--dry-run');

const INCLUDE_DIRS = ['client/src', 'server/src', 'client/public'];
const INCLUDE_ROOT_FILES = [
  'README.md',
  'DEPLOY_RENDER.md',
  'render.yaml',
  'scholarship_and_job_sites.md',
  'implementation_plan.md',
];
const EXTENSIONS = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.css',
  '.md',
  '.html',
  '.json',
  '.yaml',
  '.yml',
]);

const SKIP_DIRS = new Set([
  'node_modules',
  'dist',
  'build',
  '.git',
  'uploads',
  '_backup_watermark',
]);

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      walk(full, files);
    } else if (EXTENSIONS.has(path.extname(entry.name))) {
      files.push(full);
    }
  }
  return files;
}

function stripEmDashes(text) {
  let out = text;
  // Empty / placeholder dash inside quotes
  out = out.replace(/(['"])—\1/g, '$1-$1');
  // Em dash between two non-space characters (optional spaces around the dash)
  out = out.replace(/(\S)[ \t]*—[ \t]*(\S)/g, '$1 - $2');
  // Remaining em dashes with optional horizontal whitespace
  out = out.replace(/[ \t]*—[ \t]*/g, ' - ');
  // Any leftover
  out = out.replace(/—/g, '-');
  return out;
}

function collectFiles() {
  const files = [];
  for (const rel of INCLUDE_DIRS) {
    walk(path.join(ROOT, rel), files);
  }
  for (const rel of INCLUDE_ROOT_FILES) {
    const full = path.join(ROOT, rel);
    if (fs.existsSync(full)) files.push(full);
  }
  return files;
}

function main() {
  const files = collectFiles();
  let changedFiles = 0;
  let totalReplacements = 0;

  for (const file of files) {
    const original = fs.readFileSync(file, 'utf8');
    const before = (original.match(/—/g) || []).length;
    if (!before) continue;

    const next = stripEmDashes(original);
    const after = (next.match(/—/g) || []).length;
    const removed = before - after;
    if (next === original) continue;

    totalReplacements += removed;
    changedFiles += 1;
    const rel = path.relative(ROOT, file).replace(/\\/g, '/');

    if (DRY_RUN) {
      console.log(`[dry-run] ${rel} (${removed})`);
    } else {
      fs.writeFileSync(file, next, 'utf8');
      console.log(`updated ${rel} (${removed})`);
    }
  }

  console.log(
    `\n${DRY_RUN ? 'Would update' : 'Updated'} ${changedFiles} file(s), removed ${totalReplacements} em dash(es).`,
  );
}

main();
