import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {}

  async findAll(filter: Record<string, any> = {}): Promise<OrderDocument[]> {
    return this.orderModel.find(filter).sort({ createdAt: -1 }).exec();
  }

  async findById(id: string): Promise<OrderDocument | null> {
    return this.orderModel.findById(id).exec();
  }

  async findByCustomerId(customerId: string): Promise<OrderDocument[]> {
    return this.orderModel
      .find({ customerId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async create(orderData: Partial<Order>): Promise<OrderDocument> {
    const newOrder = new this.orderModel(orderData);
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
