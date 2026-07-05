# @progrest/ssr-nest

Wires a NestJS (Fastify) app to serve a built Angular SSR app for every route
its own controllers don't own. The core "glue" behind
[Progressive](https://github.com/rortizv/progressive) — Angular (SSR) +
NestJS in a single Node.js process.

Usually you don't install this directly — `npm create progressive@latest`
sets it up for you. Documented here for anyone wiring it into an existing
Nest app, or curious how it works.

## Usage

```ts
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { mountAngularSsr } from '@progrest/ssr-nest';
import { join } from 'node:path';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  app.setGlobalPrefix('api');

  // `angularDistPath` is the folder containing your Angular app's `browser/`
  // and `server/` subfolders, produced by `@angular/build:application` with
  // SSR enabled.
  await mountAngularSsr(app, {
    angularDistPath: join(__dirname, '../web'),
  });

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}

bootstrap();
```

Call `mountAngularSsr` after registering your own controllers/modules and
before `app.listen()`. From then on:

- Static browser assets (JS/CSS bundles, favicon) are served directly.
- Any route your own `@Controller()`s don't match falls through to Angular's
  `AngularNodeAppEngine` for SSR rendering.

If `angularDistPath` doesn't exist yet (e.g. you're running Angular's own dev
server, which serves everything in memory and never writes to disk),
`mountAngularSsr` logs a warning and skips mounting instead of throwing —
your Nest app still starts and serves its own routes normally.

## How it works

Two things NestJS does that most integrations don't expect:

1. **Nest always registers its own Fastify not-found handler** on
   `app.listen()`, with no way to opt out. Instead of fighting Fastify's
   single `setNotFoundHandler` slot, `mountAngularSsr` installs a global
   exception filter that catches the `NotFoundException` Nest's default
   handler throws, and renders the Angular page there.
2. **The Angular SSR bundle is pure ESM**, but a Nest app compiled to
   CommonJS can't `require()` it (`ERR_REQUIRE_ESM`). The bridge loads it via
   a real dynamic `import()`, kept invisible to TypeScript's
   commonjs-target transform.

## Requires

- `@nestjs/common`, `@nestjs/platform-fastify`, `fastify` ^11 / ^5 (peer
  dependencies — bring your own, matching your Nest app).
- An Angular app built with SSR enabled (`ssr: true` /
  `outputMode: "server"` in the Angular CLI application builder).

Full write-up: [github.com/rortizv/progressive](https://github.com/rortizv/progressive).
