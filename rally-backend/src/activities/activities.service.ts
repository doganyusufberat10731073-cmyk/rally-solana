import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { QueryActivityDto } from './dto/query-activity.dto';
import { JoinActivityDto } from './dto/join-activity.dto';
import { ActivityResponseDto } from './dto/activity-response.dto';
import { ActivityStatus, ParticipantRole, ParticipantStatus, ReputationEventType, Prisma } from '@prisma/client';

@Injectable()
export class ActivitiesService {
  private readonly logger = new Logger(ActivitiesService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Formats database activity record into the shape expected by Rally frontend
   */
  private formatActivity(activity: any, currentUserId?: string): ActivityResponseDto {
    const participantIds = activity.participants?.map((p: any) => p.userId || p.user?.id) || [];
    const participantUsers = activity.participants?.map((p: any) => p.user || p).filter(Boolean) || [];

    const isCreator = currentUserId ? activity.creatorId === currentUserId : false;
    const isJoined = currentUserId ? participantIds.includes(currentUserId) : false;

    return {
      id: activity.id,
      title: activity.title,
      description: activity.description,
      category: activity.category,
      location: activity.location,
      date: activity.date,
      time: activity.time,
      duration: activity.duration,
      creatorId: activity.creatorId,
      creator: activity.creator,
      participants: participantIds,
      participantUsers: participantUsers.length > 0 ? participantUsers : undefined,
      maxParticipants: activity.maxParticipants,
      requirements: activity.requirements,
      status: activity.status,
      isOnline: activity.isOnline,
      solanaActivityId: activity.solanaActivityId,
      activityPda: activity.activityPda,
      txSignature: activity.txSignature,
      createdAt: activity.createdAt instanceof Date ? activity.createdAt.toISOString() : activity.createdAt,
      isJoined,
      isCreator,
    };
  }

  /**
   * Retrieves featured activities for Home page (open, latest)
   */
  async getFeatured(currentUserId?: string): Promise<ActivityResponseDto[]> {
    const activities = await this.prisma.activity.findMany({
      where: {
        status: ActivityStatus.Open,
      },
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: {
        creator: true,
        participants: {
          include: { user: true },
        },
      },
    });

    return activities.map((act) => this.formatActivity(act, currentUserId));
  }

  /**
   * Search and filter activities with pagination for Discover page
   */
  async findAll(query: QueryActivityDto, currentUserId?: string) {
    const { search, category, isOnline, status, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ActivityWhereInput = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (typeof isOnline === 'boolean') {
      where.isOnline = isOnline;
    }

    if (status) {
      where.status = status;
    }

    const [total, items] = await Promise.all([
      this.prisma.activity.count({ where }),
      this.prisma.activity.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          creator: true,
          participants: {
            include: { user: true },
          },
        },
      }),
    ]);

    return {
      items: items.map((act) => this.formatActivity(act, currentUserId)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Retrieves activity detail by ID
   */
  async findOne(id: string, currentUserId?: string): Promise<ActivityResponseDto> {
    const activity = await this.prisma.activity.findUnique({
      where: { id },
      include: {
        creator: true,
        participants: {
          include: { user: true },
        },
      },
    });

    if (!activity) {
      throw new NotFoundException(`Activity with ID '${id}' not found.`);
    }

    return this.formatActivity(activity, currentUserId);
  }

  /**
   * Creates a new activity.
   * Note: The creator is automatically enrolled as an initial participant with role 'CREATOR'.
   */
  async create(dto: CreateActivityDto, creatorId: string): Promise<ActivityResponseDto> {
    const activity = await this.prisma.$transaction(async (tx) => {
      const created = await tx.activity.create({
        data: {
          title: dto.title,
          description: dto.description,
          category: dto.category,
          location: dto.location,
          date: dto.date,
          time: dto.time,
          duration: dto.duration,
          maxParticipants: dto.maxParticipants,
          requirements: dto.requirements || [],
          isOnline: dto.isOnline || false,
          solanaActivityId: dto.solanaActivityId,
          activityPda: dto.activityPda,
          txSignature: dto.txSignature,
          creatorId,
          status: ActivityStatus.Open,
        },
      });

      // Creator automatically occupies the first participant spot
      await tx.activityParticipant.create({
        data: {
          activityId: created.id,
          userId: creatorId,
          role: ParticipantRole.CREATOR,
          status: ParticipantStatus.JOINED,
        },
      });

      return tx.activity.findUnique({
        where: { id: created.id },
        include: {
          creator: true,
          participants: { include: { user: true } },
        },
      });
    });

    return this.formatActivity(activity, creatorId);
  }

  /**
   * Updates an existing activity (creator only)
   */
  async update(id: string, dto: UpdateActivityDto, userId: string): Promise<ActivityResponseDto> {
    const activity = await this.prisma.activity.findUnique({
      where: { id },
      include: { participants: true },
    });

    if (!activity) {
      throw new NotFoundException(`Activity with ID '${id}' not found.`);
    }

    if (activity.creatorId !== userId) {
      throw new ForbiddenException('Only the creator can edit this activity.');
    }

    if (activity.status === ActivityStatus.Completed || activity.status === ActivityStatus.Cancelled) {
      throw new BadRequestException(`Cannot edit an activity that is already ${activity.status}.`);
    }

    if (dto.maxParticipants && dto.maxParticipants < activity.participants.length) {
      throw new BadRequestException(
        `Cannot set maxParticipants to ${dto.maxParticipants} because there are already ${activity.participants.length} participants.`,
      );
    }

    let newStatus = activity.status;
    if (dto.maxParticipants && dto.maxParticipants > activity.participants.length && activity.status === ActivityStatus.Full) {
      newStatus = ActivityStatus.Open;
    }

    const updated = await this.prisma.activity.update({
      where: { id },
      data: {
        ...(dto.title && { title: dto.title }),
        ...(dto.description && { description: dto.description }),
        ...(dto.category && { category: dto.category }),
        ...(dto.location && { location: dto.location }),
        ...(dto.date && { date: dto.date }),
        ...(dto.time && { time: dto.time }),
        ...(dto.duration && { duration: dto.duration }),
        ...(dto.requirements && { requirements: dto.requirements }),
        ...(dto.isOnline !== undefined && { isOnline: dto.isOnline }),
        ...(dto.maxParticipants && { maxParticipants: dto.maxParticipants }),
        status: newStatus,
      },
      include: {
        creator: true,
        participants: { include: { user: true } },
      },
    });

    return this.formatActivity(updated, userId);
  }

  /**
   * Joins an activity with race-condition safe transaction
   */
  async join(id: string, userId: string, dto: JoinActivityDto): Promise<ActivityResponseDto> {
    const updatedActivity = await this.prisma.$transaction(async (tx) => {
      // 1. Fetch activity with existing participants
      const activity = await tx.activity.findUnique({
        where: { id },
        include: {
          participants: true,
          creator: true,
        },
      });

      if (!activity) {
        throw new NotFoundException(`Activity with ID '${id}' not found.`);
      }

      // 2. Validate status
      if (activity.status === ActivityStatus.Cancelled) {
        throw new BadRequestException('Cannot join a cancelled activity.');
      }
      if (activity.status === ActivityStatus.Completed) {
        throw new BadRequestException('Cannot join an activity that is already completed.');
      }
      if (activity.status === ActivityStatus.Full) {
        throw new ConflictException('This activity is already full.');
      }

      // 3. Prevent creator duplicate join
      if (activity.creatorId === userId) {
        throw new BadRequestException('You are the creator of this activity and already enrolled.');
      }

      // 4. Prevent duplicate participant join
      const alreadyJoined = activity.participants.some((p) => p.userId === userId);
      if (alreadyJoined) {
        throw new ConflictException('You have already joined this activity.');
      }

      // 5. Check capacity limit
      const currentCount = activity.participants.length;
      if (currentCount >= activity.maxParticipants) {
        await tx.activity.update({
          where: { id },
          data: { status: ActivityStatus.Full },
        });
        throw new ConflictException('This activity is already full.');
      }

      // 6. Create participant record
      await tx.activityParticipant.create({
        data: {
          activityId: id,
          userId,
          role: ParticipantRole.PARTICIPANT,
          status: ParticipantStatus.JOINED,
          participantPda: dto.participantPda,
          joinTxSignature: dto.txSignature,
        },
      });

      // 7. If capacity reached after this join, mark as Full
      const willBeFull = currentCount + 1 >= activity.maxParticipants;
      if (willBeFull) {
        await tx.activity.update({
          where: { id },
          data: { status: ActivityStatus.Full },
        });
      }

      // 8. Notify the creator
      const joiningUser = await tx.user.findUnique({ where: { id: userId } });
      const joinerName = joiningUser?.username || 'A new participant';
      await tx.notification.create({
        data: {
          userId: activity.creatorId,
          activityId: activity.id,
          content: `${joinerName} has joined your activity "${activity.title}".`,
        },
      });

      return tx.activity.findUnique({
        where: { id },
        include: {
          creator: true,
          participants: { include: { user: true } },
        },
      });
    });

    return this.formatActivity(updatedActivity, userId);
  }

  /**
   * Leaves an activity
   */
  async leave(id: string, userId: string): Promise<ActivityResponseDto> {
    const updatedActivity = await this.prisma.$transaction(async (tx) => {
      const activity = await tx.activity.findUnique({
        where: { id },
        include: { participants: true },
      });

      if (!activity) {
        throw new NotFoundException(`Activity with ID '${id}' not found.`);
      }

      if (activity.creatorId === userId) {
        throw new BadRequestException('The creator cannot leave their own activity. You may cancel it instead.');
      }

      const participant = await tx.activityParticipant.findUnique({
        where: {
          activityId_userId: {
            activityId: id,
            userId,
          },
        },
      });

      if (!participant) {
        throw new BadRequestException('You are not a participant in this activity.');
      }

      await tx.activityParticipant.delete({
        where: { id: participant.id },
      });

      // If status was Full, reopen it since a spot freed up
      if (activity.status === ActivityStatus.Full) {
        await tx.activity.update({
          where: { id },
          data: { status: ActivityStatus.Open },
        });
      }

      // Notify creator
      const leavingUser = await tx.user.findUnique({ where: { id: userId } });
      await tx.notification.create({
        data: {
          userId: activity.creatorId,
          activityId: activity.id,
          content: `${leavingUser?.username || 'A participant'} has left your activity "${activity.title}".`,
        },
      });

      return tx.activity.findUnique({
        where: { id },
        include: {
          creator: true,
          participants: { include: { user: true } },
        },
      });
    });

    return this.formatActivity(updatedActivity, userId);
  }

  /**
   * Cancels an activity (creator only)
   */
  async cancel(id: string, userId: string): Promise<ActivityResponseDto> {
    const activity = await this.prisma.activity.findUnique({
      where: { id },
      include: { participants: true },
    });

    if (!activity) {
      throw new NotFoundException(`Activity with ID '${id}' not found.`);
    }

    if (activity.creatorId !== userId) {
      throw new ForbiddenException('Only the creator can cancel this activity.');
    }

    if (activity.status === ActivityStatus.Completed) {
      throw new BadRequestException('Cannot cancel a completed activity.');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const cancelledAct = await tx.activity.update({
        where: { id },
        data: { status: ActivityStatus.Cancelled },
        include: {
          creator: true,
          participants: { include: { user: true } },
        },
      });

      // Notify all participants about cancellation
      for (const p of activity.participants) {
        if (p.userId !== userId) {
          await tx.notification.create({
            data: {
              userId: p.userId,
              activityId: id,
              content: `The activity "${activity.title}" was cancelled by the host.`,
            },
          });
        }
      }

      return cancelledAct;
    });

    return this.formatActivity(updated, userId);
  }

  /**
   * Completes an activity (creator only) and rewards reputation
   */
  async complete(id: string, userId: string): Promise<ActivityResponseDto> {
    const activity = await this.prisma.activity.findUnique({
      where: { id },
      include: { participants: true },
    });

    if (!activity) {
      throw new NotFoundException(`Activity with ID '${id}' not found.`);
    }

    if (activity.creatorId !== userId) {
      throw new ForbiddenException('Only the creator can mark this activity as completed.');
    }

    if (activity.status === ActivityStatus.Completed) {
      throw new BadRequestException('Activity is already marked as completed.');
    }

    const completed = await this.prisma.$transaction(async (tx) => {
      const compAct = await tx.activity.update({
        where: { id },
        data: { status: ActivityStatus.Completed },
        include: {
          creator: true,
          participants: { include: { user: true } },
        },
      });

      // Mark participants as ATTENDED and award reputation
      for (const p of activity.participants) {
        await tx.activityParticipant.update({
          where: { id: p.id },
          data: { status: ParticipantStatus.ATTENDED },
        });

        if (p.userId === userId) {
          // Host reputation bonus
          await tx.reputationEvent.create({
            data: {
              userId: p.userId,
              activityId: id,
              eventType: ReputationEventType.HOSTED_SUCCESSFULLY,
              change: 5,
              reason: `Successfully hosted "${activity.title}"`,
            },
          });
          await tx.user.update({
            where: { id: p.userId },
            data: { reputation: { increment: 5 } },
          });
        } else {
          // Participant attendance bonus
          await tx.reputationEvent.create({
            data: {
              userId: p.userId,
              activityId: id,
              eventType: ReputationEventType.ATTENDED,
              change: 3,
              reason: `Attended and completed "${activity.title}"`,
            },
          });
          await tx.user.update({
            where: { id: p.userId },
            data: { reputation: { increment: 3 } },
          });

          await tx.notification.create({
            data: {
              userId: p.userId,
              activityId: id,
              content: `"${activity.title}" is completed! You earned +3 reputation points.`,
            },
          });
        }
      }

      return compAct;
    });

    return this.formatActivity(completed, userId);
  }

  /**
   * Retrieves user's activities split by category: Joined, Created, Completed
   */
  async getMyActivities(userId: string, tab?: 'joined' | 'created' | 'completed') {
    if (tab === 'created') {
      const created = await this.prisma.activity.findMany({
        where: { creatorId: userId },
        orderBy: { createdAt: 'desc' },
        include: { creator: true, participants: { include: { user: true } } },
      });
      return created.map((a) => this.formatActivity(a, userId));
    }

    if (tab === 'joined') {
      const joined = await this.prisma.activity.findMany({
        where: {
          creatorId: { not: userId },
          participants: { some: { userId } },
        },
        orderBy: { createdAt: 'desc' },
        include: { creator: true, participants: { include: { user: true } } },
      });
      return joined.map((a) => this.formatActivity(a, userId));
    }

    if (tab === 'completed') {
      const completed = await this.prisma.activity.findMany({
        where: {
          status: ActivityStatus.Completed,
          participants: { some: { userId } },
        },
        orderBy: { createdAt: 'desc' },
        include: { creator: true, participants: { include: { user: true } } },
      });
      return completed.map((a) => this.formatActivity(a, userId));
    }

    // Default: return all three categories in a structured object
    const [created, joined, completed] = await Promise.all([
      this.prisma.activity.findMany({
        where: { creatorId: userId },
        orderBy: { createdAt: 'desc' },
        include: { creator: true, participants: { include: { user: true } } },
      }),
      this.prisma.activity.findMany({
        where: {
          creatorId: { not: userId },
          participants: { some: { userId } },
        },
        orderBy: { createdAt: 'desc' },
        include: { creator: true, participants: { include: { user: true } } },
      }),
      this.prisma.activity.findMany({
        where: {
          status: ActivityStatus.Completed,
          participants: { some: { userId } },
        },
        orderBy: { createdAt: 'desc' },
        include: { creator: true, participants: { include: { user: true } } },
      }),
    ]);

    return {
      created: created.map((a) => this.formatActivity(a, userId)),
      joined: joined.map((a) => this.formatActivity(a, userId)),
      completed: completed.map((a) => this.formatActivity(a, userId)),
    };
  }
}
