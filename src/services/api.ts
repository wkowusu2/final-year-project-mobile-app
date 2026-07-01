import { API_BASE_URL } from '@/src/constants/api';
import { DoneOnboardingResponse, DriverRegistrationInput, RegisterDriverResponse, SendOtpResponse, VerifyOtpPayload, VerifyOtpResponse } from '@/src/types/driver';
import { GpsPoint } from '@/src/types/tracking';

type StartResponse = { success: true; sessionId: string };

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  });

  const raw = await response.text();
  const data = raw ? (JSON.parse(raw) as unknown) : null;

  if (!response.ok) {
    const message =
      typeof data === 'object' && data !== null && 'error' in data && typeof data.error === 'string'
        ? data.error
        : typeof data === 'object' && data !== null && 'message' in data && typeof data.message === 'string'
          ? data.message
          : `API request failed with status ${response.status}`;
    throw new Error(message);
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
  registerDriver(input: DriverRegistrationInput, token: string) {
    return request<RegisterDriverResponse>('/driver-profiles', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(input),
    });
  },
  completeOnboarding(token: string) {
    return request<DoneOnboardingResponse>('/driver-profiles/done-onboarding', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });
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
