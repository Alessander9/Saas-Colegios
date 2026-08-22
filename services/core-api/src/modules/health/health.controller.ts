import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('System')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  check() {
    return {
      status: 'ok',
      service: 'cole-core-api',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
