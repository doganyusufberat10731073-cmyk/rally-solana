export interface JwtPayload {
  sub: string;
  walletAddress: string;
  username: string;
}

export interface AuthenticatedUser {
  id: string;
  walletAddress: string;
  username: string;
  reputation: number;
  bio: string;
  avatarUrl: string;
  badges: string[];
}
