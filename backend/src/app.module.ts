import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
// import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';

// Feature Modules (uncomment when MongoDB is connected)
// import { UsersModule } from './users/users.module';
// import { OrdersModule } from './orders/orders.module';
// import { QuotationsModule } from './quotations/quotations.module';
// import { ServicesModule } from './services/services.module';
// import { InventoryModule } from './inventory/inventory.module';
// import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    // Global configuration from .env
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // MongoDB connection via Mongoose
    // TODO: Uncomment after whitelisting your IP in MongoDB Atlas
    // MongooseModule.forRootAsync({
    //   imports: [ConfigModule],
    //   useFactory: async (configService: ConfigService) => ({
    //     uri: configService.get<string>('MONGODB_URI'),
    //     serverSelectionTimeoutMS: 5000,
    //     connectTimeoutMS: 10000,
    //   }),
    //   inject: [ConfigService],
    // }),

    // Feature modules (uncomment when MongoDB is connected)
    // UsersModule,
    // OrdersModule,
    // QuotationsModule,
    // ServicesModule,
    // InventoryModule,
    // NotificationsModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
