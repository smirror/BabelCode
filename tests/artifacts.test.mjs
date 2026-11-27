import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { verifyArtifacts } from '../scripts/check-artifacts.mjs';
test('only explicitly registered, hash-matching generated HTML is published', () => {
  const root = mkdtempSync(join(tmpdir(), 'babelcode-'));
  try {
    mkdirSync(join(root, 'content'));
    mkdirSync(join(root, 'public/library/memex'), {recursive:true});
    const file = join(root, 'public/library/memex/example.html');
    const html = '<!doctype html><html><body><math><mi>x</mi></math><script>document.title="Example"</script></body></html>';
    writeFileSync(file, html);
    const manifest = join(root, 'content/library.json');
    writeFileSync(manifest, '[]');
    assert.throws(() => verifyArtifacts(root), /Unregistered/);
    writeFileSync(manifest, JSON.stringify([{path:'library/memex/example.html',format:'html',sha256:createHash('sha256').update(html).digest('hex'),sourceRevision:'a'.repeat(40),published:'2026-11-28',title:'Example',description:'Fixture'}]));
    assert.equal(verifyArtifacts(root), 1);
    writeFileSync(file, html + 'changed');
    assert.throws(() => verifyArtifacts(root), /Hash mismatch/);
  } finally { rmSync(root, {recursive:true,force:true}); }
});
