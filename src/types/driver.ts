export type VehicleType = 'Car' | 'Taxi' | 'Trotro' | 'Bus' | 'Motorcycle' | 'Truck';
export type AuthRole = 'driver';

export type DriverRegistrationInput = {
  phone: string;
  fullName: string;
  email?: string;
};

export type DriverProfile = DriverRegistrationInput & {
  driverId: string;
  token: string;
};

export type SendOtpResponse = {
  success: boolean;
  error: string | null;
};

export type VerifyOtpPayload = {
  otp: string;
  phone: string;
  role: AuthRole;
};

export type VerifyOtpData = {
  hasProfile: boolean;
  accessToken: string;
  refreshToke: string;
  fullName: string | null;
  doneOnBoarding: boolean;
};

export type VerifyOtpResponse = {
  success: boolean;
  error: string | null;
  data: VerifyOtpData | null;
};

export type RegisterDriverData = {
  fullName: string;
  phone: string;
  email: string | null;
  doneOnBoarding: boolean;
};

export type RegisterDriverResponse = {
  success: boolean;
  data: RegisterDriverData | null;
  error: string | null;
};

export type DoneOnboardingResponse = {
  success: boolean;
  error: string | null;
  data: {
    doneOnboarding: boolean;
  } | null;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};
