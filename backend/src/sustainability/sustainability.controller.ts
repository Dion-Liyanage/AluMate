import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateMaterialUsageDto } from './dto/create-material-usage.dto';
import { SustainabilityService } from './sustainability.service';

@Controller('admin/sustainability')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class SustainabilityController {
  constructor(private readonly sustainabilityService: SustainabilityService) {}

  @Get('dashboard')
  async getDashboard() {
    return {
      success: true,
      data: await this.sustainabilityService.getDashboard(),
    };
  }

  @Post('material-usage')
  async createMaterialUsage(@Body() body: CreateMaterialUsageDto, @Request() req) {
    return {
      success: true,
      data: await this.sustainabilityService.createMaterialUsage(body, req.user.id),
    };
  }
}
