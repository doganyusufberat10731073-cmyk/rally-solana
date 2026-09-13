import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class JoinActivityDto {
  @ApiProperty({ example: 'Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS', description: 'Participant PDA address' })
  @IsString()
  @IsNotEmpty()
  participantPda: string;

  @ApiProperty({ example: '5U...', description: 'Solana Transaction Signature' })
  @IsString()
  @IsNotEmpty()
  txSignature: string;
}
