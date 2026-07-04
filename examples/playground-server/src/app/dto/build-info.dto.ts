import { ApiProperty } from '@nestjs/swagger';

export class BuildInfoDto {
  @ApiProperty({ example: 42, description: 'A random number, cached for 10s' })
  randomValue!: number;

  @ApiProperty({ example: '2026-07-04T21:08:13.774Z' })
  generatedAt!: string;
}
