import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ServiceRequest,
  ServiceRequestSchema,
} from './schemas/service-request.schema';
import { ServicesService } from './services.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ServiceRequest.name, schema: ServiceRequestSchema },
    ]),
  ],
  providers: [ServicesService],
  exports: [ServicesService],
})
export class ServicesModule {}
