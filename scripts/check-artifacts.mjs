import { readFileSync, readdirSync, existsSync, lstatSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export function verifyArtifacts(root = process.cwd(), output = false) {
  const entries = JSON.parse(readFileSync(resolve(root, 'content/library.json'), 'utf8'));
  if (!Array.isArray(entries)) throw new Error('Invalid library manifest');
  const dir = resolve(root, output ? 'dist' : 'public');
  const registered = new Set();
  for (const e of entries) {
    if (!e || typeof e.path !== 'string' || !/^library\/memex\/[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)*\.(html|pdf)$/.test(e.path)) throw new Error('Invalid public artifact path: ' + e?.path);
    if (registered.has(e.path)) throw new Error('Duplicate artifact: ' + e.path);
    if (!['html', 'pdf'].includes(e.format) || !e.path.endsWith('.' + e.format) || !/^[a-f0-9]{64}$/.test(e.sha256) || !/^[a-f0-9]{40}$/.test(e.sourceRevision) || !/^\d{4}-\d{2}-\d{2}$/.test(e.published) || typeof e.title !== 'string' || !e.title.trim() || typeof e.description !== 'string') throw new Error('Invalid artifact metadata: ' + e.path);
    const path = resolve(dir, e.path);
    for (const part of e.path.split('/').map((_, i, parts) => parts.slice(0, i + 1).join('/'))) {
      if (lstatSync(resolve(dir, part)).isSymbolicLink()) throw new Error('Symlink artifact path: ' + e.path);
    }
    if (!lstatSync(path).isFile()) throw new Error('Not a regular artifact: ' + e.path);
    if (createHash('sha256').update(readFileSync(path)).digest('hex') !== e.sha256) throw new Error('Hash mismatch: ' + e.path);
    registered.add(e.path);
  }
  function walk(path) {
    if (!existsSync(path)) return;
    if (lstatSync(path).isSymbolicLink()) throw new Error('Symlink in artifact directory: ' + path);
    for (const entry of readdirSync(path, { withFileTypes: true })) {
      const full = resolve(path, entry.name);
      if (entry.isDirectory()) walk(full);
      else {
        const name = relative(dir, full).split(sep).join('/');
        if (!entry.isFile() || !registered.has(name)) throw new Error('Unregistered artifact: ' + name);
      }
    }
  }
  walk(resolve(dir, 'library/memex'));
  return registered.size;
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log('Verified public artifacts: ' + verifyArtifacts());
}
