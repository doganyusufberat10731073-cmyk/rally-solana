import { Test, TestingModule } from '@nestjs/testing';
import { ActivitiesService } from './activities.service';
import { PrismaService } from '../prisma/prisma.service';
import { Category, ActivityStatus, ParticipantRole, ParticipantStatus } from '@prisma/client';
import { ConflictException, ForbiddenException, BadRequestException } from '@nestjs/common';

describe('ActivitiesService (Unit Tests)', () => {
  let service: ActivitiesService;
  let prisma: any;

  const mockPrismaService = {
    activity: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    activityParticipant: {
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    notification: {
      create: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivitiesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ActivitiesService>(ActivitiesService);
    prisma = module.get(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('joinActivity', () => {
    it('should reject joining if user is already enrolled (duplicate join)', async () => {
      const mockActivity = {
        id: 'act_1',
        title: 'Valorant Tournament',
        creatorId: 'creator_1',
        status: ActivityStatus.Open,
        maxParticipants: 5,
        participants: [
          { userId: 'user_duplicate', role: ParticipantRole.PARTICIPANT },
        ],
      };

      prisma.$transaction.mockImplementation(async (callback: any) => {
        return callback({
          activity: {
            findUnique: jest.fn().mockResolvedValue(mockActivity),
            update: jest.fn(),
          },
          activityParticipant: {
            create: jest.fn(),
          },
          notification: {
            create: jest.fn(),
          },
          user: {
            findUnique: jest.fn().mockResolvedValue({ id: 'user_duplicate', username: 'tester' }),
          },
        });
      });

      await expect(service.join('act_1', 'user_duplicate')).rejects.toThrow(ConflictException);
    });

    it('should reject joining if activity is already full', async () => {
      const mockFullActivity = {
        id: 'act_full',
        title: 'Full Game',
        creatorId: 'creator_1',
        status: ActivityStatus.Full,
        maxParticipants: 2,
        participants: [
          { userId: 'creator_1' },
          { userId: 'user_2' },
        ],
      };

      prisma.$transaction.mockImplementation(async (callback: any) => {
        return callback({
          activity: {
            findUnique: jest.fn().mockResolvedValue(mockFullActivity),
          },
        });
      });

      await expect(service.join('act_full', 'user_new')).rejects.toThrow(ConflictException);
    });

    it('should prevent creator from joining their own activity again', async () => {
      const mockActivity = {
        id: 'act_1',
        title: 'My Game',
        creatorId: 'creator_1',
        status: ActivityStatus.Open,
        maxParticipants: 4,
        participants: [{ userId: 'creator_1' }],
      };

      prisma.$transaction.mockImplementation(async (callback: any) => {
        return callback({
          activity: {
            findUnique: jest.fn().mockResolvedValue(mockActivity),
          },
        });
      });

      await expect(service.join('act_1', 'creator_1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateActivity', () => {
    it('should reject update if user is not creator', async () => {
      prisma.activity.findUnique.mockResolvedValue({
        id: 'act_1',
        creatorId: 'original_creator',
        status: ActivityStatus.Open,
        participants: [],
      });

      await expect(
        service.update('act_1', { title: 'Hacked Title' }, 'impostor_user'),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
