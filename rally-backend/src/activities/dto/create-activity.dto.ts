import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  MaxLength,
} from 'class-validator';
import { Category } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateActivityDto {
  @ApiProperty({ example: 'Solana Anchor Workshop & Hack Session', description: 'Activity title' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  title: string;

  @ApiProperty({
    example: 'Join us for a hands-on session building custom Solana programs with Anchor.',
    description: 'Detailed activity description',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  description: string;

  @ApiProperty({ enum: Category, example: Category.Development })
  @IsEnum(Category)
  category: Category;

  @ApiProperty({ example: 'Discord Voice & Screen Share', description: 'Physical address or virtual venue link' })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty({ example: '2026-09-18', description: 'Event date (YYYY-MM-DD)' })
  @IsString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({ example: '18:00', description: 'Event start time (HH:mm)' })
  @IsString()
  @IsNotEmpty()
  time: string;

  @ApiProperty({ example: '2 hours', description: 'Event estimated duration' })
  @IsString()
  @IsNotEmpty()
  duration: string;

  @ApiProperty({ example: 8, minimum: 2, description: 'Maximum total participants (including creator)' })
  @Type(() => Number)
  @IsInt()
  @Min(2, { message: 'maxParticipants must be at least 2 people.' })
  maxParticipants: number;

  @ApiPropertyOptional({
    example: ['Basic Rust knowledge', 'Solana CLI installed', 'Laptop'],
    type: [String],
    description: 'Prerequisites and items to bring',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requirements?: string[];

  @ApiPropertyOptional({ example: true, default: false, description: 'True if held online, false if in-person' })
  @IsOptional()
  @IsBoolean()
  isOnline?: boolean;

  @ApiProperty({ example: '12345678', description: 'Blockchain Activity ID (u64 converted to string)' })
  @IsString()
  @IsNotEmpty()
  solanaActivityId: string;

  @ApiProperty({ example: 'Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS', description: 'Activity PDA address' })
  @IsString()
  @IsNotEmpty()
  activityPda: string;

  @ApiProperty({ example: '5U...', description: 'Solana Transaction Signature' })
  @IsString()
  @IsNotEmpty()
  txSignature: string;
}
