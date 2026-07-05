# Progressive

<p>
  <img src="examples/playground-web/public/angular.png" alt="Angular" height="48" />
  <img src="examples/playground-web/public/nestjs.svg" alt="NestJS" height="48" />
</p>

Angular (SSR) + NestJS in a single repo, single Node.js process — the idea of
Next.js for the Angular + Nest ecosystem.

## What's here

An Nx monorepo with:

- **`packages/ssr-nest`** — `@progrest/ssr-nest`, the publishable library.
  One function, `mountAngularSsr(app, { angularDistPath })`, wires a NestJS
  (Fastify) app to serve a built Angular SSR app for every route its own
  controllers don't own.
- **`packages/create-progressive`** — the scaffolder. Once published, a dev
  runs `npm create progressive@latest my-app` and gets a trimmed copy of
  `examples/playground-web` + `playground-server` (Angular SSR + Nest + the
  typed API bridge), renamed and ready for `npm install && npm run dev`.
- **`examples/playground-web`** — Angular 21.2, SSR, zoneless. Builds to
  `dist/examples/playground-web/{browser,server}`.
- **`examples/playground-server`** — NestJS 11 + Fastify. The one process
  that actually runs in production: serves `/api/*` itself and uses
  `@progrest/ssr-nest` to host `playground-web`'s SSR engine for every
  other route.

## Development (hot reload)

```sh
npm install
npm run dev
```

This runs Angular's own dev server (with full HMR) on `http://localhost:4200`
and NestJS on `http://localhost:3000` side by side. Angular's `proxy.config.json`
forwards `/api/*` to Nest, so from the browser it feels like one app on one
port — open `http://localhost:4200`. Editing UI code hot-reloads instantly;
editing Nest code rebuilds and restarts the API process automatically.

We deliberately did **not** try to embed Angular's dev server as middleware
inside the Nest process (the "one port" ideal) — `@angular/build`'s dev-server
internals that would make that possible aren't part of its public API, so
depending on them would break on any Angular patch release. Two processes +
a proxy is the same trade-off Nx itself makes for mixed Angular/Node
workspaces, and it costs nothing in production (see below).

## Typed API bridge (no manual HTTP types)

`npm run generate:api` (also runs automatically before `build` and `dev`) does:

1. Boots the Nest app just long enough to build its OpenAPI document via
   `@nestjs/swagger` (`examples/playground-server/scripts/generate-openapi.ts`),
   writing `examples/playground-server/openapi.json`.
2. Runs [orval](https://orval.dev) (`orval.config.ts`) against that spec to
   generate `examples/playground-web/src/app/api/generated.ts` — typed
   `httpResource`-based functions, one per Nest endpoint.

The Angular side never hand-writes a `fetch`/`HttpClient` call or duplicates a
response type; both files are gitignored build artifacts. Add an endpoint +
DTO in `playground-server`, regenerate, and the exact matching type/function
shows up on the Angular side automatically.

## Render ergonomics (render modes, `@defer`, ISR-style caching)

- **Render mode per route** (`app.routes.server.ts`): `/` uses
  `RenderMode.Server` (fresh SSR + a fresh `/api/health` call on every
  request); `/about` uses `RenderMode.Prerender` (rendered once at build
  time, served as a static file forever — reload it all you want, the
  timestamp never changes). A real app mixes both freely, per route.
- **`@defer`**: the home page's "Under the hood" section is
  `@defer (on interaction(...))` — its code isn't in the initial JS bundle or
  SSR payload, only fetched once you click the reveal button.
- **ISR-style caching**: `GET /api/build-info` is wrapped in Nest's plain
  `CacheInterceptor` with a 10s TTL — same trade-off as Next.js's Incremental
  Static Regeneration, done with a framework-native interceptor instead of a
  bespoke cache primitive.

Gotcha worth knowing if you touch these: a component field like
`new Date().toISOString()` computed directly in the constructor gets
**recomputed on the client during hydration** (only the DOM is reused, not
the JS instance), silently overwriting the frozen prerendered value a moment
after load. `about-page.ts` uses Angular's `TransferState` to carry the
server-computed value across the hydration boundary instead.

## Production build & run

```sh
npm run build     # builds both playground-web and playground-server
NG_ALLOWED_HOSTS=localhost npm start
```

Then open `http://localhost:3000` — this time it's the *real* single process,
no proxy involved. `NG_ALLOWED_HOSTS` is required — Angular's SSR engine
rejects requests from hosts not on this list (anti-SSRF protection) and
silently falls back to client-only rendering instead of erroring, which is
confusing the first time you hit it.

## Deploy

See `apprunner.yaml` for the AWS App Runner setup (no servers to manage,
deploys on every push).
