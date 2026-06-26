# Contributing to Lost Saga Database

Thank you for your interest in contributing!

## How to contribute

### Reporting data issues

If you notice missing, incorrect, or outdated hero/gear/item data:

1. Open a GitHub issue using the **"Data Missing / Incorrect"** template.
2. Include the hero or item name, what's wrong, and a source if you have one.

### Code contributions

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/your-feature`).
3. Make your changes.
4. If you changed the data pipeline, run:

   ```bash
   npm run fetch
   ```

5. Test the website locally:

   ```bash
   cd site
   npm install
   npm run dev
   ```

6. Open a pull request with a clear description.

## Project structure

| Path | Purpose |
|---|---|
| `scripts/` | Data fetching and asset generation |
| `data/` | Generated JSON data files |
| `Mercenary/` | Generated image assets |
| `site/` | Next.js website |

## Important rules

- Do **not** manually edit files inside `data/` or `Mercenary/`. These are generated automatically by `scripts/index.js`.
- Keep the website code inside `site/`. Do not add Node server code to the root unnecessarily.
- Follow the existing code style.
- Write clear commit messages.

## Development tips

- Use Node.js 18 or later.
- The website uses **Tailwind CSS v4**. Check the official [Tailwind v4 docs](https://tailwindcss.com/) if you are used to v3.
- Hero detail pages are statically generated from `data/hero-local.json`.

## Code of conduct

Please be respectful and constructive. See [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md).
