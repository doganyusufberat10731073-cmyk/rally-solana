import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserProfileDto } from './dto/user-response.dto';
import { ActivityStatus, ParticipantStatus } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Retrieves user profile with dynamically derived metrics:
   * - activitiesCompleted
   * - attendanceRate
   * - peopleMet
   * - categoryBreakdown
   * - recentHistory
   */
  async getUserProfile(userIdOrWallet: string): Promise<UserProfileDto> {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ id: userIdOrWallet }, { walletAddress: userIdOrWallet }, { username: userIdOrWallet }],
      },
      include: {
        participations: {
          include: {
            activity: {
              include: {
                participants: {
                  select: { userId: true },
                },
              },
            },
          },
        },
        createdActivities: {
          include: {
            participants: {
              select: { userId: true },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User '${userIdOrWallet}' not found.`);
    }

    // 1. Calculate activitiesCompleted
    // An activity counts as completed if activity.status === ActivityStatus.Completed and user status is not LEFT
    const completedParticipations = user.participations.filter(
      (p) => p.activity.status === ActivityStatus.Completed && p.status !== ParticipantStatus.NO_SHOW && p.status !== ParticipantStatus.LEFT,
    );
    const activitiesCompleted = completedParticipations.length;

    // 2. Calculate attendanceRate
    // Evaluates attendance in finished activities
    const finishedEvents = user.participations.filter(
      (p) => p.activity.status === ActivityStatus.Completed,
    );
    const attendedCount = finishedEvents.filter((p) => p.status === ParticipantStatus.ATTENDED || p.status === ParticipantStatus.JOINED).length;
    const noShowCount = finishedEvents.filter((p) => p.status === ParticipantStatus.NO_SHOW).length;
    const totalFinished = attendedCount + noShowCount;
    const attendanceRate = totalFinished === 0 ? 100 : Math.round((attendedCount / totalFinished) * 100);

    // 3. Calculate peopleMet (distinct user IDs met across completed activities)
    const distinctPeople = new Set<string>();
    for (const p of completedParticipations) {
      for (const participant of p.activity.participants) {
        if (participant.userId !== user.id) {
          distinctPeople.add(participant.userId);
        }
      }
    }
    const peopleMet = distinctPeople.size;

    // 4. Category breakdown
    const categoryBreakdown: Record<string, number> = {};
    for (const p of user.participations) {
      const cat = p.activity.category;
      categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + 1;
    }

    // 5. Recent History (last 5 activities)
    const sortedParticipations = [...user.participations].sort(
      (a, b) => new Date(b.activity.createdAt).getTime() - new Date(a.activity.createdAt).getTime(),
    );
    const recentHistory = sortedParticipations.slice(0, 5).map((p) => ({
      activityId: p.activity.id,
      title: p.activity.title,
      category: p.activity.category,
      date: p.activity.date,
      time: p.activity.time,
      role: p.role,
      status: p.activity.status,
      isOnline: p.activity.isOnline,
    }));

    return {
      id: user.id,
      username: user.username,
      walletAddress: user.walletAddress,
      reputation: user.reputation,
      activitiesCompleted,
      attendanceRate,
      peopleMet,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      badges: user.badges,
      categoryBreakdown,
      recentHistory,
    };
  }

  /**
   * Updates user bio, username, or avatarUrl
   */
  async updateProfile(userId: string, dto: UpdateUserDto): Promise<UserProfileDto> {
    if (dto.username) {
      const existing = await this.prisma.user.findFirst({
        where: {
          username: dto.username,
          NOT: { id: userId },
        },
      });
      if (existing) {
        throw new ConflictException('Username is already taken by another user.');
      }
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.username && { username: dto.username }),
        ...(dto.bio !== undefined && { bio: dto.bio }),
        ...(dto.avatarUrl !== undefined && { avatarUrl: dto.avatarUrl }),
      },
    });

    return this.getUserProfile(userId);
  }
}
