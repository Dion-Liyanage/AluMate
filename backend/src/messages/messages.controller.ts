
import { Controller, Get, Param, UseGuards, Req } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get('conversations')
  async getConversations(@Req() req) {
    return this.messagesService.findUserConversations(req.user.id);
  }

  @Get('history/:otherUserId')
  async getHistory(@Req() req, @Param('otherUserId') otherUserId: string) {
    return this.messagesService.findConversation(req.user.id, otherUserId);
  }
}
