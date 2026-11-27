# BabelCode

A static personal site for writing, a library of generated documents, and web experiments. Astro, TypeScript, plain CSS; no Ruby, database or runtime server.

## Development

Install Node.js 24 LTS, then run:

    npm ci
    npm run dev

    npm test
    npm run build
    npm run preview

The development/preview URL includes /BabelCode/. The production build is dist/.

## Writing

Add a Markdown file in _posts/ named YYYY-MM-DD-filename.md. The first H1 becomes its title; optional YAML front matter can override title/category or set published: false. Use GitHub-flavored Markdown for tables, footnotes, code and links. Existing date-based .html paths are retained, including capitalization. Image paths use /BabelCode/images/ and files live in public/images/. No MDX or frontend runtime is required.

## Library: publish a memex export

memex remains independent. Generate a self-contained HTML file with its existing --html workflow (or a PDF), review its contents and redistribution rights, and copy only that approved output into public/library/memex/. Do not copy the private repository, source notes, internal manifests, or credentials. Do not fetch memex automatically in this public repository.

Add an entry to content/library.json:

    {
      "title": "Mathematics",
      "description": "Reviewed export",
      "format": "html",
      "path": "library/memex/mathematics.html",
      "sourceRevision": "<40-character source commit>",
      "sha256": "<64-character SHA-256 of the exact file>",
      "published": "2026-11-28"
    }

Calculate the hash with shasum -a 256 or sha256sum. The build rejects unlisted files and mismatches. Astro copies these documents unchanged; the library page links to them instead of injecting their HTML into the site's layout. Only trusted, reviewed HTML should be hosted on this origin: separate URLs are not a security sandbox. Use a separate origin for untrusted or intentionally vulnerable experiments. Large files should be split or hosted elsewhere before exceeding GitHub limits.

## Lab

Add independent static experiments under public/lab/ or create a dedicated Astro page; link them explicitly from src/pages/lab.astro. Keep third-party dependencies scoped to each experiment. No experiment code is loaded by normal articles.

## Deploy / migration

1. Review the PR's build and verify the artifact/legacy URL checks. Compare the old site and generated dist output, including any known external links.
2. Merge the PR when ready. In Settings > Pages, select GitHub Actions as the source (the existing Jekyll branch deployment is not compatible with Astro).
3. Run the Astro Pages workflow on master (or push a commit). Confirm the existing /BabelCode/ homepage, all old article URLs, feed and 404.
4. If rollback is needed, revert the migration and restore the prior Pages source configuration; the old Jekyll sources are preserved in git history.

The Pages deployment job runs only on master / manual dispatch on master, never on pull requests. Deployment settings are not modified by this PR. The live site URL is https://smirror.github.io/BabelCode/.

## Dependency maintenance

Keep package-lock.json committed; CI uses npm ci. Dependabot checks npm and GitHub Actions. Review dependency updates and the static build before merging.
