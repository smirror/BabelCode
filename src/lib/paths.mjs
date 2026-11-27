export const BASE = '/BabelCode';
export const SITE = 'https://smirror.github.io';
export const sitePath = (path = '') => BASE + '/' + path.replace(/^\/+/, '');
export const encodePath = (path) => path.split('/').map(encodeURIComponent).join('/');
export const absolute = (path) => SITE + sitePath(path);

// Jekyll 3.10's default date permalink uses the case-preserving "pretty" slug.
export function legacyRoute(filename) {
  const m = filename.match(/^(\d{4})-(\d{2})-(\d{2})-(.+)\.md$/u);
  if (!m) throw new Error('Invalid post filename: ' + filename);
  const [, year, month, day, name] = m;
  const date = year + '-' + month + '-' + day;
  if (new Date(date).toISOString().slice(0, 10) !== date) throw new Error('Invalid post date: ' + filename);
  const slug = name.replace(/[^\p{L}\p{N}._~!$&'()+,;=@]+/gu, '-').replace(/^-|-$/g, '');
  if (!slug || slug === '.' || slug === '..') throw new Error('Invalid slug: ' + filename);
  return { date, route: [year, month, day, slug].join('/') };
}
