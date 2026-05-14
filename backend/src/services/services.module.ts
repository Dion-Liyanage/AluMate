import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ServiceRequest,
  ServiceRequestSchema,
} from './schemas/service-request.schema';
import {
  ServiceAvailability,
  ServiceAvailabilitySchema,
} from './schemas/service-availability.schema';
import { ServicesService } from './services.service';
import { ServicesController } from './services.controller';
import { CloudinaryModule } from '../common/cloudinary/cloudinary.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ServiceRequest.name, schema: ServiceRequestSchema },
      { name: ServiceAvailability.name, schema: ServiceAvailabilitySchema },
    ]),
    CloudinaryModule,
  ],

  controllers: [ServicesController],
  providers: [ServicesService],
  exports: [ServicesService],
})
export class ServicesModule {}
