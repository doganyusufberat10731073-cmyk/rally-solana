import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class NotificationResponseDto {
  @ApiProperty({ example: 'notif_123' })
  id: string;

  @ApiProperty({ example: 'usr_alex_01' })
  userId: string;

  @ApiProperty({ example: 'Elena Rostova joined your activity "Solana Anchor Workshop"!' })
  content: string;

  @ApiProperty({ example: false })
  read: boolean;

  @ApiPropertyOptional({ example: 'act_anchor_01' })
  activityId?: string;

  @ApiProperty({ example: '2026-09-12T10:00:00.000Z' })
  timestamp: string;
}
