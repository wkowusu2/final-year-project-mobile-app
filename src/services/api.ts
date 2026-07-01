import { API_BASE_URL } from '@/src/constants/api';
import { storageService } from '@/src/services/storageService';
import {
  DoneOnboardingResponse,
  DriverRegistrationInput,
  RefreshTokensResponse,
  RegisterDriverResponse,
  SendOtpResponse,
  VerifyOtpPayload,
  VerifyOtpResponse,
} from '@/src/types/driver';
import { GpsPoint } from '@/src/types/tracking';

type StartResponse = { success: true; sessionId: string };

type ApiError = Error & { status?: number };

type RequestOptions = RequestInit & {
  requiresAuth?: boolean;
  retryOnAuthFailure?: boolean;
};

async function parseResponse(response: Response) {
  const raw = await response.text();
  return raw ? (JSON.parse(raw) as unknown) : null;
}

function getErrorMessage(data: unknown, status: number) {
  return typeof data === 'object' && data !== null && 'error' in data && typeof data.error === 'string'
    ? data.error
    : typeof data === 'object' && data !== null && 'message' in data && typeof data.message === 'string'
      ? data.message
      : `API request failed with status ${status}`;
}

async function refreshAuthTokens() {
  const [refreshToken, userId] = await Promise.all([storageService.getRefreshToken(), storageService.getUserId()]);
  console.log('Fetched refresh credentials', { hasRefreshToken: Boolean(refreshToken), userId });

  if (!refreshToken || !userId) {
    await storageService.logout();
    throw new Error('Session expired');
  }

  const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken, userId }),
  });
  const data = (await parseResponse(response)) as RefreshTokensResponse | null;
  console.log('Refresh response received', { status: response.status, data });

  if (!response.ok || !data?.success || !data.data) {
    await storageService.logout();
    throw new Error(data?.error ?? 'Session expired');
  }

  await storageService.saveAuthTokens({
    accessToken: data.data.access_token,
    refreshToken: data.data.refresh_token,
  });

  return data.data.access_token;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { requiresAuth = false, retryOnAuthFailure = true, ...fetchOptions } = options;
  const headers = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers ?? {}),
  } as Record<string, string>;

  if (requiresAuth) {
    const accessToken = await storageService.getAccessToken();

    if (!accessToken) {
      await storageService.logout();
      throw new Error('Session expired');
    }

    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...fetchOptions,
    headers,
  });

  const data = await parseResponse(response);

  if (!response.ok) {
    const error = new Error(getErrorMessage(data, response.status)) as ApiError;
    error.status = response.status;

    if (requiresAuth && retryOnAuthFailure && response.status === 401) {
      console.log('Protected request returned 401', { path, status: response.status });
      const accessToken = await refreshAuthTokens();
      return request<T>(path, {
        ...fetchOptions,
        requiresAuth: true,
        retryOnAuthFailure: false,
        headers: {
          ...(fetchOptions.headers ?? {}),
          Authorization: `Bearer ${accessToken}`,
        },
      });
    }

    throw error;
  }

  return data as T;
}

export const api = {
  sendOtp(phone: string) {
    return request<SendOtpResponse>('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    });
  },
  verifyOtp(payload: VerifyOtpPayload) {
    return request<VerifyOtpResponse>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  registerDriver(input: DriverRegistrationInput) {
    return request<RegisterDriverResponse>('/driver-profiles', {
      method: 'POST',
      requiresAuth: true,
      body: JSON.stringify(input),
    });
  },
  completeOnboarding() {
    return request<DoneOnboardingResponse>('/driver-profiles/done-onboarding', {
      method: 'PATCH',
      requiresAuth: true,
    });
  },
  startSession(driverId: string, startedAt: string) {
    return request<StartResponse>('/tracking/sessions/start', {
      method: 'POST',
      requiresAuth: true,
      body: JSON.stringify({ driverId, startedAt }),
    });
  },
  sendGpsBatch(driverId: string, sessionId: string, points: GpsPoint[]) {
    return request<{ success: boolean }>('/tracking/gps-points/batch', {
      method: 'POST',
      requiresAuth: true,
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
  stopSession(sessionId: string, endedAt: string) {
    return request<{ success: boolean }>('/tracking/sessions/stop', {
      method: 'POST',
      requiresAuth: true,
      body: JSON.stringify({ sessionId, endedAt }),
    });
  },
};
