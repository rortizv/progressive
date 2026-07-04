import {
  AngularNodeAppEngine,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import type { IncomingMessage, ServerResponse } from 'node:http';

const angularApp = new AngularNodeAppEngine();

/**
 * Renders the Angular app for a Node request/response pair and writes the
 * result directly to `res`. Returns `false` when Angular has no matching
 * route, so the host server (NestJS) can fall through to its own 404.
 */
export async function handleWithAngular(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<boolean> {
  const response = await angularApp.handle(req);
  if (!response) {
    return false;
  }

  await writeResponseToNodeResponse(response, res);
  return true;
}
