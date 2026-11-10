import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SavedDesign, SavedDesignSchema } from './schemas/saved-design.schema';
import { SavedDesignsService } from './saved-designs.service';
import { SavedDesignsController } from './saved-designs.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SavedDesign.name, schema: SavedDesignSchema },
    ]),
  ],
  controllers: [SavedDesignsController],
  providers: [SavedDesignsService],
})
export class SavedDesignsModule {}
