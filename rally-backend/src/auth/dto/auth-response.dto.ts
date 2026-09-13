import { ApiProperty } from '@nestjs/swagger';

export class NonceResponseDto {
  @ApiProperty({ example: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU' })
  walletAddress: string;

  @ApiProperty({ example: 'a1b2c3d4e5f6...' })
  nonce: string;

  @ApiProperty({
    example: 'Sign this message to authenticate with Rally:\nNonce: a1b2c3d4e5f6...\nWallet: 7xKXtg...\nTimestamp: 2026-09-12T10:00:00.000Z',
  })
  message: string;

  @ApiProperty({ example: '2026-09-12T10:10:00.000Z' })
  expiresAt: string;
}

export class VerifyAuthResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken: string;

  @ApiProperty()
  user: any;
}
