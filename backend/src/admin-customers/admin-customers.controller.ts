import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { OrdersService } from '../orders/orders.service';
import { ServicesService } from '../services/services.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Controller('admin/customers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminCustomersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly ordersService: OrdersService,
    private readonly servicesService: ServicesService,
  ) {}

  /**
   * GET /api/v1/admin/customers
   * Fetch all customers with optional search and filter
   *
   * Query params:
   *   search  — match against firstName, lastName, email, or phone
   *   isActive — filter by active status (true/false)
   *   page    — page number (1-based)
   *   limit   — items per page
   */
  @Get()
  async getAllCustomers(
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    // Build filter for customers only (role = 'customer')
    const filter: Record<string, any> = { role: 'customer' };

    // Active / Inactive filter
    if (isActive !== undefined && isActive !== '') {
      filter.isActive = isActive === 'true';
    }

    // Search across name, email, phone
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
      ];
    }

    // Fetch matching customers from DB
    const allCustomers = await this.usersService.findWithFilter(filter);

    // Compute totalOrders for each customer by counting from orders collection
    const customersWithStats = await Promise.all(
      allCustomers.map(async (customer) => {
        const customerObj = customer.toObject();
        const orders = await this.ordersService.findAll({
          customerId: customerObj._id,
        });
        return {
          ...customerObj,
          totalOrders: orders.length,
        };
      }),
    );

    // Pagination
    const pageNum = Math.max(1, parseInt(page || '1', 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit || '100', 10) || 100));
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedCustomers = customersWithStats.slice(
      startIndex,
      startIndex + limitNum,
    );

    return {
      success: true,
      data: {
        customers: paginatedCustomers,
        total: customersWithStats.length,
      },
    };
  }

  /**
   * GET /api/v1/admin/customers/:id
   * Fetch single customer details with orders and service requests
   */
  @Get(':id')
  async getCustomerById(@Param('id') id: string) {
    const customer = await this.usersService.findById(id);
    if (!customer) {
      throw new NotFoundException(`Customer with ID "${id}" not found`);
    }

    // Verify it's a customer, not an admin
    if (customer.role !== 'customer') {
      throw new BadRequestException('The specified user is not a customer');
    }

    // Fetch associated orders
    const orders = await this.ordersService.findByCustomerId(id);

    // Fetch associated service requests
    const serviceRequests = await this.servicesService.findByCustomerId(id);

    return {
      success: true,
      data: {
        customer: customer.toObject(),
        orders,
        serviceRequests,
      },
    };
  }

  /**
   * PATCH /api/v1/admin/customers/:id
   * Update customer data (primarily for toggling isActive status)
   */
  @Patch(':id')
  async updateCustomer(
    @Param('id') id: string,
    @Body() updateData: UpdateCustomerDto,
  ) {
    const customer = await this.usersService.findById(id);
    if (!customer) {
      throw new NotFoundException(`Customer with ID "${id}" not found`);
    }

    if (customer.role !== 'customer') {
      throw new BadRequestException('The specified user is not a customer');
    }

    // Build update payload from validated DTO fields
    const allowedFields: Record<string, any> = {};
    if (updateData.isActive !== undefined) {
      allowedFields.isActive = updateData.isActive;
    }
    if (updateData.phone !== undefined) {
      allowedFields.phone = updateData.phone;
    }
    if (updateData.address !== undefined) {
      allowedFields.address = updateData.address;
    }

    if (Object.keys(allowedFields).length === 0) {
      throw new BadRequestException('No valid fields provided for update');
    }

    const updated = await this.usersService.update(id, allowedFields);

    return {
      success: true,
      message: 'Customer updated successfully',
      data: { customer: updated },
    };
  }
}
