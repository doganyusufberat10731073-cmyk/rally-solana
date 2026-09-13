import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReputationEventType } from '@prisma/client';

export class ReputationEventDto {
  @ApiProperty({ example: 'rep_123' })
  id: string;

  @ApiProperty({ example: 'usr_alex_01' })
  userId: string;

  @ApiPropertyOptional({ example: 'act_anchor_01' })
  activityId?: string;

  @ApiProperty({ enum: ReputationEventType, example: ReputationEventType.HOSTED_SUCCESSFULLY })
  eventType: ReputationEventType;

  @ApiProperty({ example: 5, description: 'Score change amount (+5, -10, etc.)' })
  change: number;

  @ApiProperty({ example: 'Successfully hosted "Solana Anchor Workshop"' })
  reason: string;

  @ApiProperty({ example: '2026-09-12T10:00:00.000Z' })
  createdAt: string;
}
