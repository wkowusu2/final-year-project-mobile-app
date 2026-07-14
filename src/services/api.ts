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
import { RoadBounds, RoadsResponse } from '@/src/types/map';
import {
  ConfirmIncidentResponse,
  CreateIncidentInput,
  CreateIncidentResponse,
  HomeDashboardResponse,
  IncidentDetailResponse,
  IncidentsResponse,
} from '@/src/types/home';
import { TrackingPoint, TrackingSession } from '@/src/types/tracking';

type TrackingSessionResponse = {
  success: boolean;
  data: { session: TrackingSession | null } | null;
  error: string | null;
};

type TrackingPointsResponse = {
  success: boolean;
  data: { acceptedClientPointIds: string[]; duplicateCount: number } | null;
  error: string | null;
};

type ApiError = Error & { status?: number };

type RequestOptions = RequestInit & {
  requiresAuth?: boolean;
  retryOnAuthFailure?: boolean;
};

async function parseResponse(response: Response): Promise<unknown> {
  const raw = await response.text();
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as unknown;
  } catch {
    const contentType = response.headers.get('content-type') ?? 'an unknown content type';
    const source = response.url || API_BASE_URL;
    throw new Error(
      `Expected a JSON API response from ${source}, but received ${contentType} (HTTP ${response.status}). Check API_BASE_URL and the backend route.`,
    );
  }
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
  if (!refreshToken || !userId) {
    await storageService.logout();
    throw new Error('Session expired');
  }

  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken, userId }),
  });
  const data = (await parseResponse(response)) as RefreshTokensResponse | null;
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
  const isFormData = typeof FormData !== 'undefined' && fetchOptions.body instanceof FormData;
  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
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
  getHomeDashboard() {
    return request<HomeDashboardResponse>('/driver-profiles/home', {
      requiresAuth: true,
    });
  },
  createIncident(input: CreateIncidentInput) {
    const formData = new FormData();
    formData.append('type', input.type);
    formData.append('description', input.description);
    formData.append('severity', input.severity);
    formData.append('roadName', input.roadName);
    formData.append('city', input.city);
    formData.append('latitude', String(input.latitude));
    formData.append('longitude', String(input.longitude));
    if (input.photo) formData.append('photo', input.photo as unknown as Blob);
    return request<CreateIncidentResponse>('/incidents', {
      method: 'POST',
      requiresAuth: true,
      body: formData,
    });
  },
  getMyIncidents() {
    return request<IncidentsResponse>('/incidents', { requiresAuth: true });
  },
  getIncident(incidentId: string) {
    return request<IncidentDetailResponse>(`/incidents/${incidentId}`, { requiresAuth: true });
  },
  confirmIncident(incidentId: string) {
    return request<ConfirmIncidentResponse>(`/incidents/${incidentId}/confirm`, {
      method: 'POST',
      requiresAuth: true,
    });
  },
  async getRoads(bounds: RoadBounds, signal?: AbortSignal) {
    const query = new URLSearchParams({
      west: String(bounds.west),
      south: String(bounds.south),
      east: String(bounds.east),
      north: String(bounds.north),
    });

    console.log('Requesting roads for viewport', bounds);
    const response = await request<RoadsResponse>(`/map/roads?${query}`, { signal });
    console.log('Received roads for viewport', {
      bounds,
      featureCount: response.data?.features.length ?? 0,
      truncated: response.data?.truncated ?? false,
    });

    return response;
  },
  startTrackingSession(startedAt: string) {
    return request<TrackingSessionResponse>('/tracking/sessions', {
      method: 'POST',
      requiresAuth: true,
      body: JSON.stringify({ startedAt }),
    });
  },
  getActiveTrackingSession() {
    return request<TrackingSessionResponse>('/tracking/sessions/active', {
      requiresAuth: true,
    });
  },
  sendTrackingPoints(sessionId: string, points: TrackingPoint[]) {
    return request<TrackingPointsResponse>(`/tracking/sessions/${sessionId}/points`, {
      method: 'POST',
      requiresAuth: true,
      body: JSON.stringify({ points }),
    });
  },
  completeTrackingSession(sessionId: string, endedAt: string) {
    return request<TrackingSessionResponse>(`/tracking/sessions/${sessionId}/complete`, {
      method: 'POST',
      requiresAuth: true,
      body: JSON.stringify({ endedAt }),
    });
  },
};
