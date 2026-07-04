import type { IncomingMessage, ServerResponse } from 'node:http';

export type HandleWithAngular = (
  req: IncomingMessage,
  res: ServerResponse,
) => Promise<boolean>;

interface AngularServerModule {
  handleWithAngular: HandleWithAngular;
}

// TypeScript compiles `import()` to `require()` under "module": "commonjs",
// but the Angular server bundle is pure ESM (.mjs) and require() cannot load
// it (ERR_REQUIRE_ESM). Hiding the call behind `new Function` keeps it out of
// TS's transform so Node's native dynamic import runs instead.
const dynamicImport = new Function('specifier', 'return import(specifier)') as (
  specifier: string,
) => Promise<AngularServerModule>;

const handlerCache = new Map<string, Promise<HandleWithAngular>>();

/**
 * Loads the `handleWithAngular` function exported by a built Angular SSR
 * bundle (see `createAngularSsrEntry` in this package). Cached per entry
 * path, since `AngularNodeAppEngine` is meant to be a process-wide singleton.
 */
export function getAngularHandler(
  angularServerEntry: string,
): Promise<HandleWithAngular> {
  let handler = handlerCache.get(angularServerEntry);
  if (!handler) {
    handler = dynamicImport(angularServerEntry).then((m) => m.handleWithAngular);
    handlerCache.set(angularServerEntry, handler);
  }
  return handler;
}
