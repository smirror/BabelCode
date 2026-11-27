import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';

const manifest = 'content/library.json';
const artifact = 'public/library/memex/__ci_fixture.html';
const original = readFileSync(manifest);
const entries = JSON.parse(original);
if (existsSync(artifact) || entries.some(e => e.path === 'library/memex/__ci_fixture.html')) throw new Error('Reserved CI fixture path already exists');
const bytes = Buffer.from('<!doctype html><html lang="ja"><meta charset="utf-8"><title>CI fixture</title><body><math><mi>x</mi></math><script>document.title="CI fixture"</script></body></html>\n');
mkdirSync('public/library/memex', { recursive: true });
try {
  writeFileSync(artifact, bytes);
  writeFileSync(manifest, JSON.stringify([...entries, {
    title: 'CI fixture (not published)', description: 'Synthetic self-contained HTML test.',
    path: 'library/memex/__ci_fixture.html', format: 'html',
    sha256: createHash('sha256').update(bytes).digest('hex'),
    sourceRevision: '0'.repeat(40), published: '2026-11-28',
  }]));
  execFileSync('npm', ['run', 'build'], { stdio: 'inherit' });
  assert.deepEqual(readFileSync('dist/library/memex/__ci_fixture.html'), bytes);
  assert.ok(readFileSync('dist/library.html', 'utf8').includes('/BabelCode/library/memex/__ci_fixture.html'));
  console.log('Synthetic memex-format artifact copied byte-for-byte and linked successfully.');
} finally {
  writeFileSync(manifest, original);
  rmSync(artifact, { force: true });
  rmSync('dist', { recursive: true, force: true });
}
