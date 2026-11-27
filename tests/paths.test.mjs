import test from 'node:test';
import assert from 'node:assert/strict';
import { legacyRoute, encodePath, sitePath } from '../src/lib/paths.mjs';
test('Jekyll permalink keeps case and date', () => {
  assert.deepEqual(legacyRoute('2023-08-23-Hackers and Painters.md'), {date:'2023-08-23', route:'2023/08/23/Hackers-and-Painters'});
  assert.equal(legacyRoute('2024-05-20-rust-in-perspective.md').route, '2024/05/20/rust-in-perspective');
  assert.equal(legacyRoute('2021-07-12-AWS EC2て\u3099ISUCON.md').route, '2021/07/12/AWS-EC2て-ISUCON');
  assert.equal(sitePath(encodePath('2021/07/12/日本語') + '.html'), '/BabelCode/2021/07/12/%E6%97%A5%E6%9C%AC%E8%AA%9E.html');
  assert.throws(() => legacyRoute('invalid.md'));
  assert.throws(() => legacyRoute('2025-02-30-invalid.md'));
});
