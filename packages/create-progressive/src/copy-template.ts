import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const BINARY_EXTENSIONS = new Set(['.ico', '.png', '.jpg', '.jpeg']);

// npm silently drops any nested `.gitignore` from a published tarball (it
// reads it as packing-exclusion rules, not content) — same reason
// create-react-app/create-next-app ship a dotless `gitignore` in their
// templates and rename it back on scaffold.
const RENAME_ON_COPY: Record<string, string> = {
  gitignore: '.gitignore',
};

/**
 * Recursively copies `templateDir` into `targetDir`, replacing every
 * occurrence of `__APP_NAME__` in text files with `appName`. Binary assets
 * (icons) are copied byte-for-byte, untouched.
 */
export function copyTemplate(
  templateDir: string,
  targetDir: string,
  appName: string,
): void {
  mkdirSync(targetDir, { recursive: true });

  for (const entry of readdirSync(templateDir)) {
    const sourcePath = join(templateDir, entry);
    const destPath = join(targetDir, RENAME_ON_COPY[entry] ?? entry);
    const stat = statSync(sourcePath);

    if (stat.isDirectory()) {
      copyTemplate(sourcePath, destPath, appName);
      continue;
    }

    const isBinary = BINARY_EXTENSIONS.has(
      entry.slice(entry.lastIndexOf('.')),
    );
    if (isBinary) {
      writeFileSync(destPath, readFileSync(sourcePath));
    } else {
      const content = readFileSync(sourcePath, 'utf-8');
      writeFileSync(destPath, content.replaceAll('__APP_NAME__', appName));
    }
  }
}
