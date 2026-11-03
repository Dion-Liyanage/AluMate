import { Module } from '@nestjs/common';
import { AdminOrdersController } from './admin-orders.controller';
import { OrdersModule } from '../orders/orders.module';
import { CloudinaryModule } from '../common/cloudinary/cloudinary.module';
import { MailModule } from '../mail/mail.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [OrdersModule, CloudinaryModule, MailModule, UsersModule],
  controllers: [AdminOrdersController],
})
export class AdminOrdersModule {}
