import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {}

  private generateOrderId(): string {
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `ALU-ORD-${year}-${random}`;
  }

  async findAll(filter: Record<string, any> = {}): Promise<OrderDocument[]> {
    const { page = 1, limit = 10, ...otherFilters } = filter;
    return this.orderModel
      .find(otherFilters)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();
  }

  async findById(id: string): Promise<OrderDocument | null> {
    return this.orderModel.findById(id).populate('quotationId').exec();
  }

  async findByCustomerId(customerId: string): Promise<OrderDocument[]> {
    return this.orderModel
      .find({ customerId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async create(orderData: Partial<Order>): Promise<OrderDocument> {
    const orderId = this.generateOrderId();
    const newOrder = new this.orderModel({ ...orderData, orderId });
    return newOrder.save();
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
