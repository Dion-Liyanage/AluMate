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
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { ServicesService } from './services.service';
import { CreateOnSiteVisitDto } from './dto/create-onsite-visit.dto';
import { CreateRepairDto } from './dto/create-repair.dto';
import { UpdateServiceStatusDto } from './dto/update-service-status.dto';
import { UpdateVisitScheduleDto } from './dto/update-visit-schedule.dto';
import { UpsertServiceAvailabilityDto } from './dto/upsert-service-availability.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  // ── Helper: Ensure uploads directory exists ──
  private static getUploadDestination() {
    const uploadDir = join(__dirname, '..', '..', 'uploads', 'services');
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }
    return uploadDir;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CUSTOMER ENDPOINTS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * POST /api/v1/services/on-site-visit
   * Customer submits an on-site visit request
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
   * Customer submits a repair request (with optional image upload)
   */
  @Post('repair')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          cb(null, ServicesController.getUploadDestination());
        },
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `repair-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    }),
  )
  async createRepair(
    @Request() req: any,
    @Body() dto: CreateRepairDto,
    @UploadedFile() file?: any,
  ) {
    const userId = req.user.id;
    const userName = `${req.user.firstName} ${req.user.lastName}`;
    const imageUrl = file ? `/uploads/services/${file.filename}` : undefined;

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
   * Customer fetches their own service requests
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
   * Customer cancels their own request (soft cancel)
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

  /**
   * GET /api/v1/services
   * Admin fetches all service requests (with optional filters)
   */
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

  /**
   * GET /api/v1/services/availability?date=YYYY-MM-DD
   * Get available (not-booked) time slots for a date
   */
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

  /**
   * GET /api/v1/services/availability/dates
   * Get dates that currently have at least one available slot
   */
  @Get('availability/dates')
  @UseGuards(JwtAuthGuard)
  async getAvailabilityDates() {
    const dates = await this.servicesService.getAvailabilityDates();
    return {
      success: true,
      data: { dates },
    };
  }

  /**
   * GET /api/v1/services/availability/config?date=YYYY-MM-DD
   * Admin gets configured slots (including booked ones)
   */
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

  /**
   * GET /api/v1/services/availability/all
   * Admin gets all configured availability records
   */
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

  /**
   * POST /api/v1/services/availability
   * Admin creates or updates available slots for a date
   */
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

  /**
   * DELETE /api/v1/services/availability/:date
   * Admin deletes configured slots for a date
   */
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

  /**
   * POST /api/v1/services/availability/delete
   * Admin deletes configured slots for a date (fallback for clients where DELETE may be blocked)
   */
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

  /**
   * GET /api/v1/services/:id
   * Admin fetches a single service request by ID
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string) {
    const request = await this.servicesService.findById(id);
    return {
      success: true,
      data: { serviceRequest: request },
    };
  }

  /**
   * PATCH /api/v1/services/:id/status
   * Admin updates the status of a service request
   */
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

  /**
   * PATCH /api/v1/services/:id/schedule
   * Admin updates date and time slot of an on-site visit request
   */
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
