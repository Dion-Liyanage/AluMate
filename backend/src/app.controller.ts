import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Controller()
export class AppController {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  @Get()
  getRoot() {
    return {
      message: 'AluMate Backend is running 🚀',
      version: '1.0.0',
      status: 'OK',
      api: '/api/v1',
    };
  }

  /** Used by Render health checks and uptime pingers. */
  @Get('health')
  getHealth() {
    // Mongoose readyState: 1 = connected
    const dbConnected = this.connection.readyState === 1;
    const body = {
      status: dbConnected ? 'ok' : 'degraded',
      database: dbConnected ? 'connected' : 'disconnected',
      uptime: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    };
    if (!dbConnected) throw new ServiceUnavailableException(body);
    return body;
  }
}
