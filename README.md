# dead-cat-bounce

## Develop / Build / Deploy (Vite)

- Install: `npm install`
- Dev server: `npm run dev` (Vite on `http://localhost:5173`)
- Build: `npm run build` → outputs to `dist/`
- Preview: `npm run preview`

Deploys automatically on push to `master` via GitHub Actions → Pages using the official `actions/deploy-pages` workflow.

### GitHub Pages base path

`vite.config.ts` attempts to infer the correct `base` from your git remote (repo name). If assets 404 on Pages, set it explicitly in `vite.config.ts`, e.g.:

```ts
export default defineConfig({
  base: "/dead-cat-bounce/",
});
```

### Custom domain

If using a custom domain, add a `public/CNAME` file and configure the domain in the repo’s Pages settings.
