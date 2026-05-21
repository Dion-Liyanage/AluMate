import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { MailService } from '../mail/mail.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private mailService: MailService,
    private usersService: UsersService,
  ) {}

  private generateOrderId(): string {
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `ALU-ORD-${year}-${random}`;
  }

  async findAll(filter: Record<string, any> = {}): Promise<OrderDocument[]> {
    const { page = 1, limit = 10, populate, ...otherFilters } = filter;
    const query = this.orderModel
      .find(otherFilters)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('catalogueDesignId');

    if (populate) {
      query.populate('customerId', 'firstName lastName email phone');
    }

    return query.exec();
  }

  async findById(id: string): Promise<OrderDocument | null> {
    return this.orderModel
      .findById(id)
      .populate('quotationId')
      .populate('catalogueDesignId')
      .populate('customerId', 'firstName lastName email phone')
      .exec();
  }

  async findByCustomerId(customerId: string): Promise<OrderDocument[]> {
    return this.orderModel
      .find({ customerId })
      .sort({ createdAt: -1 })
      .populate('catalogueDesignId')
      .exec();
  }

  async create(orderData: Partial<Order>): Promise<OrderDocument> {
    const orderId = this.generateOrderId();
    const newOrder = new this.orderModel({ ...orderData, orderId });
    const savedOrder = await newOrder.save();

    // Send Confirmation Email
    try {
      const user = await this.usersService.findById(orderData.customerId.toString());
      if (user) {
        this.mailService.sendOrderConfirmation(user.email, savedOrder.productType, savedOrder.orderId).catch(err => {
          console.error('Failed to send order confirmation email:', err);
        });
      }
    } catch (err) {
      console.error('Error fetching user for email confirmation:', err);
    }

    return savedOrder;
  }

  async update(
    id: string,
    updateData: Partial<Order>,
  ): Promise<OrderDocument | null> {
    return this.orderModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
  }

  async delete(id: string): Promise<OrderDocument | null> {
    return this.orderModel.findByIdAndDelete(id).exec();
  }
}
