import { Injectable, BadRequestException, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { VerifySignatureDto } from './dto/verify-signature.dto';
import { NonceResponseDto } from './dto/auth-response.dto';
import * as crypto from 'crypto';
import * as nacl from 'tweetnacl';
import bs58 from 'bs58';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Generates a sign-in challenge nonce and message for a given Solana wallet address.
   * Creates the user record if this is their first time connecting.
   */
  async getNonce(walletAddress: string): Promise<NonceResponseDto> {
    if (!walletAddress || walletAddress.length < 32 || walletAddress.length > 44) {
      throw new BadRequestException('Invalid Solana wallet address format.');
    }

    const nonce = crypto.randomBytes(16).toString('hex');
    const expirationMinutes = this.configService.get<number>('auth.nonceExpirationMinutes', 10);
    const expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000);

    const message = this.createChallengeMessage(walletAddress, nonce);

    // Upsert user with new nonce and expiration
    const defaultUsername = `sol_${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`;
    await this.prisma.user.upsert({
      where: { walletAddress },
      update: {
        nonce,
        nonceExpiresAt: expiresAt,
      },
      create: {
        walletAddress,
        username: defaultUsername,
        nonce,
        nonceExpiresAt: expiresAt,
        reputation: 100, // Standard starting reputation score
        badges: ['Early Adopter'],
      },
    });

    return {
      walletAddress,
      nonce,
      message,
      expiresAt: expiresAt.toISOString(),
    };
  }

  /**
   * Verifies the ed25519 signature of the challenge message using TweetNaCl.
   * If valid, consumes the nonce and issues a JWT token.
   */
  async verifySignature(dto: VerifySignatureDto) {
    const { walletAddress, signature } = dto;

    const user = await this.prisma.user.findUnique({
      where: { walletAddress },
    });

    if (!user || !user.nonce) {
      throw new BadRequestException('No active authentication challenge found for this wallet. Request a new nonce.');
    }

    if (user.nonceExpiresAt && user.nonceExpiresAt < new Date()) {
      throw new UnauthorizedException('Authentication challenge nonce has expired. Please request a new nonce.');
    }

    const expectedMessage = this.createChallengeMessage(walletAddress, user.nonce);

    // Verify Ed25519 signature
    const isValid = this.verifySolanaSignature(walletAddress, expectedMessage, signature);

    if (!isValid) {
      throw new UnauthorizedException('Invalid Solana wallet signature.');
    }

    // Invalidate nonce to prevent replay attacks
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        nonce: null,
        nonceExpiresAt: null,
      },
    });

    const payload = {
      sub: user.id,
      walletAddress: user.walletAddress,
      username: user.username,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        walletAddress: user.walletAddress,
        username: user.username,
        reputation: user.reputation,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        badges: user.badges,
      },
    };
  }

  /**
   * Constructs the standardized human-readable challenge message
   */
  private createChallengeMessage(walletAddress: string, nonce: string): string {
    return `Welcome to Rally!\n\nSign this message to verify ownership of your wallet and securely log in.\n\nWallet: ${walletAddress}\nNonce: ${nonce}\nDomain: rally.app`;
  }

  /**
   * Verifies an Ed25519 signature given base58 public key, plaintext message, and base58 signature.
   */
  private verifySolanaSignature(walletAddress: string, message: string, signatureBase58: string): boolean {
    try {
      const messageBytes = new TextEncoder().encode(message);
      const publicKeyBytes = bs58.decode(walletAddress);
      const signatureBytes = bs58.decode(signatureBase58);

      return nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);
    } catch (error) {
      this.logger.warn(`Signature verification failed with decoding error: ${(error as Error).message}`);
      return false;
    }
  }
}
