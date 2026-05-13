import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';

// Feature Modules 
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { OrdersModule } from './orders/orders.module';
import { QuotationsModule } from './quotations/quotations.module';
import { ServicesModule } from './services/services.module';
import { InventoryModule } from './inventory/inventory.module';
import { NotificationsModule } from './notifications/notifications.module';
import { DesignsModule } from './designs/designs.module';
import { ProjectsModule } from './projects/projects.module';
import { AdminCustomersModule } from './admin-customers/admin-customers.module';
import { AdminOrdersModule } from './admin-orders/admin-orders.module';

@Module({
  imports: [
    // Global configuration from .env
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),

    // MongoDB connection via Mongoose
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000,
      }),
      inject: [ConfigService],
    }),

    // Feature modules
    UsersModule,
    AuthModule,
    OrdersModule,
    QuotationsModule,
    ServicesModule,
    InventoryModule,
    NotificationsModule,
    DesignsModule,
    ProjectsModule,
    AdminCustomersModule,
    AdminOrdersModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
