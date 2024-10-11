import { Controller, Get } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Controller('server-health')
export class ServerHealthController {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  @Get()
  async checkHealth(): Promise<object> {
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
