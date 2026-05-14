import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  async getMyOrders(@Request() req, @Query() query: any) {
    const customerId = req.user.id;
    const filter = { customerId, ...query };
    const orders = await this.ordersService.findAll(filter);
    return {
      success: true,
      data: { orders, total: orders.length },
    };
  }

  @Post()
  async createOrder(@Body() body: any, @Request() req) {
    const customerId = req.user.id;
    const orderId = `ORD-${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`;
    
    const newOrder = await this.ordersService.create({
      ...body,
      customerId,
      orderId,
      status: 'quotation_pending',
    });

    return {
      success: true,
      data: { order: newOrder },
    };
  }

  @Get(':id')
  async getOrderDetails(@Param('id') id: string, @Request() req) {
    const userId = req.user.id;
    const order = await this.ordersService.findById(id);
    
    // Security check: ensure user owns the order
    if (order && order.customerId.toString() !== userId) {
      return { success: false, message: 'Unauthorized' };
    }
    
    return order;
  }

  @Patch(':id/approve')
  async approveQuotation(@Param('id') id: string, @Request() req) {
    const userId = req.user.id;
    const order = await this.ordersService.findById(id);

    if (!order || order.customerId.toString() !== userId) {
      return { success: false, message: 'Unauthorized' };
    }

    if (order.status !== 'quotation_sent') {
      return { success: false, message: 'No active quotation to approve' };
    }

    return this.ordersService.update(id, { 
      status: 'approved',
      progress: 25 
    });
  }

  @Patch(':id/cancel')
  async cancelOrder(@Param('id') id: string, @Request() req) {
    const userId = req.user.id;
    const order = await this.ordersService.findById(id);

    if (!order || order.customerId.toString() !== userId) {
      return { success: false, message: 'Unauthorized' };
    }

    // Only allow cancellation if not already in production or completed
    const nonCancellable = ['production', 'installation', 'completed'];
    if (nonCancellable.includes(order.status)) {
      return { success: false, message: 'Order cannot be cancelled at this stage' };
    }

    return this.ordersService.update(id, { status: 'cancelled' });
  }
}
