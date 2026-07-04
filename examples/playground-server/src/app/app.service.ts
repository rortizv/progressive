import { Injectable } from '@nestjs/common';
import { HealthDto } from './dto/health.dto';
import { BuildInfoDto } from './dto/build-info.dto';

@Injectable()
export class AppService {
  getHealth(): HealthDto {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  getBuildInfo(): BuildInfoDto {
    return {
      randomValue: Math.floor(Math.random() * 1000),
      generatedAt: new Date().toISOString(),
    };
  }
}
