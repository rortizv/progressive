import { join } from 'node:path';
import fastifyStatic from '@fastify/static';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { getAngularHandler } from './angular-ssr-bridge';
import { AngularFallbackFilter } from './angular-fallback.filter';

export interface MountAngularSsrOptions {
  /**
   * Absolute path to the built Angular app's dist root — the folder that
   * contains the `browser/` and `server/` subfolders produced by
   * `@angular/build:application` with SSR enabled.
   */
  angularDistPath: string;
}

/**
 * Wires a NestJS (Fastify) app to serve an Angular SSR app for every route
 * Nest's own controllers don't own: static browser assets first, then
 * falling back to Angular's `AngularNodeAppEngine` for page rendering.
 *
 * Call this after registering your own controllers/modules and before
 * `app.listen()`.
 */
export async function mountAngularSsr(
  app: NestFastifyApplication,
  options: MountAngularSsrOptions,
): Promise<void> {
  // `wildcard: false` registers routes only for files that exist at startup
  // instead of a catch-all, so page routes still reach the SSR fallback below.
  await app.register(fastifyStatic, {
    root: join(options.angularDistPath, 'browser'),
    prefix: '/',
    wildcard: false,
  });

  const handleWithAngular = await getAngularHandler(
    join(options.angularDistPath, 'server/server.mjs'),
  );
  app.useGlobalFilters(new AngularFallbackFilter(handleWithAngular));
}
