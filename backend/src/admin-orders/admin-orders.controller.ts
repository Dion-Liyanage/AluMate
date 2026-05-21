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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { OrdersService } from '../orders/orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service';
import { MailService } from '../mail/mail.service';
import { UsersService } from '../users/users.service';

@Controller('admin/orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminOrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly mailService: MailService,
    private readonly usersService: UsersService,
  ) {}

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
  @UseInterceptors(FileInterceptor('quotationPdf'))
  async generateQuotation(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: {
      finalMaterialCost?: string;
      finalLaborCost?: string;
      finalTotalCost?: string;
      adminNotes?: string;
      expectedCompletionDate?: string;
    }
  ) {
    const order = await this.ordersService.findById(id);
    if (!order) {
      return { success: false, message: 'Order not found' };
    }

    const updateData: any = {
      status: 'quotation_sent',
      progress: 15,
      quotationSentAt: new Date(),
    };

    // Parse and apply final costs
    if (body.finalMaterialCost) {
      updateData.finalMaterialCost = parseFloat(body.finalMaterialCost);
    }
    if (body.finalLaborCost) {
      updateData.finalLaborCost = parseFloat(body.finalLaborCost);
    }
    if (body.finalTotalCost) {
      updateData.finalTotalCost = parseFloat(body.finalTotalCost);
    }

    // Upload PDF to Cloudinary if provided
    if (file) {
      try {
        const uploadResult = await this.cloudinaryService.uploadFile(
          file,
          'alumate/quotations',
        );
        updateData.quotationPdfUrl = uploadResult.secure_url;
      } catch (err) {
        console.error('Failed to upload quotation PDF:', err);
      }
    }

    // Append admin notes if provided
    if (body.adminNotes) {
      updateData.notes = [
        ...(order.notes || []),
        { message: body.adminNotes, createdBy: 'Admin', createdAt: new Date() },
      ];
    }

    // Expected completion date
    if (body.expectedCompletionDate) {
      try {
        updateData.expectedCompletionDate = new Date(body.expectedCompletionDate);
      } catch (err) {
        console.warn('Invalid expectedCompletionDate provided', body.expectedCompletionDate);
      }
    }

    const updatedOrder = await this.ordersService.update(id, updateData);

    // Send email notification to customer
    try {
      const customerId = (order.customerId as any)?._id?.toString() || order.customerId?.toString();
      const user = await this.usersService.findById(customerId);
      if (user) {
        this.mailService.sendQuotationReady(
          user.email,
          user.firstName,
          order.orderId,
          updateData.finalTotalCost || order.estimatedPrice || 0,
        ).catch(err => {
          console.error('Failed to send quotation email:', err);
        });
      }
    } catch (err) {
      console.error('Error fetching user for quotation email:', err);
    }

    return {
      success: true,
      message: 'Quotation generated and sent to customer',
      data: updatedOrder
    };
  }

  @Patch(':id/cancel')
  async cancelOrder(@Param('id') id: string) {
    const order = await this.ordersService.findById(id);
    if (!order) {
      return { success: false, message: 'Order not found' };
    }

    const updatedOrder = await this.ordersService.update(id, {
      status: 'cancelled',
    });

    return {
      success: true,
      message: 'Order cancelled',
      data: updatedOrder,
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
