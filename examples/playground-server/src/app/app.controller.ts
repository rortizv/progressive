import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { HealthDto } from './dto/health.dto';
import { BuildInfoDto } from './dto/build-info.dto';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  @ApiOperation({ summary: 'Health check' })
  @ApiOkResponse({ type: HealthDto })
  getHealth(): HealthDto {
    return this.appService.getHealth();
  }

  // ISR-style caching: the response is computed once, then served straight
  // from Nest's CacheInterceptor for 10s before regenerating — same trade-off
  // as Next.js's Incremental Static Regeneration, done with a plain Nest
  // interceptor instead of a framework-specific cache primitive.
  @Get('build-info')
  @ApiOperation({ summary: 'Random value, cached for 10s (ISR-style)' })
  @ApiOkResponse({ type: BuildInfoDto })
  @UseInterceptors(CacheInterceptor)
  @CacheKey('build-info')
  @CacheTTL(10_000)
  getBuildInfo(): BuildInfoDto {
    return this.appService.getBuildInfo();
  }
}
