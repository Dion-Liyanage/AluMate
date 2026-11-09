import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Profile, ProfileSchema } from './schemas/profile.schema';
import { ProductTemplate, ProductTemplateSchema } from './schemas/product-template.schema';
import { AdminMaterialsController, MaterialsController } from './materials.controller';
import { MaterialsService } from './materials.service';
import { BomService } from './bom.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Profile.name, schema: ProfileSchema },
      { name: ProductTemplate.name, schema: ProductTemplateSchema },
    ]),
  ],
  controllers: [MaterialsController, AdminMaterialsController],
  providers: [MaterialsService, BomService],
  exports: [MaterialsService],
})
export class MaterialsModule {}
