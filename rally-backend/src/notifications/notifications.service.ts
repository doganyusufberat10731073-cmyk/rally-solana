import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationResponseDto } from './dto/notification-response.dto';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Returns list of notifications for the authenticated user
   */
  async getUserNotifications(userId: string) {
    const notifications = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const unreadCount = await this.prisma.notification.count({
      where: { userId, read: false },
    });

    const items: NotificationResponseDto[] = notifications.map((n) => ({
      id: n.id,
      userId: n.userId,
      content: n.content,
      read: n.read,
      activityId: n.activityId || undefined,
      timestamp: n.createdAt.toISOString(),
    }));

    return {
      unreadCount,
      items,
    };
  }

  /**
   * Marks a specific notification as read
   */
  async markAsRead(id: string, userId: string): Promise<NotificationResponseDto> {
    const notif = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notif || notif.userId !== userId) {
      throw new NotFoundException(`Notification with ID '${id}' not found.`);
    }

    const updated = await this.prisma.notification.update({
      where: { id },
      data: { read: true },
    });

    return {
      id: updated.id,
      userId: updated.userId,
      content: updated.content,
      read: updated.read,
      activityId: updated.activityId || undefined,
      timestamp: updated.createdAt.toISOString(),
    };
  }

  /**
   * Marks all notifications of user as read
   */
  async markAllAsRead(userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });

    return {
      updatedCount: result.count,
      message: 'All notifications marked as read.',
    };
  }

  /**
   * Programmatic helper to emit a notification
   */
  async createNotification(userId: string, content: string, activityId?: string) {
    return this.prisma.notification.create({
      data: {
        userId,
        content,
        activityId,
      },
    });
  }
}
