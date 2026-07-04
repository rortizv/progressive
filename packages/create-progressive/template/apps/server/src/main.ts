import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { join } from 'node:path';
import { mountAngularSsr } from '@progressive/ssr-nest';
import { AppModule } from './app/app.module';

// The Angular app builds into a sibling folder under the shared workspace
// `dist/` root; this process hosts both.
const angularDist = join(__dirname, '../web');

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  app.setGlobalPrefix('api');

  await mountAngularSsr(app, { angularDistPath: angularDist });

  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  await app.listen(port, '0.0.0.0');
  Logger.log(`🚀 __APP_NAME__ running on http://localhost:${port}`);
}

bootstrap();
