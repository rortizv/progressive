# Progressive

Angular (SSR) + NestJS in a single repo, single Node.js process — the idea of
Next.js for the Angular + Nest ecosystem.

Full plan and roadmap: [progressive_plan.md](./progressive_plan.md).

## What's here (Fase 0 spike)

An Nx monorepo with two projects under `examples/`:

- **`playground-web`** — Angular 21.2, SSR, zoneless. Builds to
  `dist/examples/playground-web/{browser,server}`.
- **`playground-server`** — NestJS 11 + Fastify. The one process that
  actually runs: it serves `/api/*` itself, serves Angular's static browser
  assets, and hosts Angular's SSR engine for every other route.

## Run it locally

```sh
npm install
npm run build     # builds both playground-web and playground-server
NG_ALLOWED_HOSTS=localhost npm start
```

Then open `http://localhost:3000`. `NG_ALLOWED_HOSTS` is required — Angular's
SSR engine rejects requests from hosts not on this list (anti-SSRF
protection) and silently falls back to client-only rendering instead of
erroring, which is confusing the first time you hit it.

## Deploy

See `apprunner.yaml` and section 9 of [progressive_plan.md](./progressive_plan.md)
for the AWS App Runner setup (no servers to manage, deploys on every push).
