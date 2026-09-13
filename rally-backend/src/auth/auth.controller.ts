import { Controller, Get, Post, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { VerifySignatureDto } from './dto/verify-signature.dto';
import { NonceResponseDto, VerifyAuthResponseDto } from './dto/auth-response.dto';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../common/interfaces/auth-payload.interface';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Get('nonce/:walletAddress')
  @ApiOperation({
    summary: 'Request authentication nonce challenge for a Solana wallet',
    description: 'Generates a unique challenge message containing a cryptographic nonce for the user to sign with their Solana wallet.',
  })
  @ApiParam({ name: 'walletAddress', description: 'Solana wallet public key (Base58)', example: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU' })
  @ApiResponse({ status: 200, description: 'Nonce challenge generated successfully', type: NonceResponseDto })
  async getNonce(@Param('walletAddress') walletAddress: string): Promise<NonceResponseDto> {
    return this.authService.getNonce(walletAddress);
  }

  @Public()
  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify Solana signature and obtain JWT access token',
    description: 'Verifies the Ed25519 signature of the challenge message. Returns JWT token and user profile upon success.',
  })
  @ApiResponse({ status: 200, description: 'Signature verified and JWT token returned', type: VerifyAuthResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid or expired signature/nonce' })
  async verify(@Body() dto: VerifySignatureDto) {
    return this.authService.verifySignature(dto);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current authenticated user profile',
    description: 'Returns the currently logged in user based on the JWT Bearer token.',
  })
  @ApiResponse({ status: 200, description: 'Authenticated user profile' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMe(@CurrentUser() user: AuthenticatedUser) {
    return user;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Log out current user',
    description: 'Signals client to clear JWT token and confirms logout.',
  })
  @ApiResponse({ status: 200, description: 'Successfully logged out' })
  async logout() {
    return { loggedOut: true, message: 'Successfully logged out.' };
  }
}
