import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReputationEventType } from '@prisma/client';

@Injectable()
export class ReputationService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Applies a reputation adjustment and logs the audit event
   */
  async logReputationEvent(
    userId: string,
    eventType: ReputationEventType,
    change: number,
    reason: string,
    activityId?: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const event = await tx.reputationEvent.create({
        data: {
          userId,
          activityId,
          eventType,
          change,
          reason,
        },
      });

      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          reputation: {
            increment: change,
          },
        },
      });

      return {
        event,
        newReputation: updatedUser.reputation,
      };
    });
  }

  /**
   * Returns reputation audit history for a user
   */
  async getReputationHistory(userId: string) {
    const events = await this.prisma.reputationEvent.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { reputation: true },
    });

    return {
      currentScore: user?.reputation ?? 100,
      history: events.map((e) => ({
        id: e.id,
        userId: e.userId,
        activityId: e.activityId || undefined,
        eventType: e.eventType,
        change: e.change,
        reason: e.reason,
        createdAt: e.createdAt.toISOString(),
      })),
    };
  }
}
