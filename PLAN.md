# Lost Saga Database — Project Plan

## Overview

An open-source, community-driven database and visual website for **Lost Saga**.

The project provides:

- Public JSON data for heroes, gears, items, and more.
- Downloadable image assets served through a free CDN.
- A fast, beautiful, and searchable website for browsing the database.

## Goals

- Keep the data pipeline simple and reproducible.
- Maintain a fully static, version-controlled dataset.
- Build a modern React website with excellent performance and UX.
- Make it easy for the community to contribute fixes and new features.

## Tech Stack

### Data Pipeline

- **Runtime:** Node.js 18+
- **API calls:** Native `fetch()`
- **File I/O:** `fs.promises` and Node.js streams
- **Outputs:**
  - `data/hero.json` — raw API data
  - `data/hero-local.json` — hero data with local asset paths
  - `Mercenary/` — hero image assets

### Website

- **Framework:** Next.js `16.2.9`
- **React:** `19.x`
- **Language:** TypeScript
- **Styling:** Tailwind CSS `4.3.1`
- **Components:** shadcn/ui + Lucide React
- **Deployment:** Vercel

### Asset Hosting

Images are served via **jsDelivr** on top of the GitHub repository:

```text
https://cdn.jsdelivr.net/gh/rifadev26/lostsaga-database@main/Mercenary/{hero.code}/icon_m.png
```

## Repository Structure

```text
lostsaga-database/
├── .github/
│   └── ISSUE_TEMPLATE/          # GitHub issue templates
├── data/
│   ├── hero.json                # raw API data
│   └── hero-local.json          # local asset paths
├── Mercenary/                   # hero image assets
├── scripts/
│   └── index.js                 # data fetching pipeline
├── site/                        # Next.js website
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── public/
│   ├── next.config.js
│   ├── postcss.config.mjs
│   ├── tsconfig.json
│   └── package.json
├── CODE_OF_CONDUCT.md
├── CONTRIBUTING.md
├── LICENSE
├── PLAN.md
├── README.md
└── SECURITY.md
```

## Data Pipeline

The `scripts/index.js` file runs three main functions:

1. `fetchHeroes()` — fetches hero records from the Lost Saga API and writes `data/hero.json`.
2. `downloadHeroImages()` — parses `data/hero.json`, downloads all hero and gear images into `Mercenary/`, and writes `failed-images.json` if any images fail.
3. `changeHeroAsset()` — generates `data/hero-local.json` by replacing remote image URLs with local paths like `Mercenary/{hero.code}/icon_m.png`.

### Running the pipeline

```bash
npm install
node scripts/index.js
```

## Website Implementation

### Phase 1 — Heroes (current)

- [x] Scaffold `site/` with Next.js 16, Tailwind CSS 4, and shadcn/ui
- [ ] Build `/heroes` listing page with search, type filter, and rarity filter
- [ ] Build `/heroes/[code]` detail page
- [ ] Apply fresh "Obsidian Cyan" dark theme design
- [ ] Deploy to Vercel

### Phase 2 — Gears & Items

- Gear listing page with search and filters
- Gear detail page
- Item listing page

### Phase 3 — Tools

- Icon browser
- Quest generator
- Pass generator
- SRV ID generator

### Phase 4 — Community Features

- Contribution-friendly data correction workflows
- Optional user accounts / favorites / comments

## Design Direction

The website uses a fresh, modern look called **"Obsidian Cyan"**:

- Deep obsidian background
- Electric cyan accent color
- Clean card-based layout
- Generous whitespace
- Subtle hover glows

It is intentionally different from the original `lostsaga.xyz` site.

## Deployment

### Vercel settings

| Setting | Value |
|---|---|
| Framework preset | Next.js |
| Root directory | `site` |
| Build command | `next build` |
| Output directory | `.next` |

No static export is used; Vercel handles the Next.js app natively.

### Image configuration

`site/next.config.js` allows the Next.js Image component to optimize remote images from jsDelivr:

```js
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'cdn.jsdelivr.net',
    },
  ],
}
```

## Contribution Workflow

1. Fork the repository.
2. Create a feature or fix branch.
3. If you change the data pipeline, run `node scripts/index.js` to regenerate data.
4. Verify the website locally with `cd site && npm run dev`.
5. Open a pull request.

See [CONTRIBUTING.md](./CONTRIBUTING.md) for more details.

## License

MIT License — see [LICENSE](./LICENSE).
