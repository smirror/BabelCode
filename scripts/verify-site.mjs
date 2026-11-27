import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { legacyRoute, sitePath, encodePath } from '../src/lib/paths.mjs';
import { verifyArtifacts } from './check-artifacts.mjs';

const text = path => readFileSync('dist/' + path, 'utf8');
for (const file of ['index.html','blog.html','library.html','lab.html','about.html','404.html','feed.xml','sitemap.xml','images/logo.png']) {
  assert.ok(existsSync('dist/' + file), 'Missing output: ' + file);
}
const blog = text('blog.html'), feed = text('feed.xml');
let count = 0;
for (const name of readdirSync('_posts').filter(n => n.endsWith('.md'))) {
  const source = readFileSync('_posts/' + name, 'utf8');
  const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)?.[1] ?? '';
  if (/^published:\s*false\s*$/m.test(frontmatter)) continue;
  const { route } = legacyRoute(name);
  const file = route + '.html';
  const html = text(file);
  assert.ok(blog.includes(sitePath(encodePath(route) + '.html').replace(/&/g, '&amp;')), 'Missing archive link: ' + file);
  assert.ok(feed.includes(sitePath(encodePath(route) + '.html').replace(/&/g, '&amp;')), 'Missing feed entry: ' + file);
  assert.ok(html.includes('<article'), 'Missing article: ' + file);
  for (const [, target] of source.matchAll(/\]\(#([^)]+)\)/g)) {
    // Existing hand-authored TOC links must continue to resolve.
    assert.ok(html.includes('id="' + target + '"') || html.includes('id="' + decodeURIComponent(target) + '"'), 'Unresolved legacy anchor: ' + file + '#' + target);
  }
  assert.ok(!html.includes('{:toc}') && !html.includes('{% include'), 'Unconverted Liquid: ' + file);
  count++;
}
assert.ok(count >= 9, 'Existing posts missing');
const welcome = text('2020/01/14/welcome.html');
assert.ok(welcome.includes(sitePath('images/logo.png')), 'Image base path mismatch');
assert.ok(welcome.includes('footnote'), 'Footnote rendering missing');
assert.ok(welcome.includes('You can include alert boxes'), 'Callout content missing');
assert.equal(verifyArtifacts(process.cwd(), true), verifyArtifacts());
console.log('Verified ' + count + ' legacy article paths, archive, feed, local links and byte-identical library artifacts.');
