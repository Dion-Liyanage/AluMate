import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getRoot() {
    return {
      message: 'AluMate Backend is running 🚀',
      version: '1.0.0',
      status: 'OK',
      api: '/api/v1',
    };
  }
}
