import 'reflect-metadata';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from '../src/app/app.module';

/**
 * Builds the OpenAPI document without starting an HTTP listener, so it can
 * run as a fast build step (`npm run generate:api`) instead of requiring the
 * Nest server to already be running.
 */
async function main() {
  const app = await NestFactory.create(AppModule, new FastifyAdapter(), {
    logger: false,
  });
  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('__APP_NAME__ API')
    .setVersion('0.0.1')
    .build();
  const document = SwaggerModule.createDocument(app, config);

  const outputPath = join(__dirname, '../openapi.json');
  writeFileSync(outputPath, JSON.stringify(document, null, 2));
  console.log(`OpenAPI document written to ${outputPath}`);

  await app.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
