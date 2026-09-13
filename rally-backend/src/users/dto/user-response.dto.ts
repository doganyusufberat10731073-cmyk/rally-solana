import { ApiProperty } from '@nestjs/swagger';

export class UserProfileDto {
  @ApiProperty({ example: 'usr_alex_01' })
  id: string;

  @ApiProperty({ example: 'alex_sol' })
  username: string;

  @ApiProperty({ example: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU' })
  walletAddress: string;

  @ApiProperty({ example: 98 })
  reputation: number;

  @ApiProperty({ example: 12, description: 'Dynamically computed total activities completed' })
  activitiesCompleted: number;

  @ApiProperty({ example: 98, description: 'Attendance rate percentage (0-100)' })
  attendanceRate: number;

  @ApiProperty({ example: 24, description: 'Unique people met across completed activities' })
  peopleMet: number;

  @ApiProperty({ example: 'Solana builder & gaming enthusiast.' })
  bio: string;

  @ApiProperty({ example: 'https://images.unsplash.com/...' })
  avatarUrl: string;

  @ApiProperty({ example: ['Top Host', 'Early Adopter'], type: [String] })
  badges: string[];

  @ApiProperty({ example: { Development: 4, Gaming: 3, Sports: 2 }, required: false })
  categoryBreakdown?: Record<string, number>;

  @ApiProperty({ required: false, type: [Object] })
  recentHistory?: any[];
}
