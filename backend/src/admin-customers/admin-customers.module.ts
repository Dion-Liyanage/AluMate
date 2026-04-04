import { Module } from '@nestjs/common';
import { AdminCustomersController } from './admin-customers.controller';
import { UsersModule } from '../users/users.module';
import { OrdersModule } from '../orders/orders.module';
import { ServicesModule } from '../services/services.module';

@Module({
  imports: [UsersModule, OrdersModule, ServicesModule],
  controllers: [AdminCustomersController],
})
export class AdminCustomersModule {}
