import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import fastifyStatic from '@fastify/static';
import { join } from 'node:path';
import { AppModule } from './app/app.module';
import { getAngularHandler } from './angular-ssr-bridge';
import { AngularFallbackFilter } from './angular-fallback.filter';

// playground-web (Angular) builds into a sibling folder under the shared
// workspace `dist/` root; this process hosts both.
const angularDist = join(__dirname, '../playground-web');

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  app.setGlobalPrefix('api');

  // Static browser assets (JS/CSS bundles, favicon). `wildcard: false` makes
  // this register routes only for files that exist at startup, instead of a
  // catch-all — so page routes still fall through to the SSR filter below.
  await app.register(fastifyStatic, {
    root: join(angularDist, 'browser'),
    prefix: '/',
    wildcard: false,
  });

  const handleWithAngular = await getAngularHandler(
    join(angularDist, 'server/server.mjs'),
  );
  app.useGlobalFilters(new AngularFallbackFilter(handleWithAngular));

  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  await app.listen(port, '0.0.0.0');
  Logger.log(`🚀 Progressive playground running on http://localhost:${port}`);
}

bootstrap();
