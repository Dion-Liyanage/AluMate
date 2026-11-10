import { Module } from '@nestjs/common';
import { AdminOrdersController } from './admin-orders.controller';
import { OrdersModule } from '../orders/orders.module';
import { CloudinaryModule } from '../common/cloudinary/cloudinary.module';
import { MailModule } from '../mail/mail.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { UsersModule } from '../users/users.module';
import { SustainabilityModule } from '../sustainability/sustainability.module';

@Module({
  imports: [OrdersModule, CloudinaryModule, MailModule, NotificationsModule, UsersModule, SustainabilityModule],
  controllers: [AdminOrdersController],
})
export class AdminOrdersModule {}
