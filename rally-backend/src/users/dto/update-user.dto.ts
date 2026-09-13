import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Length, Matches } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'sol_master', description: 'Unique username' })
  @IsOptional()
  @IsString()
  @Length(3, 30)
  @Matches(/^[a-zA-Z0-9_]+$/, { message: 'Username can only contain alphanumeric characters and underscores.' })
  username?: string;

  @ApiPropertyOptional({ example: 'Solana developer building web3 apps', description: 'User biography' })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  bio?: string;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' })
  @IsOptional()
  @IsString()
  avatarUrl?: string;
}
