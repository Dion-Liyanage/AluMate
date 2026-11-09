import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MaterialUsage, MaterialUsageSchema } from './schemas/material-usage.schema';
import { SustainabilityController } from './sustainability.controller';
import { SustainabilityService } from './sustainability.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MaterialUsage.name, schema: MaterialUsageSchema },
    ]),
  ],
  controllers: [SustainabilityController],
  providers: [SustainabilityService],
  exports: [SustainabilityService],
})
export class SustainabilityModule {}
