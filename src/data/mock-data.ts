import {
  ChartDatum,
  CongestionSegment,
  DashboardMetric,
  GovernmentMetric,
  IncidentReport,
  LeaderboardEntry,
  NotificationItem,
  OnboardingSlide,
  QuickAction,
  RewardBadge,
  RouteInsight,
} from '@/src/types/app';

export const currentUser = {
  name: 'Ama Mensah',
  location: 'Ring Road Central, Accra',
  contributionLevel: 'City Pulse Champion',
  contributionScore: 4820,
  kilometersTracked: 1284,
  reportsSubmitted: 46,
  trackingHours: 312,
  photoInitials: 'AM',
};

export const onboardingSlides: OnboardingSlide[] = [
  {
    id: 'planning',
    title: 'Help Improve Traffic Planning',
    description: 'Contribute anonymous movement insights that help city planners understand how roads behave every day.',
    accent: '#2563EB',
  },
  {
    id: 'anonymous',
    title: 'Share Anonymous Traffic Data',
    description: 'TrafficPulse protects your identity while converting trips into congestion intelligence for smarter mobility.',
    accent: '#14B8A6',
  },
  {
    id: 'live',
    title: 'View Live Traffic Conditions',
    description: 'Check congestion colors, incident clusters, and route quality before you leave or while you commute.',
    accent: '#F59E0B',
  },
  {
    id: 'cities',
    title: 'Support Smarter Cities',
    description: 'Help commuters, agencies, and emergency teams make faster traffic decisions with community-powered data.',
    accent: '#22C55E',
  },
];

export const dashboardMetrics: DashboardMetric[] = [
  { id: 'speed', label: 'Current Speed', value: '38 km/h', change: '+6 km/h', tone: 'primary' },
  { id: 'distance', label: 'Distance Today', value: '46.2 km', change: '3 trips', tone: 'secondary' },
  { id: 'tracking', label: 'Tracking Status', value: 'Active', change: 'GPS 4m', tone: 'success' },
];

export const quickActions: QuickAction[] = [
  { id: 'start', label: 'Start Tracking', icon: '▶', route: '/active-tracking', tone: 'primary' },
  { id: 'stop', label: 'Stop Tracking', icon: '■', route: '/home', tone: 'warning' },
  { id: 'report', label: 'Report Incident', icon: '!', route: '/report-incident', tone: 'secondary' },
  { id: 'analytics', label: 'View Analytics', icon: '↗', route: '/traffic-insights', tone: 'success' },
];

export const congestionSegments: CongestionSegment[] = [
  {
    id: 'independence-ave',
    roadName: 'Independence Avenue',
    level: 'free',
    averageSpeed: 54,
    travelTimeMinutes: 6,
    coordinates: [
      { latitude: 5.5611, longitude: -0.1978 },
      { latitude: 5.5651, longitude: -0.1887 },
      { latitude: 5.5718, longitude: -0.1784 },
    ],
  },
  {
    id: 'ring-road',
    roadName: 'Ring Road Central',
    level: 'moderate',
    averageSpeed: 31,
    travelTimeMinutes: 13,
    coordinates: [
      { latitude: 5.5732, longitude: -0.2051 },
      { latitude: 5.579, longitude: -0.1902 },
      { latitude: 5.5826, longitude: -0.1754 },
    ],
  },
  {
    id: 'graphic-road',
    roadName: 'Graphic Road',
    level: 'heavy',
    averageSpeed: 17,
    travelTimeMinutes: 21,
    coordinates: [
      { latitude: 5.5652, longitude: -0.2251 },
      { latitude: 5.5704, longitude: -0.2147 },
      { latitude: 5.5745, longitude: -0.1996 },
    ],
  },
  {
    id: 'spintex',
    roadName: 'Spintex Road',
    level: 'severe',
    averageSpeed: 9,
    travelTimeMinutes: 33,
    coordinates: [
      { latitude: 5.6197, longitude: -0.1207 },
      { latitude: 5.631, longitude: -0.1091 },
      { latitude: 5.6466, longitude: -0.0952 },
    ],
  },
];

export const incidents: IncidentReport[] = [
  {
    id: 'inc-001',
    type: 'Accident',
    description: 'Two vehicles blocking the outer lane near the underpass. Traffic moving slowly through one lane.',
    severity: 'High',
    status: 'Verified',
    roadName: 'Graphic Road Interchange',
    timestamp: '8 min ago',
    reporterName: 'Kwesi Boateng',
    reporterRole: 'Community Driver',
    image: 'collision',
    coordinate: { latitude: 5.5721, longitude: -0.2088 },
    upvotes: 42,
    verifiedByCommunity: 18,
  },
  {
    id: 'inc-002',
    type: 'Flooding',
    description: 'Water buildup affecting the curb lane after rainfall. Smaller vehicles diverting around the hotspot.',
    severity: 'Medium',
    status: 'Pending',
    roadName: 'Kaneshie First Light',
    timestamp: '21 min ago',
    reporterName: 'Abena Owusu',
    reporterRole: 'Daily Commuter',
    image: 'flood',
    coordinate: { latitude: 5.5766, longitude: -0.2355 },
    upvotes: 23,
    verifiedByCommunity: 9,
  },
  {
    id: 'inc-003',
    type: 'Road Construction',
    description: 'Asphalt patching and lane narrowing causing delays during the afternoon peak period.',
    severity: 'Low',
    status: 'Resolved',
    roadName: 'Liberation Road',
    timestamp: '1 hr ago',
    reporterName: 'Nii Sowa',
    reporterRole: 'Traffic Volunteer',
    image: 'construction',
    coordinate: { latitude: 5.6031, longitude: -0.1687 },
    upvotes: 16,
    verifiedByCommunity: 11,
  },
];

export const notifications: NotificationItem[] = [
  {
    id: 'notif-1',
    category: 'Traffic Alerts',
    title: 'Heavy congestion on Spintex Road',
    message: 'Travel time has increased by 18 minutes between Coca-Cola and Baatsonaa.',
    time: 'Now',
    unread: true,
  },
  {
    id: 'notif-2',
    category: 'Route Updates',
    title: 'Faster route available via Liberation Road',
    message: 'TrafficPulse found a route saving 12 minutes toward Airport City.',
    time: '12 min ago',
    unread: true,
  },
  {
    id: 'notif-3',
    category: 'Incident Updates',
    title: 'Graphic Road accident verified',
    message: 'Community members confirmed the obstruction and emergency services are on scene.',
    time: '38 min ago',
    unread: false,
  },
  {
    id: 'notif-4',
    category: 'Community Notifications',
    title: 'You earned the Peak Hour Scout badge',
    message: 'Thanks for contributing during high-impact commuting hours this week.',
    time: 'Yesterday',
    unread: false,
  },
];

export const rewards: RewardBadge[] = [
  { id: 'badge-1', name: 'Peak Hour Scout', description: 'Track 20 rush-hour journeys.', progress: 100, unlocked: true },
  { id: 'badge-2', name: 'Incident Guardian', description: 'Submit 15 useful incident reports.', progress: 80, unlocked: false },
  { id: 'badge-3', name: 'Route Analyst', description: 'Review route intelligence for 10 corridors.', progress: 60, unlocked: false },
];

export const leaderboard: LeaderboardEntry[] = [
  { id: 'lead-1', name: 'Sarah Addo', points: 6280, trackingHours: 410, reports: 58 },
  { id: 'lead-2', name: 'Ama Mensah', points: 4820, trackingHours: 312, reports: 46 },
  { id: 'lead-3', name: 'Kojo Armah', points: 4510, trackingHours: 288, reports: 39 },
  { id: 'lead-4', name: 'Mansa Quaye', points: 3970, trackingHours: 251, reports: 34 },
];

export const trafficByHour: ChartDatum[] = [
  { label: '6a', value: 26 },
  { label: '8a', value: 78, highlight: true },
  { label: '10a', value: 44 },
  { label: '12p', value: 58 },
  { label: '3p', value: 64 },
  { label: '6p', value: 88, highlight: true },
  { label: '9p', value: 32 },
];

export const trafficByDay: ChartDatum[] = [
  { label: 'Mon', value: 82 },
  { label: 'Tue', value: 76 },
  { label: 'Wed', value: 71 },
  { label: 'Thu', value: 85, highlight: true },
  { label: 'Fri', value: 91, highlight: true },
  { label: 'Sat', value: 48 },
  { label: 'Sun', value: 35 },
];

export const heatmapCells: ChartDatum[] = [
  { label: 'CBD', value: 92 },
  { label: 'Airport', value: 76 },
  { label: 'Spintex', value: 88 },
  { label: 'Osu', value: 63 },
  { label: 'Kaneshie', value: 84 },
  { label: 'Circle', value: 95 },
];

export const routeComparison: ChartDatum[] = [
  { label: 'Liberation', value: 24 },
  { label: 'Ring Road', value: 31 },
  { label: 'Spintex', value: 42 },
  { label: 'Graphic', value: 37 },
];

export const routeInsights: RouteInsight[] = [
  {
    id: 'route-1',
    name: 'Liberation Road → Airport City',
    typicalTraffic: 'Moderate in the morning, heavy after 5:30 PM',
    averageSpeed: '34 km/h',
    peakTimes: '7:15–9:00 AM, 5:20–7:10 PM',
    bestTravelTime: 'Before 6:45 AM or after 8:10 PM',
  },
  {
    id: 'route-2',
    name: 'Spintex Road → Tetteh Quarshie',
    typicalTraffic: 'Severe around the malls and major intersections',
    averageSpeed: '18 km/h',
    peakTimes: '7:00–10:00 AM, 4:45–8:00 PM',
    bestTravelTime: '11:00 AM–2:30 PM',
  },
];

export const governmentMetrics: GovernmentMetric[] = [
  {
    id: 'gov-1',
    label: 'Congested Road Ranking',
    value: '#1 Spintex Road',
    insight: 'Average peak-hour delay increased 14% compared with last month.',
  },
  {
    id: 'gov-2',
    label: 'Traffic Growth Trend',
    value: '+9.2%',
    insight: 'Vehicle activity is growing fastest in eastbound commuter corridors.',
  },
  {
    id: 'gov-3',
    label: 'Expansion Priority',
    value: 'Graphic Rd Interchange',
    insight: 'Signal retiming and lane optimization could reduce delay by 18–24%.',
  },
  {
    id: 'gov-4',
    label: 'Peak Hour Analysis',
    value: '6:00 PM strongest surge',
    insight: 'Friday shows the highest recurring network-wide congestion profile.',
  },
];
