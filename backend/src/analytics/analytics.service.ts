
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from '../orders/schemas/order.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Quotation, QuotationDocument } from '../quotations/schemas/quotation.schema';
import { ServiceRequest, ServiceRequestDocument } from '../services/schemas/service-request.schema';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Quotation.name) private quotationModel: Model<QuotationDocument>,
    @InjectModel(ServiceRequest.name) private serviceRequestModel: Model<ServiceRequestDocument>,
  ) {}

  async getDashboardStats() {
    // Get stats in parallel for speed
    const [
      totalOrders,
      completedOrdersCount,
      totalCustomers,
      pendingQuotations,
      activeServiceRequests,
      productCounts,
      completedOrders,
    ] = await Promise.all([
      this.orderModel.countDocuments(),
      this.orderModel.countDocuments({ status: 'completed' }),
      this.userModel.countDocuments({ role: 'customer' }),
      this.quotationModel.countDocuments({ status: 'sent' }),
      this.serviceRequestModel.countDocuments({ status: { $ne: 'Completed' } }),
      this.orderModel.aggregate([
        { $group: { _id: '$productType', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      this.orderModel.find({ status: 'completed' }),
    ]);

    // Calculate total revenue from completed orders only
    const totalRevenue = completedOrders.reduce((sum, o) => sum + (o.finalTotalCost || o.estimatedPrice || 0), 0);
    
    const productDistribution = productCounts.map(p => ({ name: p._id, value: p.count }));

    return {
      totalOrders,
      completedOrders: completedOrdersCount,
      totalRevenue,
      totalCustomers,
      pendingQuotations,
      activeServiceRequests,
      productDistribution,
    };
  }

  async getMonthlyGrowth() {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const orders = await this.orderModel.find({
      createdAt: { $gte: sixMonthsAgo },
    });

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const data = [];

    for (let i = 0; i < 6; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      const monthName = monthNames[d.getMonth()];
      
      const count = orders.filter(o => {
        const oDate = new Date((o as any).createdAt);
        return oDate.getMonth() === d.getMonth() && oDate.getFullYear() === d.getFullYear();
      }).length;

      data.push({ name: monthName, orders: count });
    }

    return data;
  }

  async getRecentActivity() {
    const [orders, services] = await Promise.all([
      this.orderModel.find().sort({ createdAt: -1 }).limit(4).populate('customerId', 'firstName lastName'),
      this.serviceRequestModel.find().sort({ createdAt: -1 }).limit(4),
    ]);

    const activity = [
      ...orders.map(o => ({
        id: o._id,
        message: `New order for ${o.productType} by ${(o.customerId as any)?.firstName || 'Customer'}`,
        time: this.formatTime((o as any).createdAt),
        type: 'order',
        date: (o as any).createdAt
      })),
      ...services.map(s => ({
        id: s._id,
        message: `New ${s.serviceType} request from ${s.customerName}`,
        time: this.formatTime((s as any).createdAt),
        type: 'service',
        date: (s as any).createdAt
      }))
    ];

    return activity.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8);
  }

  private formatTime(date: Date) {
    const diff = new Date().getTime() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }
}
