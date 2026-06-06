export type ThemeMode = 'light' | 'dark';

export type TrafficLevel = 'free' | 'moderate' | 'heavy' | 'severe';

export type IncidentStatus = 'Pending' | 'Verified' | 'Resolved';

export type IncidentType =
  | 'Accident'
  | 'Road Construction'
  | 'Flooding'
  | 'Broken Traffic Light'
  | 'Road Closure'
  | 'Vehicle Breakdown'
  | 'Police Checkpoint'
  | 'Other Hazard';

export type NavTab = 'home' | 'map' | 'reports' | 'insights' | 'profile';

export type Coordinate = {
  latitude: number;
  longitude: number;
};

export type CongestionSegment = {
  id: string;
  roadName: string;
  level: TrafficLevel;
  averageSpeed: number;
  travelTimeMinutes: number;
  coordinates: Coordinate[];
};

export type DashboardMetric = {
  id: string;
  label: string;
  value: string;
  change?: string;
  tone?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
};

export type QuickAction = {
  id: string;
  label: string;
  icon: string;
  route: string;
  tone: 'primary' | 'secondary' | 'success' | 'warning';
};

export type IncidentReport = {
  id: string;
  type: IncidentType;
  description: string;
  severity: 'Low' | 'Medium' | 'High';
  status: IncidentStatus;
  roadName: string;
  timestamp: string;
  reporterName: string;
  reporterRole: string;
  image: string;
  coordinate: Coordinate;
  upvotes: number;
  verifiedByCommunity: number;
};

export type NotificationItem = {
  id: string;
  category: 'Traffic Alerts' | 'Route Updates' | 'Incident Updates' | 'Community Notifications';
  title: string;
  message: string;
  time: string;
  unread: boolean;
};

export type RewardBadge = {
  id: string;
  name: string;
  description: string;
  progress: number;
  unlocked: boolean;
};

export type LeaderboardEntry = {
  id: string;
  name: string;
  points: number;
  trackingHours: number;
  reports: number;
};

export type ChartDatum = {
  label: string;
  value: number;
  highlight?: boolean;
};

export type RouteInsight = {
  id: string;
  name: string;
  typicalTraffic: string;
  averageSpeed: string;
  peakTimes: string;
  bestTravelTime: string;
};

export type GovernmentMetric = {
  id: string;
  label: string;
  value: string;
  insight: string;
};

export type OnboardingSlide = {
  id: string;
  title: string;
  description: string;
  accent: string;
};
