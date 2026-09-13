import type { Activity, User } from '@/types';
import bs58 from 'bs58';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/$/, '');

interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('rally_access_token');
  const response = await fetch(`${API_URL}/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const payload = await response.json().catch(() => null) as ApiResponse<T> | { message?: string } | null;
  if (!response.ok) {
    const message = payload && 'message' in payload ? payload.message : undefined;
    throw new Error(message || `API request failed (${response.status})`);
  }

  return (payload as ApiResponse<T>).data;
}

export const api = {
  authenticateWallet: async (walletAddress: string, signMessage: (message: Uint8Array) => Promise<Uint8Array>) => {
    const challenge = await request<{ message: string }>(`/auth/nonce/${walletAddress}`);
    const signature = await signMessage(new TextEncoder().encode(challenge.message));
    const result = await request<{ accessToken: string; user: User }>('/auth/verify', {
      method: 'POST',
      body: JSON.stringify({ walletAddress, signature: bs58.encode(signature) }),
    });
    localStorage.setItem('rally_access_token', result.accessToken);
    return result.user;
  },
  getFeaturedActivities: () => request<Activity[]>('/activities/featured'),
  getActivities: (search = '') => request<{ items: Activity[]; meta: unknown }>(
    `/activities${search ? `?search=${encodeURIComponent(search)}` : ''}`,
  ),
  getActivity: (id: string) => request<Activity>(`/activities/${id}`),
  createActivity: (activity: Omit<Activity, 'id' | 'creatorId' | 'participants' | 'status' | 'createdAt'>) =>
    request<Activity>('/activities', { method: 'POST', body: JSON.stringify(activity) }),
  joinActivity: (id: string, data: { participantPda: string; txSignature: string }) => request<Activity>(`/activities/${id}/join`, { method: 'POST', body: JSON.stringify(data) }),
  getMyProfile: () => request<User>('/me/profile'),
  getMyActivities: (tab: 'joined' | 'created' | 'completed') => request<Activity[]>(`/me/activities?tab=${tab}`),
};