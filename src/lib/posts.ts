import { legacyRoute, encodePath, sitePath } from './paths.mjs';

type Heading = { depth: number; slug: string; text: string };
type MarkdownModule = {
  frontmatter: Record<string, unknown>;
  Content: any;
  getHeadings(): Heading[] | Promise<Heading[]>;
};
const modules = import.meta.glob<MarkdownModule>('../../_posts/*.md', { eager: true });
const raw = import.meta.glob<string>('../../_posts/*.md', { eager: true, query: '?raw', import: 'default' });

export async function getPosts() {
  const posts = await Promise.all(Object.entries(modules).map(async ([path, mod]) => {
    const { date, route } = legacyRoute(path.split('/').at(-1)!);
    const headings = await mod.getHeadings();
    const title = typeof mod.frontmatter.title === 'string' ? mod.frontmatter.title : headings.find(h => h.depth === 1)?.text;
    if (!title) throw new Error('Missing post title: ' + path);
    const category = typeof mod.frontmatter.category === 'string' ? mod.frontmatter.category :
      title.startsWith('書評') ? 'Book reviews' : title.includes('読んだ資料') ? 'Reading log' : 'Notes';
    return { date, route, href: sitePath(encodePath(route) + '.html'), title, headings, category,
      Content: mod.Content, body: raw[path] ?? '', published: mod.frontmatter.published !== false };
  }));
  const routes = new Set<string>();
  for (const post of posts) {
    if (routes.has(post.route)) throw new Error('Duplicate route: ' + post.route);
    routes.add(post.route);
  }
  return posts.filter(p => p.published).sort((a, b) => b.date.localeCompare(a.date) || a.route.localeCompare(b.route));
}
