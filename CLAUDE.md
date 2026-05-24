# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Vanaprastha is a showcase site for the art and artifact collections of Late Surjit Kishore Das. Built with Astro 6 + React islands + Tailwind CSS 4. Content is markdown-backed (no database). Images are optimized WebP files stored in Cloudflare R2 (locally served from `.images-staging/` via symlink during dev).

## Commands

- **Dev server:** `npm run dev` (runs at localhost:3000)
- **Build:** `npm run build`
- **Seed content:** `npm run seed` (generates markdown files from PDF data)
- **Import images:** `npm run import-images` (processes Google Drive images → `.images-staging/`)
- **Upload to R2:** `npm run upload-r2` (uploads staged images to Cloudflare R2)

## Architecture

### Content System

- **`src/content/collections/`** — One markdown file per collection (16 total). Frontmatter has title, order, heroImage, items array. Body is the editable blurb (seeded from the PDF catalogue).
- **`src/content.config.ts`** — Astro content collection schema using `glob` loader.
- **`scripts/seed-content.ts`** — Generates the 16 markdown files with blurbs extracted from the PDF.

### Image Pipeline

- Source images: `/home/sreela/VANAPRASTHA GOOGLE DRIVE/` (EDITED IMAGES preferred, RAW IMAGES as fallback)
- **`scripts/import-images.ts`** — Reads from Google Drive, optimizes with sharp (1200px wide WebP), writes to `.images-staging/collections/{slug}/`. Also updates markdown frontmatter with filenames.
- **`scripts/upload-to-r2.ts`** — Uploads `.images-staging/` to Cloudflare R2 via S3-compatible API.
- Local dev: `public/images/collections` symlinks to `.images-staging/collections/`.
- `PUBLIC_IMAGE_BASE_URL` env var controls image URL base (defaults to `/images`).

### UI (React Components)

All UI is React in `src/components/react/`. Astro `.astro` files are minimal wrappers for routing and data loading.

- **`HomePage.tsx`** — Collection grid with hero section.
- **`CollectionPage.tsx`** — Hero image, blurb text, image gallery.
- **`Gallery.tsx`** — Responsive image grid (CSS grid, 2-4 columns).
- **`Lightbox.tsx`** — Full-screen image viewer with keyboard nav (←/→/Esc).
- **`AdminEditor.tsx`** — Textarea-based blurb editor for all collections.
- **`SiteHeader.tsx` / `SiteFooter.tsx`** — Shared navigation.

### Pages (Astro routing wrappers)

- `src/pages/index.astro` — Loads all collections, passes to `HomePage`.
- `src/pages/collections/[slug].astro` — Loads single collection, passes to `CollectionPage`.
- `src/pages/about.astro` — Static about page.
- `src/pages/admin/index.astro` — Admin editor page.
- `src/pages/api/collections/[slug].ts` — PUT endpoint to update collection markdown blurbs.

### 16 Collections

Auli Mascots, Nek Chand's Sculptures, Paintings, Bollywood Posters, Ceramic Tableware Set, Traditional Embroidered Textiles, Wooden Toys, Traditional Masks, Dokra and Chola Crafts, Seaforms/Minerals/Fossils, Photographs, Wooden God's Sculpture, Floor Tiles, Wooden Tehri Pillars, Wooden Vessels, Framed Butterflies.

## Key Conventions

- Package manager is **npm**.
- Astro 6 with `output: 'server'`. React components use `client:load` for hydration.
- Tailwind CSS 4 configured via `@tailwindcss/vite` plugin (not `@astrojs/tailwind`). Theme in `src/styles/global.css` using `@theme`.
- Custom colors: `cream`, `warmgray-50` through `warmgray-900`.
- Vite pinned to ^7 via `overrides` in package.json (Astro 6 requirement).
- To add a new collection: add a `.md` file to `src/content/collections/`, run `import-images` to process its images.
