# Lost Saga Database

An open-source database of **Lost Saga** heroes, gears, items, and assets.

## Website

Visit the live website (coming soon):

```text
https://lostsaga-database.vercel.app
```

## What's inside

| File / Folder | Description |
|---|---|
| `data/hero.json` | Raw hero data from the Lost Saga API |
| `data/hero-local.json` | Hero data with local image asset paths |
| `Mercenary/` | Hero and gear image assets |
| `scripts/index.js` | Data fetching and asset download pipeline |
| `site/` | Next.js website source code |

## Quick start

### 1. Generate data

```bash
npm install
npm run fetch
```

This will:

- Fetch 287 heroes from the Lost Saga API
- Download ~5,782 images into `Mercenary/`
- Generate `data/hero.json` and `data/hero-local.json`

### 2. Run the website locally

```bash
cd site
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Tech stack

- **Data pipeline:** Node.js + native `fetch`
- **Website:** Next.js 16 + React 19 + TypeScript + Tailwind CSS 4 + shadcn/ui
- **Deployment:** Vercel
- **Asset CDN:** jsDelivr

## Contributing

We welcome contributions! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) first.

## Project plan

See [PLAN.md](./PLAN.md) for the full roadmap and architecture.

## License

[MIT](./LICENSE)
