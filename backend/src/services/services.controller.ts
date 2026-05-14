import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ServicesService } from './services.service';
import { CreateOnSiteVisitDto } from './dto/create-onsite-visit.dto';
import { CreateRepairDto } from './dto/create-repair.dto';
import { UpdateServiceStatusDto } from './dto/update-service-status.dto';
import { UpdateVisitScheduleDto } from './dto/update-visit-schedule.dto';
import { UpsertServiceAvailabilityDto } from './dto/upsert-service-availability.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service';

@Controller('services')
export class ServicesController {
  constructor(
    private readonly servicesService: ServicesService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CUSTOMER ENDPOINTS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * POST /api/v1/services/on-site-visit
   */
  @Post('on-site-visit')
  @UseGuards(JwtAuthGuard)
  async createOnSiteVisit(
    @Request() req: any,
    @Body() dto: CreateOnSiteVisitDto,
  ) {
    const userId = req.user.id;
    const userName = `${req.user.firstName} ${req.user.lastName}`;

    const request = await this.servicesService.createOnSiteVisit(
      userId,
      userName,
      dto,
    );

    return {
      success: true,
      message: 'On-site visit request submitted successfully',
      data: { serviceRequest: request },
    };
  }

  /**
   * POST /api/v1/services/repair
   */
  @Post('repair')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    }),
  )
  async createRepair(
    @Request() req: any,
    @Body() dto: CreateRepairDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const userId = req.user.id;
    const userName = `${req.user.firstName} ${req.user.lastName}`;
    
    let imageUrl = undefined;
    if (file) {
      const uploadResult = await this.cloudinaryService.uploadFile(file, 'alumate/services');
      imageUrl = uploadResult.secure_url;
    }

    const request = await this.servicesService.createRepair(
      userId,
      userName,
      dto,
      imageUrl,
    );

    return {
      success: true,
      message: 'Repair request submitted successfully',
      data: { serviceRequest: request },
    };
  }

  /**
   * GET /api/v1/services/my-requests
   */
  @Get('my-requests')
  @UseGuards(JwtAuthGuard)
  async getMyRequests(@Request() req: any) {
    const requests = await this.servicesService.findByCustomerId(req.user.id);
    return {
      success: true,
      data: { serviceRequests: requests, total: requests.length },
    };
  }

  /**
   * PATCH /api/v1/services/:id/cancel
   */
  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard)
  async cancelMyRequest(@Request() req: any, @Param('id') id: string) {
    const updated = await this.servicesService.cancelByCustomer(id, req.user.id);

    return {
      success: true,
      message: 'Service request cancelled successfully',
      data: { serviceRequest: updated },
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ADMIN ENDPOINTS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async findAll(
    @Query('serviceType') serviceType?: string,
    @Query('status') status?: string,
  ) {
    const requests = await this.servicesService.findAll({
      serviceType,
      status,
    });
    return {
      success: true,
      data: { serviceRequests: requests, total: requests.length },
    };
  }

  @Get('availability')
  @UseGuards(JwtAuthGuard)
  async getAvailability(@Query('date') date?: string) {
    if (!date) {
      const dates = await this.servicesService.getAvailabilityDates();
      return {
        success: true,
        data: { dates },
      };
    }

    const slots = await this.servicesService.getAvailabilityByDate(date);
    return {
      success: true,
      data: { date, slots },
    };
  }

  @Get('availability/dates')
  @UseGuards(JwtAuthGuard)
  async getAvailabilityDates() {
    const dates = await this.servicesService.getAvailabilityDates();
    return {
      success: true,
      data: { dates },
    };
  }

  @Get('availability/config')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getConfiguredAvailability(@Query('date') date: string) {
    const slots = await this.servicesService.getConfiguredAvailabilityByDate(date);
    return {
      success: true,
      data: { date, slots },
    };
  }

  @Get('availability/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getAllAvailability() {
    const records = await this.servicesService.getAllAvailability();
    return {
      success: true,
      data: { availability: records, total: records.length },
    };
  }

  @Post('availability')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async upsertAvailability(@Body() dto: UpsertServiceAvailabilityDto) {
    const record = await this.servicesService.upsertAvailability(dto);
    return {
      success: true,
      message: 'Service availability saved successfully',
      data: { availability: record },
    };
  }

  @Delete('availability/:date')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async deleteAvailability(@Param('date') date: string) {
    await this.servicesService.deleteAvailability(date);
    return {
      success: true,
      message: 'Service availability deleted successfully',
    };
  }

  @Post('availability/delete')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async deleteAvailabilityViaPost(@Body('date') date: string) {
    await this.servicesService.deleteAvailability(date);
    return {
      success: true,
      message: 'Service availability deleted successfully',
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string) {
    const request = await this.servicesService.findById(id);
    return {
      success: true,
      data: { serviceRequest: request },
    };
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateServiceStatusDto,
  ) {
    const updated = await this.servicesService.updateStatus(id, dto);
    return {
      success: true,
      message: `Service request status updated to "${dto.status}"`,
      data: { serviceRequest: updated },
    };
  }

  @Patch(':id/schedule')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async updateVisitSchedule(
    @Param('id') id: string,
    @Body() dto: UpdateVisitScheduleDto,
  ) {
    const updated = await this.servicesService.updateVisitSchedule(id, dto);
    return {
      success: true,
      message: 'Visit schedule updated successfully',
      data: { serviceRequest: updated },
    };
  }
}
