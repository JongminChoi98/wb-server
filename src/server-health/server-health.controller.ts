import { Controller, Get } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Connection } from 'mongoose';

interface HealthStatus {
  status: string;
  database: string;
  uptime: number;
  timestamp: string;
}

@ApiTags('Server Health')
@Controller('server-health')
export class ServerHealthController {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  @ApiOperation({ summary: 'Check server health status' })
  @ApiResponse({
    status: 200,
    description: 'Server health status retrieved successfully.',
  })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  @Get()
  async checkHealth(): Promise<HealthStatus> {
    const getDatabaseStatus = (state: number): string => {
      switch (state) {
        case 0:
          return 'disconnected';
        case 1:
          return 'connected';
        case 2:
          return 'connecting';
        case 3:
          return 'disconnecting';
        default:
          return 'unknown';
      }
    };

    const dbStatus = getDatabaseStatus(this.connection.readyState);
    return {
      status: 'ok',
      database: dbStatus,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }
}
