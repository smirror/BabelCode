import { getPosts } from '../lib/posts';
import library from '../../content/library.json';
import { SITE, sitePath, encodePath } from '../lib/paths.mjs';
export async function GET() {
  const urls = ['', 'blog.html', 'library.html', 'lab.html', 'about.html'].map(sitePath).concat((await getPosts()).map(p => p.href), library.map(p => sitePath(encodePath(p.path))));
  const entries = urls.map(url => '<url><loc>' + (SITE + url).replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</loc></url>').join('');
  return new Response('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + entries + '</urlset>', { headers: {'Content-Type': 'application/xml; charset=utf-8'} });
}
