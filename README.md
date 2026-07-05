# Progressive

<p>
  <img src="examples/playground-web/public/angular.png" alt="Angular" height="48" />
  <img src="examples/playground-web/public/nestjs.svg" alt="NestJS" height="48" />
</p>

**A full-stack framework for Angular and NestJS.** Progressive mounts
Angular's server-side rendering engine directly inside a NestJS (Fastify)
server, so one repo and one build produce a single deployable unit: in
production, **one Node.js process** serves your API and your rendered pages
together — no separate front-end host to run, no CORS to configure, no
second server to deploy.

Underneath, it's real NestJS — controllers, dependency injection, guards,
modules, not a stripped-down backend — paired with Angular SSR and zoneless
change detection. A typed bridge connects the two automatically: your API's
response shapes show up on the Angular side with no hand-written HTTP client
code to write or keep in sync.

## Quick start

```sh
npm create progressive@latest my-app
cd my-app
npm install
npm run dev
```

That's it. `npm run dev` opens `http://localhost:4200` with Angular's real
dev server (full hot reload) and NestJS running alongside on `:3000`,
proxied together — from the browser it's one app on one port. It also frees
those two ports first if a previous run is still holding them, so re-running
`npm run dev` never hangs waiting on a port-conflict prompt. For production,
`npm run build && npm start` gives you the real single process on `:3000`,
ready to deploy anywhere Node.js runs (an `apprunner.yaml` is included for a
one-click AWS App Runner setup).

See [`create-progressive`'s README](./packages/create-progressive/README.md)
for what the generated project looks like, and
[`@progrest/ssr-nest`'s README](./packages/ssr-nest/README.md) if you want to
wire the SSR bridge into an existing NestJS app by hand instead of
scaffolding a new one.

## How it works

- **One process, no framework-specific magic beyond routing.** NestJS's
  Fastify server owns every request: its own `@Controller()`s handle
  `/api/*`, and anything they don't own falls through to Angular's
  `AngularNodeAppEngine` for SSR.
- **Typed API bridge, no manual HTTP types.** `npm run generate:api` turns
  your Nest controllers/DTOs into an OpenAPI document (`@nestjs/swagger`),
  then generates typed Angular `httpResource` functions from it
  ([orval](https://orval.dev)) — add an endpoint, regenerate, and the
  matching typed function shows up on the Angular side automatically.
- **Render mode per route.** Mix `RenderMode.Server` (fresh SSR every
  request) and `RenderMode.Prerender` (built once, served as a static file
  forever) freely across your routes — static marketing pages and
  dynamic, data-driven ones in the same app.
- **`@defer` and response caching work as they do in any Angular/Nest app.**
  Progressive doesn't get in the way of either — incremental hydration via
  `@defer`, and time-based response caching via a plain Nest
  `CacheInterceptor`, need no special wiring.

## Repo structure (this monorepo)

An Nx workspace:

- **`packages/ssr-nest`** — [`@progrest/ssr-nest`](https://www.npmjs.com/package/@progrest/ssr-nest),
  the publishable library behind the SSR bridge (one function,
  `mountAngularSsr(app, { angularDistPath })`).
- **`packages/create-progressive`** — [`create-progressive`](https://www.npmjs.com/package/create-progressive),
  the scaffolder used by `npm create progressive@latest`.
- **`examples/playground-web`** + **`examples/playground-server`** — the
  reference app used to develop and dogfood the two packages above.

## Developing this repo

If you're working on Progressive itself (not just using it):

```sh
npm install
npm run dev              # playground-web + playground-server, hot reload, as above
npm run build            # production build of both
npx nx test playground-web   # unit tests
npx nx run-many -t eslint:lint -p playground-server,ssr-nest,create-progressive
```

We deliberately did **not** try to embed Angular's dev server as middleware
inside the Nest process (the "one port" ideal, even in dev) —
`@angular/build`'s dev-server internals that would make that possible aren't
part of its public API, so depending on them would break on any Angular
patch release. Two processes + a proxy is the same trade-off Nx itself makes
for mixed Angular/Node workspaces, and it costs nothing in production.

A couple of non-obvious things worth knowing if you touch the render-mode
code: a component field like `new Date().toISOString()` computed directly in
the constructor gets **recomputed on the client during hydration** (only the
DOM is reused, not the JS instance), silently overwriting a frozen
prerendered value a moment after load — `about-page.ts` uses Angular's
`TransferState` to carry the server-computed value across the hydration
boundary instead.
