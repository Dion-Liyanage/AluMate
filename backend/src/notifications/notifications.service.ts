import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import {
  Notification,
  NotificationDocument,
} from './schemas/notification.schema';

/** Customer-facing message for each order status an admin can move an order to. */
const ORDER_STATUS_MESSAGES: Record<
  string,
  { title: string; message: (orderId: string) => string; type: string; linkTo: string }
> = {
  quotation_pending: {
    title: 'Order received',
    message: (id) => `We've received order ${id}. Our team will prepare a quotation for you.`,
    type: 'order',
    linkTo: '/dashboard/orders',
  },
  quotation_sent: {
    title: 'Quotation ready',
    message: (id) => `The quotation for order ${id} is ready for your review.`,
    type: 'quotation',
    linkTo: '/dashboard/quotations',
  },
  production: {
    title: 'Production started',
    message: (id) => `Order ${id} is now in production.`,
    type: 'order',
    linkTo: '/dashboard/orders',
  },
  fabrication_completed: {
    title: 'Fabrication completed',
    message: (id) => `Fabrication for order ${id} is complete. Installation will be scheduled next.`,
    type: 'order',
    linkTo: '/dashboard/orders',
  },
  installation: {
    title: 'Installation in progress',
    message: (id) => `Installation for order ${id} has started.`,
    type: 'order',
    linkTo: '/dashboard/orders',
  },
  completed: {
    title: 'Order completed',
    message: (id) => `Order ${id} has been completed. Thank you for choosing us!`,
    type: 'order',
    linkTo: '/dashboard/orders',
  },
  cancelled: {
    title: 'Order cancelled',
    message: (id) => `Order ${id} has been cancelled.`,
    type: 'order',
    linkTo: '/dashboard/orders',
  },
};

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
  ) {}

  async findForUser(
    userId: string,
    opts: { isRead?: boolean; page?: number; limit?: number } = {},
  ): Promise<{ notifications: NotificationDocument[]; total: number }> {
    const page = Math.max(1, opts.page ?? 1);
    const limit = Math.min(100, Math.max(1, opts.limit ?? 20));
    const filter: Record<string, any> = { userId };
    if (opts.isRead !== undefined) filter.isRead = opts.isRead;

    const [notifications, total] = await Promise.all([
      this.notificationModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.notificationModel.countDocuments(filter).exec(),
    ]);
    return { notifications, total };
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationModel
      .countDocuments({ userId, isRead: false })
      .exec();
  }

  async create(
    notificationData: Partial<Notification>,
  ): Promise<NotificationDocument> {
    const newNotification = new this.notificationModel(notificationData);
    return newNotification.save();
  }

  /**
   * Create a notification without ever failing the caller's request.
   * Use this from business flows where the notification is a side effect.
   */
  async notify(
    userId: string | undefined | null,
    data: Omit<Partial<Notification>, 'userId'>,
  ): Promise<void> {
    if (!userId || !isValidObjectId(userId)) return;
    try {
      await this.create({ ...data, userId: userId as any });
    } catch (err) {
      this.logger.error(`Failed to create notification for user ${userId}`, err as Error);
    }
  }

  /** Notify the customer that their order moved to `status`. Unknown statuses are ignored. */
  async notifyOrderStatus(
    customerId: string | undefined | null,
    orderId: string,
    status: string,
  ): Promise<void> {
    const template = ORDER_STATUS_MESSAGES[status];
    if (!template) return;
    await this.notify(customerId, {
      title: template.title,
      message: template.message(orderId),
      type: template.type,
      linkTo: template.linkTo,
    });
  }

  /** Marks one of the user's notifications as read. Returns null if it isn't theirs. */
  async markAsRead(
    id: string,
    userId: string,
  ): Promise<NotificationDocument | null> {
    if (!isValidObjectId(id)) return null;
    return this.notificationModel
      .findOneAndUpdate({ _id: id, userId }, { isRead: true }, { new: true })
      .exec();
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationModel
      .updateMany({ userId, isRead: false }, { isRead: true })
      .exec();
  }
}
