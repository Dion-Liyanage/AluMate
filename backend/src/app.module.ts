import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

// Feature Modules
import { UsersModule } from './users/users.module';
import { OrdersModule } from './orders/orders.module';
import { QuotationsModule } from './quotations/quotations.module';
import { ServicesModule } from './services/services.module';
import { InventoryModule } from './inventory/inventory.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    // Global configuration from .env
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // MongoDB connection via Mongoose
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),

    // Feature modules
    UsersModule,
    OrdersModule,
    QuotationsModule,
    ServicesModule,
    InventoryModule,
    NotificationsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
