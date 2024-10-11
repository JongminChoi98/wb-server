import { Module } from '@nestjs/common';
import { ServerHealthController } from './server-health.controller';

@Module({
  controllers: [ServerHealthController]
})
export class ServerHealthModule {}
