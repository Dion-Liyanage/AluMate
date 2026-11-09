import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { IsMongoId, IsOptional, IsString, MaxLength } from 'class-validator';
import { AiChatService } from './ai-chat.service';
import { OptionalJwtAuthGuard } from './optional-jwt.guard';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];

export class SendAiMessageDto {
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  message?: string;

  @IsOptional()
  @IsMongoId()
  conversationId?: string;
}

/** Customer-facing AI assistant. Works for logged-in customers and anonymous visitors. */
@Controller('ai-chat')
@UseGuards(OptionalJwtAuthGuard)
export class AiChatController {
  constructor(private readonly aiChatService: AiChatService) {}

  @Post('messages')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) cb(null, true);
        else cb(new BadRequestException('Only JPG, PNG, WEBP or HEIC images are allowed'), false);
      },
    }),
  )
  async send(@Body() dto: SendAiMessageDto, @UploadedFile() image: Express.Multer.File | undefined, @Req() req: any) {
    const data = await this.aiChatService.sendMessage(
      { conversationId: dto.conversationId, message: dto.message, image },
      this.requester(req),
    );
    return { success: true, data };
  }

  @Get('conversations')
  async list(@Query('ids') ids: string | undefined, @Req() req: any) {
    const guestIds = (ids ?? '').split(',').map((id) => id.trim()).filter(Boolean);
    return { success: true, data: await this.aiChatService.listConversations(this.requester(req), guestIds) };
  }

  @Get('conversations/:id')
  async get(@Param('id') id: string, @Req() req: any) {
    return { success: true, data: await this.aiChatService.getConversation(id, this.requester(req)) };
  }

  private requester(req: any) {
    return { id: req.user?.id, firstName: req.user?.firstName, ip: req.ip || 'unknown' };
  }
}
