import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getMine(@Request() req, @Query() query: any) {
    const isRead =
      query?.isRead === 'true' ? true : query?.isRead === 'false' ? false : undefined;
    const page = parseInt(query?.page, 10) || 1;
    const limit = parseInt(query?.limit, 10) || 20;

    const data = await this.notificationsService.findForUser(req.user.id, {
      isRead,
      page,
      limit,
    });
    return { success: true, data };
  }

  // Static routes are declared before ':id' so they aren't captured by it.
  @Get('unread-count')
  async getUnreadCount(@Request() req) {
    const count = await this.notificationsService.getUnreadCount(req.user.id);
    return { success: true, data: { count } };
  }

  @Patch('read-all')
  async markAllAsRead(@Request() req) {
    await this.notificationsService.markAllAsRead(req.user.id);
    return { success: true, message: 'All notifications marked as read' };
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string, @Request() req) {
    const notification = await this.notificationsService.markAsRead(id, req.user.id);
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    return { success: true, data: notification };
  }
}
