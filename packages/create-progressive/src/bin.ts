#!/usr/bin/env node
import { existsSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { copyTemplate } from './copy-template';

function sanitizeName(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function main() {
  const rawArg = process.argv[2];
  if (!rawArg) {
    console.error('Usage: create-progressive <app-name>');
    process.exit(1);
  }

  const appName = sanitizeName(rawArg);
  if (!appName) {
    console.error(`"${rawArg}" isn't a usable project name.`);
    process.exit(1);
  }

  const targetDir = resolve(process.cwd(), appName);
  if (existsSync(targetDir) && readdirSync(targetDir).length > 0) {
    console.error(`"${appName}" already exists and isn't empty.`);
    process.exit(1);
  }

  const templateDir = join(__dirname, '../template');
  copyTemplate(templateDir, targetDir, appName);

  console.log(`\nCreated ${appName}/\n`);
  console.log('Next steps:');
  console.log(`  cd ${appName}`);
  console.log('  npm install');
  console.log('  npm run dev');
  console.log(
    '\nThat starts Angular (with HMR) on :4200 and NestJS on :3000, proxied together.',
  );
}

main();
