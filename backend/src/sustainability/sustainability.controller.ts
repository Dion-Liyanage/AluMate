import { Body, Controller, Delete, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateMaterialUsageDto } from './dto/create-material-usage.dto';
import { UpdateMaterialUsageDto } from './dto/update-material-usage.dto';
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

  @Get('records')
  async listRecords() {
    return { success: true, data: await this.sustainabilityService.listRecords() };
  }

  @Patch('records/:id')
  async updateRecord(@Param('id') id: string, @Body() body: UpdateMaterialUsageDto) {
    return { success: true, data: await this.sustainabilityService.updateRecord(id, body) };
  }

  @Delete('records/:id')
  async deleteRecord(@Param('id') id: string) {
    await this.sustainabilityService.deleteRecord(id);
    return { success: true, message: 'Material record deleted' };
  }
}
