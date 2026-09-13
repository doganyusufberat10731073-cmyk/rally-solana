import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as nacl from 'tweetnacl';
import bs58 from 'bs58';

describe('AuthService (Unit Tests)', () => {
  let service: AuthService;
  let prisma: any;
  let jwt: any;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock_jwt_token'),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue(10),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get(PrismaService);
    jwt = module.get(JwtService);
    jest.clearAllMocks();
  });

  it('should generate a nonce challenge for a valid Solana wallet', async () => {
    const keypair = nacl.sign.keyPair();
    const walletAddress = bs58.encode(keypair.publicKey);

    prisma.user.upsert.mockResolvedValue({
      walletAddress,
      nonce: 'sample_nonce',
    });

    const result = await service.getNonce(walletAddress);

    expect(result).toHaveProperty('nonce');
    expect(result).toHaveProperty('message');
    expect(result.walletAddress).toEqual(walletAddress);
    expect(result.message).toContain('Welcome to Rally!');
  });

  it('should verify signature and return accessToken', async () => {
    const keypair = nacl.sign.keyPair();
    const walletAddress = bs58.encode(keypair.publicKey);
    const nonce = 'test_nonce_12345';

    const message = `Welcome to Rally!\n\nSign this message to verify ownership of your wallet and securely log in.\n\nWallet: ${walletAddress}\nNonce: ${nonce}\nDomain: rally.app`;
    const messageBytes = new TextEncoder().encode(message);
    const signatureBytes = nacl.sign.detached(messageBytes, keypair.secretKey);
    const signature = bs58.encode(signatureBytes);

    prisma.user.findUnique.mockResolvedValue({
      id: 'usr_test',
      walletAddress,
      username: 'test_user',
      nonce,
      nonceExpiresAt: new Date(Date.now() + 60000),
      reputation: 100,
      badges: [],
    });

    prisma.user.update.mockResolvedValue({});

    const authResult = await service.verifySignature({
      walletAddress,
      signature,
    });

    expect(authResult).toHaveProperty('accessToken', 'mock_jwt_token');
    expect(authResult.user.walletAddress).toEqual(walletAddress);
  });
});
