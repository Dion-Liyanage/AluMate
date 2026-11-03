
import { Controller, Get, NotFoundException, Param, UseGuards, Req } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from '../users/users.service';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly usersService: UsersService,
  ) {}

  @Get('support-agent')
  async getSupportAgent() {
    const admin = await this.usersService.findFirstActiveAdmin();

    if (!admin) {
      throw new NotFoundException('No support administrator is available');
    }

    return {
      id: admin._id.toString(),
      firstName: admin.firstName,
      lastName: admin.lastName,
    };
  }

  @Get('conversations')
  async getConversations(@Req() req) {
    return this.messagesService.findUserConversations(req.user.id);
  }

  @Get('history/:otherUserId')
  async getHistory(@Req() req, @Param('otherUserId') otherUserId: string) {
    return this.messagesService.findConversation(req.user.id, otherUserId);
  }
}
