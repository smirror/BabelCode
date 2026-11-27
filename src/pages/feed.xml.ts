import { getPosts } from '../lib/posts';
import { SITE, sitePath } from '../lib/paths.mjs';
const xml = (s: string) => s.replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&apos;'}[c]!));
export async function GET() {
  const posts = await getPosts();
  const entries = posts.map(p => '<entry><title>' + xml(p.title) + '</title><id>' + xml(SITE + p.href) + '</id><link href="' + xml(SITE + p.href) + '"/><published>' + p.date + 'T00:00:00Z</published><updated>' + p.date + 'T00:00:00Z</updated></entry>').join('');
  const feed = '<?xml version="1.0" encoding="UTF-8"?><feed xmlns="http://www.w3.org/2005/Atom"><title>Bibliophile at Babel Code</title><id>' + SITE + sitePath() + '</id><link href="' + SITE + sitePath() + '"/><link rel="self" href="' + SITE + sitePath('feed.xml') + '"/><updated>' + (posts[0]?.date ?? '2020-01-14') + 'T00:00:00Z</updated><author><name>smirror</name></author>' + entries + '</feed>';
  return new Response(feed, { headers: { 'Content-Type': 'application/atom+xml; charset=utf-8' } });
}
