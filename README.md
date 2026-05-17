# Notes Atlas by mohitdevx

A modern, markdown-first documentation platform built with React, TypeScript, and Tailwind CSS v4.

Notes Atlas turns your `public/notes` folder into a navigable documentation hub with recursive sidebar navigation, GitHub-style markdown rendering, syntax-highlighted code blocks, and production-ready static deployment support.

## Highlights

- Recursive notes indexing at build/dev time from `public/notes`
- Auto-grouping of root-level markdown files into a `Global` folder
- Type-safe sidebar tree (`FileNode`, `FolderNode`, `SidebarItem`)
- Responsive fixed sidebar with mobile off-canvas toggle
- Theme toggle with persisted preference (light/dark)
- GitHub markdown rendering with GFM support
- Professional code snippet cards with per-snippet copy action
- Floating button to copy the entire current page as raw markdown

## Tech Stack

- React 19 + TypeScript (strict mode)
- Vite 8
- Tailwind CSS v4 (`@theme` token architecture in `src/index.css`)
- Remix Icons
- `react-markdown` + `remark-gfm`
- `react-syntax-highlighter`
- `github-markdown-css`

## Project Structure

```text
.
├── generate-notes-index.js      # Recursive notes index generator
├── netlify.toml                 # Netlify build + SPA routing config
├── public/
│   └── notes/                   # Source markdown tree
└── src/
    ├── App.tsx                  # Layout, sidebar, navigation state
    ├── NoteViewer.tsx           # Markdown renderer + copy actions
    ├── index.css                # Tailwind v4 theme tokens + markdown overrides
    ├── notes-index.json         # Generated navigation index
    └── types.ts                 # Shared strict node typings
```

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 10+

### Install

```bash
pnpm install
```

### Run locally

```bash
pnpm dev
```

The notes index is regenerated automatically before dev and build via:

- `predev` -> `node generate-notes-index.js`
- `prebuild` -> `node generate-notes-index.js`

## Authoring Notes

1. Add markdown files under `public/notes`.
2. Use nested folders freely; indexing is recursive.
3. Root-level markdown files are grouped into `Global`.
4. Hidden files/folders and non-`.md` files are ignored.

Example:

```text
public/notes/
├── welcome.md
├── guides/
│   └── react/
│       └── hooks.md
└── getting-started/
    └── quick-start.md
```

## Scripts

- `pnpm dev` -> run local development server
- `pnpm build` -> type-check + production build
- `pnpm preview` -> preview production build locally
- `pnpm lint` -> run ESLint
- `pnpm start` -> alias to `vite` with prestart indexing

## Deployment (Netlify)

This repository includes `netlify.toml` with:

- Build command: `pnpm build`
- Publish directory: `dist`
- SPA fallback redirect: `/*` -> `/index.html` (200)
- Caching headers for static assets and HTML

Push to your connected Netlify site and deploy.

## Formatting and Ignore Rules

- Prettier config: `.prettierrc`
- Prettier ignore: `.prettierignore`
- Git ignore: `.gitignore`

These are configured for clean diffs, generated-file handling, and common frontend tooling artifacts.
