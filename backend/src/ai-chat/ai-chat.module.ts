import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AiConversation, AiConversationSchema } from './schemas/ai-conversation.schema';
import { AiChatController } from './ai-chat.controller';
import { AiChatService } from './ai-chat.service';
import { GeminiClient } from './gemini.client';
import { DesignsModule } from '../designs/designs.module';
import { MaterialsModule } from '../materials/materials.module';
import { CloudinaryModule } from '../common/cloudinary/cloudinary.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: AiConversation.name, schema: AiConversationSchema }]),
    DesignsModule,
    MaterialsModule,
    CloudinaryModule,
  ],
  controllers: [AiChatController],
  providers: [AiChatService, GeminiClient],
})
export class AiChatModule {}
