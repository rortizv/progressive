# Progressive

Angular (SSR) + NestJS in a single repo, single Node.js process — the idea of
Next.js for the Angular + Nest ecosystem.

Full plan and roadmap: [progressive_plan.md](./progressive_plan.md).

## What's here

An Nx monorepo with:

- **`packages/ssr-nest`** — `@progressive/ssr-nest`, the publishable library.
  One function, `mountAngularSsr(app, { angularDistPath })`, wires a NestJS
  (Fastify) app to serve a built Angular SSR app for every route its own
  controllers don't own.
- **`examples/playground-web`** — Angular 21.2, SSR, zoneless. Builds to
  `dist/examples/playground-web/{browser,server}`.
- **`examples/playground-server`** — NestJS 11 + Fastify. The one process
  that actually runs in production: serves `/api/*` itself and uses
  `@progressive/ssr-nest` to host `playground-web`'s SSR engine for every
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

See `apprunner.yaml` and section 9 of [progressive_plan.md](./progressive_plan.md)
for the AWS App Runner setup (no servers to manage, deploys on every push).
