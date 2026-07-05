# create-progressive

The scaffolder for [Progressive](https://github.com/rortizv/progressive) —
Angular (SSR) + NestJS in a single repo, single Node.js process. The idea of
Next.js, for the Angular + Nest ecosystem.

## Usage

```sh
npm create progressive@latest my-app
cd my-app
npm install
npm run dev
```

That's it — you get:

- **Angular 21 (SSR, zoneless)** + **NestJS 11 (Fastify)**, running as a
  single Node.js process in production.
- A **typed API bridge**: `npm run generate:api` turns your Nest
  controllers/DTOs into typed Angular `httpResource` functions automatically
  (via `@nestjs/swagger` + [orval](https://orval.dev)) — no hand-written
  `fetch`/`HttpClient` calls, no duplicated response types.
- **HMR in dev** (`npm run dev`): Angular's own dev server on `:4200` with
  full hot reload, NestJS on `:3000`, proxied together so it feels like one
  app on one port.
- An `apprunner.yaml` ready for a one-click AWS App Runner deploy.

## Why

Next.js works because React and its bundler are co-designed to blur the
front-end/back-end line. Angular and NestJS were never designed together —
`@progrest/ssr-nest` (the library this scaffolds on top of) is the missing
glue: it mounts Angular's SSR engine inside a NestJS (Fastify) host, so one
process serves both your API and your rendered pages.

Full write-up of how it works and why: [github.com/rortizv/progressive](https://github.com/rortizv/progressive).
