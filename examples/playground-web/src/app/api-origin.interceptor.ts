import { inject, PLATFORM_ID, REQUEST } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Node's fetch has no implicit origin (unlike a browser's `location`), so a
 * relative call like `/api/health` fails during SSR. This resolves relative
 * API URLs against the incoming request's origin, only on the server.
 */
export const apiOriginInterceptor: HttpInterceptorFn = (req, next) => {
  if (!isPlatformServer(inject(PLATFORM_ID)) || !req.url.startsWith('/')) {
    return next(req);
  }

  const incomingRequest = inject(REQUEST, { optional: true });
  if (!incomingRequest) {
    return next(req);
  }

  const origin = new URL(incomingRequest.url).origin;
  return next(req.clone({ url: origin + req.url }));
};
