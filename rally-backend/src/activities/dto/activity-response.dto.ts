import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Category, ActivityStatus } from '@prisma/client';

export class ActivityResponseDto {
  @ApiProperty({ example: 'act_anchor_01' })
  id: string;

  @ApiProperty({ example: 'Solana Anchor Workshop & Hack Session' })
  title: string;

  @ApiProperty({ example: 'Hands-on session building Solana programs...' })
  description: string;

  @ApiProperty({ enum: Category, example: Category.Development })
  category: Category;

  @ApiProperty({ example: 'Discord Voice & Screen Share' })
  location: string;

  @ApiProperty({ example: '2026-09-18' })
  date: string;

  @ApiProperty({ example: '18:00' })
  time: string;

  @ApiProperty({ example: '2 hours' })
  duration: string;

  @ApiProperty({ example: 'usr_alex_01' })
  creatorId: string;

  @ApiPropertyOptional()
  creator?: any;

  @ApiProperty({ example: ['usr_alex_01', 'usr_elena_02'], type: [String] })
  participants: string[];

  @ApiPropertyOptional({ type: [Object] })
  participantUsers?: any[];

  @ApiProperty({ example: 8 })
  maxParticipants: number;

  @ApiProperty({ example: ['Basic Rust knowledge', 'Laptop'], type: [String] })
  requirements: string[];

  @ApiProperty({ enum: ActivityStatus, example: ActivityStatus.Open })
  status: ActivityStatus;

  @ApiProperty({ example: true })
  isOnline: boolean;

  @ApiProperty({ example: '2026-09-12T10:00:00.000Z' })
  createdAt: string;

  @ApiPropertyOptional({ example: '12345678' })
  solanaActivityId?: string;

  @ApiPropertyOptional({ example: 'Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS' })
  activityPda?: string;

  @ApiPropertyOptional({ example: '5U...' })
  txSignature?: string;

  @ApiPropertyOptional({ example: false, description: 'Whether the current authenticated user has joined' })
  isJoined?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Whether current user is the host' })
  isCreator?: boolean;
}
