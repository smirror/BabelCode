import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://smirror.github.io',
  base: '/BabelCode',
  output: 'static',
  build: { format: 'file' },
  trailingSlash: 'ignore',
  markdown: { gfm: true },
});
