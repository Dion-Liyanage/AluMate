import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { QuotationsService } from './quotations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('quotations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class QuotationsController {
  constructor(private readonly quotationsService: QuotationsService) {}

  @Get()
  async getMyQuotations(@Request() req, @Query() query: any) {
    const customerId = req.user.id;
    const quotations = await this.quotationsService.findByCustomerId(customerId);
    return {
      success: true,
      data: {
        quotations,
        total: quotations.length,
      },
    };
  }

  @Post('request')
  async requestQuotation(@Body() body: any, @Request() req) {
    const customerId = req.user.id;
    const quoteNumber = `QT-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    
    const newQuotation = await this.quotationsService.create({
      ...body,
      customerId,
      quoteNumber,
      status: 'pending',
    });

    return {
      success: true,
      data: { quotation: newQuotation },
    };
  }

  @Get(':id')
  async getQuotationDetails(@Param('id') id: string, @Request() req) {
    const userId = req.user.id;
    const quotation = await this.quotationsService.findById(id);

    if (quotation && quotation.customerId.toString() !== userId) {
      return { success: false, message: 'Unauthorized' };
    }

    return {
      success: true,
      data: { quotation },
    };
  }

  @Patch(':id/accept')
  async acceptQuotation(@Param('id') id: string, @Request() req) {
    const userId = req.user.id;
    const quotation = await this.quotationsService.findById(id);

    if (!quotation || quotation.customerId.toString() !== userId) {
      return { success: false, message: 'Unauthorized' };
    }

    return this.quotationsService.update(id, { status: 'accepted' });
  }

  @Patch(':id/reject')
  async rejectQuotation(@Param('id') id: string, @Request() req) {
    const userId = req.user.id;
    const quotation = await this.quotationsService.findById(id);

    if (!quotation || quotation.customerId.toString() !== userId) {
      return { success: false, message: 'Unauthorized' };
    }

    return this.quotationsService.update(id, { status: 'rejected' });
  }
}
