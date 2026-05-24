# Vanaprastha

A showcase site for the art and artifact collections of the late Surjit Das. Built with Astro, React, and Tailwind CSS. Content is markdown-backed — no database required.

## Setup

```bash
cp .env.example .env
npm install
```

## Development

```bash
npm run dev
```

Opens at [http://localhost:3000](http://localhost:3000).

### Key pages

| Path | Description |
|------|-------------|
| `/` | Homepage — grid of all collections |
| `/collections/:slug` | Collection page — blurb, image gallery, lightbox |
| `/about` | About S.K. Das and Vanaprastha |
| `/admin` | Editor — add/remove/edit collections and images |

## Image pipeline

Images live outside the repo in a Google Drive folder. To process them:

```bash
# Optimize images from Google Drive → .images-staging/
npm run import-images

# Upload staged images to Cloudflare R2
npm run upload-r2
```

For local dev, a symlink at `public/images/collections` points to `.images-staging/collections/` so images are served by the dev server without R2.

Set `PUBLIC_IMAGE_BASE_URL` in `.env` to your R2 public URL for production.

## Content

Each collection is a markdown file in `src/content/collections/`. The frontmatter holds metadata (title, order, hero image, item list) and the body is the collection description.

To seed all 16 collections from the PDF catalogue:

```bash
npm run seed
```

## Production build

```bash
npm run build
npm run preview
```

Requires an Astro adapter for `output: 'server'` mode (e.g. `@astrojs/node`, `@astrojs/cloudflare`).
