import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  NotFoundException,
} from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { HandleWithAngular } from './angular-ssr-bridge';

/**
 * NestJS always registers its own Fastify not-found handler on `app.listen()`
 * (unconditionally, with no opt-out), which throws `NotFoundException` for
 * any unmatched route. Catching that exception here — instead of fighting
 * Fastify's single `setNotFoundHandler` slot directly — lets Angular's SSR
 * engine render the page for any route Nest's own controllers don't own.
 */
@Catch(NotFoundException)
export class AngularFallbackFilter implements ExceptionFilter {
  constructor(private readonly handleWithAngular: HandleWithAngular) {}

  async catch(_exception: NotFoundException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<FastifyRequest>();
    const reply = ctx.getResponse<FastifyReply>();

    reply.hijack();
    const handled = await this.handleWithAngular(request.raw, reply.raw);
    if (!handled) {
      reply.raw.statusCode = 404;
      reply.raw.setHeader('Content-Type', 'application/json');
      reply.raw.end(JSON.stringify({ statusCode: 404, message: 'Not found' }));
    }
  }
}
