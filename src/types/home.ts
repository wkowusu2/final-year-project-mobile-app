export type HomeDashboardIncident = {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'verified' | 'resolved';
  roadName: string;
  city: string;
  createdAt: string;
};

export type HomeDashboard = {
  driver: {
    fullName: string;
    location: string;
  };
  metrics: {
    distanceMeters: number;
    tripCount: number;
    reportCount: number;
    currentSpeedMps: number | null;
    trackingActive: boolean;
  };
  incidents: HomeDashboardIncident[];
};

export type HomeDashboardResponse = {
  success: boolean;
  data: HomeDashboard | null;
  error: string | null;
};

export type CreateIncidentInput = {
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  roadName: string;
  city: string;
  latitude: number;
  longitude: number;
  photo?: { uri: string; name: string; type: string };
};

export type CreateIncidentResponse = {
  success: boolean;
  data: HomeDashboardIncident | null;
  error: string | null;
};

export type IncidentDetail = HomeDashboardIncident & {
  description: string;
  reporterName: string;
  latitude: number;
  longitude: number;
  confirmationCount: number;
  confirmedByCurrentDriver: boolean;
  reportedByCurrentDriver: boolean;
};

export type IncidentsResponse = {
  success: boolean;
  data: { incidents: HomeDashboardIncident[] } | null;
  error: string | null;
};

export type IncidentDetailResponse = {
  success: boolean;
  data: { incident: IncidentDetail } | null;
  error: string | null;
};

export type ConfirmIncidentResponse = {
  success: boolean;
  data: { confirmationCount: number; confirmedByCurrentDriver: boolean } | null;
  error: string | null;
};
