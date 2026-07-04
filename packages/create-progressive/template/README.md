# __APP_NAME__

Built with [Progressive](https://github.com/rortizv/progressive) — Angular
(SSR) + NestJS in a single repo, single Node.js process.

## What's here

- **`apps/web`** — Angular 21.2, SSR, zoneless.
- **`apps/server`** — NestJS 11 + Fastify. The one process that actually runs
  in production: serves `/api/*` itself and uses `@progrest/ssr-nest` to
  host `apps/web`'s SSR engine for every other route.

## Development (hot reload)

```sh
npm install
npm run dev
```

Opens Angular's own dev server (full HMR) on `http://localhost:4200`, with
NestJS running alongside on `http://localhost:3000`. Angular's
`proxy.config.json` forwards `/api/*` to Nest, so from the browser it's one
app on one port.

## Typed API bridge

`npm run generate:api` (also runs automatically before `build`/`dev`) builds
an OpenAPI document from `apps/server`'s NestJS controllers/DTOs, then runs
[orval](https://orval.dev) to generate typed `httpResource` functions into
`apps/web/src/app/api/generated.ts`. Add an endpoint + DTO on the server,
regenerate, and the matching typed function shows up on the Angular side —
no hand-written `fetch`/`HttpClient` calls.

## Production build & run

```sh
npm run build
NG_ALLOWED_HOSTS=localhost npm start
```

Open `http://localhost:3000` — the real single process, no proxy involved.
`NG_ALLOWED_HOSTS` is required: Angular's SSR engine rejects requests from
hosts not on this list and silently falls back to client-only rendering
instead of erroring. Update it to your real domain once you deploy.

## Deploy

See `apprunner.yaml` for an AWS App Runner setup (connect your GitHub repo,
no servers to manage, deploys on every push).
