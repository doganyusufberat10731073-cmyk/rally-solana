import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class VerifySignatureDto {
  @ApiProperty({
    description: 'Solana wallet public key (Base58 encoded)',
    example: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
  })
  @IsString()
  @IsNotEmpty()
  @Length(32, 44)
  walletAddress: string;

  @ApiProperty({
    description: 'Base58 encoded signature of the challenge message signed by user wallet',
    example: '2bNf...sig...3xW',
  })
  @IsString()
  @IsNotEmpty()
  signature: string;
}
