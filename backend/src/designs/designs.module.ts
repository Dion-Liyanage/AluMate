import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DesignsService } from './designs.service';
import { DesignsController } from './designs.controller';
import { Design, DesignSchema } from './schemas/design.schema';
import { CloudinaryModule } from '../common/cloudinary/cloudinary.module';


@Module({
  imports: [
    MongooseModule.forFeature([{ name: Design.name, schema: DesignSchema }]),
    CloudinaryModule,
  ],

  controllers: [DesignsController],
  providers: [DesignsService],
  exports: [DesignsService],
})
export class DesignsModule {}
