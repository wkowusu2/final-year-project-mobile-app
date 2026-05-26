import { API_BASE_URL } from '@/src/constants/api';
import { DriverProfile, DriverRegistrationInput } from '@/src/types/driver';
import { GpsPoint } from '@/src/types/tracking';

type RegisterResponse = { success: true; driverId: string; token: string };
type StartResponse = { success: true; sessionId: string };

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  if (API_BASE_URL.includes('example.com')) {
    await new Promise((resolve) => setTimeout(resolve, 350));
    return mockResponse<T>(path);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

function mockResponse<T>(path: string): T {
  if (path === '/drivers/register') {
    return {
      success: true,
      driverId: `driver-${Date.now()}`,
      token: `mock-token-${Date.now()}`,
    } as T;
  }

  if (path === '/tracking/sessions/start') {
    return { success: true, sessionId: `session-${Date.now()}` } as T;
  }

  return { success: true } as T;
}

export const api = {
  async registerDriver(input: DriverRegistrationInput): Promise<DriverProfile> {
    const response = await request<RegisterResponse>('/drivers/register', {
      method: 'POST',
      body: JSON.stringify(input),
    });

    return { ...input, driverId: response.driverId, token: response.token };
  },
  startSession(driverId: string, token: string, startedAt: string) {
    return request<StartResponse>('/tracking/sessions/start', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ driverId, startedAt }),
    });
  },
  sendGpsBatch(driverId: string, sessionId: string, token: string, points: GpsPoint[]) {
    return request<{ success: boolean }>('/tracking/gps-points/batch', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        driverId,
        sessionId,
        points: points.map(({ latitude, longitude, speed, heading, accuracy, recordedAt }) => ({
          latitude,
          longitude,
          speed,
          heading,
          accuracy,
          recordedAt,
        })),
      }),
    });
  },
  stopSession(sessionId: string, token: string, endedAt: string) {
    return request<{ success: boolean }>('/tracking/sessions/stop', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ sessionId, endedAt }),
    });
  },
};
