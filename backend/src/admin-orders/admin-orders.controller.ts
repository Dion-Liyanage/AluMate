import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { OrdersService } from '../orders/orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('admin/orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminOrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  async findAll(@Query() query: any) {
    const { status, search, page = 1, limit = 10 } = query;
    const filter: any = {};

    if (status) {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { orderId: { $regex: search, $options: 'i' } },
        { productType: { $regex: search, $options: 'i' } },
      ];
    }

    const orders = await this.ordersService.findAll({ ...filter, page, limit, populate: true });
    return {
      success: true,
      data: orders,
      meta: {
        page: Number(page),
        limit: Number(limit),
      },
    };
  }

  @Get('stats')
  async getStats() {
    const orders = await this.ordersService.findAll({ limit: 1000 });
    
    const stats = {
      totalOrders: orders.length,
      pendingQuotations: orders.filter(o => o.status === 'quotation_pending').length,
      quotationsSent: orders.filter(o => o.status === 'quotation_sent').length,
      activeProductions: orders.filter(o => o.status === 'production').length,
      installations: orders.filter(o => o.status === 'installation').length,
      completed: orders.filter(o => o.status === 'completed').length,
      approved: orders.filter(o => o.status === 'approved').length,
    };

    return {
      success: true,
      data: stats
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const order = await this.ordersService.findById(id);
    if (!order) {
      return { success: false, message: 'Order not found' };
    }
    return {
      success: true,
      data: order
    };
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() updateData: { status: string; progress?: number }
  ) {
    // Map status to progress if not provided
    const statusProgressMap: Record<string, number> = {
      'draft': 0,
      'quotation_pending': 10,
      'quotation_sent': 15,
      'approved': 25,
      'material_preparation': 40,
      'production': 65,
      'installation': 85,
      'completed': 100,
    };

    if (updateData.status && updateData.progress === undefined) {
      updateData.progress = statusProgressMap[updateData.status] || 0;
    }

    const updatedOrder = await this.ordersService.update(id, updateData);
    return {
      success: true,
      data: updatedOrder
    };
  }

  @Post(':id/generate-quotation')
  async generateQuotation(
    @Param('id') id: string,
    @Body() body: {
      recommendedMaterials?: any[];
      laborCalculation?: any;
      estimatedPrice?: number;
      adminNotes?: string;
    }
  ) {
    const order = await this.ordersService.findById(id);
    if (!order) {
      return { success: false, message: 'Order not found' };
    }

    const updateData: any = {
      status: 'quotation_sent',
      progress: 15,
    };

    // Apply admin-provided material/labor data if present
    if (body.recommendedMaterials) {
      updateData.recommendedMaterials = body.recommendedMaterials;
    }
    if (body.laborCalculation) {
      updateData.laborCalculation = body.laborCalculation;
    }
    if (body.estimatedPrice) {
      updateData.estimatedPrice = body.estimatedPrice;
    }
    if (body.adminNotes) {
      updateData.notes = [
        ...(order.notes || []),
        { message: body.adminNotes, createdBy: 'Admin', createdAt: new Date() },
      ];
    }

    const updatedOrder = await this.ordersService.update(id, updateData);
    
    return {
      success: true,
      message: 'Quotation generated and sent to customer',
      data: updatedOrder
    };
  }

  @Delete(':id')
  async deleteOrder(@Param('id') id: string) {
    const result = await this.ordersService.delete(id);
    return {
      success: true,
      message: 'Order deleted',
      data: result,
    };
  }
}
