export type ReportStatus = 'Pending' | 'Verified' | 'Resolved';

export type ReportSeverity = 'Low' | 'Medium' | 'High';

export type ReportSummary = {
  id: string;
  type: string;
  location: string;
  city: string;
  time: string;
  status: ReportStatus;
  icon: string;
  iconBg: string;
  iconColor: string;
};

export type ReportDetail = ReportSummary & {
  header: string;
  badgeTone: 'success' | 'warning' | 'danger';
  severity: ReportSeverity;
  severityLabel: string;
  reporter: string;
  reporterMeta: string;
  statusLabel: string;
  statusDetail: string;
  verifiedCount: number;
  voteCount: number;
  description: string;
};

export const reportStatuses: ReportStatus[] = ['Pending', 'Verified', 'Resolved'];

export const reportSummaries: ReportSummary[] = [
  {
    id: 'accident-1',
    type: 'Accident',
    location: 'EDSA-Shaw Blvd',
    city: 'Mandaluyong',
    time: 'Today, 2:34 PM',
    status: 'Verified',
    icon: 'car-estate',
    iconBg: '#F8F5FF',
    iconColor: '#5B21F0',
  },
  {
    id: 'flooding-1',
    type: 'Flooding',
    location: 'Roxas Blvd',
    city: 'Manila',
    time: 'Today, 11:12 AM',
    status: 'Pending',
    icon: 'wave',
    iconBg: '#ECFBF7',
    iconColor: '#14B8A6',
  },
  {
    id: 'construction-1',
    type: 'Road Construction',
    location: 'C5 Road',
    city: 'Taguig',
    time: 'Yesterday, 4:55 PM',
    status: 'Resolved',
    icon: 'road-variant',
    iconBg: '#FFF9E8',
    iconColor: '#F59E0B',
  },
  {
    id: 'checkpoint-1',
    type: 'Police Checkpoint',
    location: 'Katipunan Ave',
    city: 'QC',
    time: 'Jun 4, 8:30 AM',
    status: 'Resolved',
    icon: 'police-badge',
    iconBg: '#F3E8FF',
    iconColor: '#A855F7',
  },
  {
    id: 'breakdown-1',
    type: 'Vehicle Breakdown',
    location: 'NLEX',
    city: 'Valenzuela',
    time: 'Jun 3, 6:00 PM',
    status: 'Resolved',
    icon: 'car-wrench',
    iconBg: '#FFF1F2',
    iconColor: '#EF4444',
  },
];

export const reportDetails: Record<string, ReportDetail> = {
  'accident-1': {
    ...reportSummaries[0],
    header: 'INCIDENT TYPE',
    badgeTone: 'danger',
    severity: 'High',
    severityLabel: 'High Severity',
    reporter: 'Anonymous User #4821',
    reporterMeta: 'Reported by',
    statusLabel: 'Verified by community',
    statusDetail: '8 users confirmed this incident',
    verifiedCount: 8,
    voteCount: 8,
    description: 'Two vehicles are blocking a lane near the intersection. Traffic is moving slowly and emergency response is recommended.',
  },
  'flooding-1': {
    ...reportSummaries[1],
    header: 'INCIDENT TYPE',
    badgeTone: 'warning',
    severity: 'Medium',
    severityLabel: 'Medium Severity',
    reporter: 'Anonymous User #2187',
    reporterMeta: 'Reported by',
    statusLabel: 'Pending review',
    statusDetail: 'Waiting for community confirmation',
    verifiedCount: 2,
    voteCount: 4,
    description: 'Water has pooled across the curb lane after light rain. Smaller vehicles are slowly diverting around the hotspot.',
  },
  'construction-1': {
    ...reportSummaries[2],
    header: 'INCIDENT TYPE',
    badgeTone: 'success',
    severity: 'Low',
    severityLabel: 'Low Severity',
    reporter: 'Anonymous User #1268',
    reporterMeta: 'Reported by',
    statusLabel: 'Resolved by city crew',
    statusDetail: 'Road work completed earlier today',
    verifiedCount: 6,
    voteCount: 12,
    description: 'Lane narrowing and patching work caused delays during the afternoon peak, but the obstruction has been cleared.',
  },
  'checkpoint-1': {
    ...reportSummaries[3],
    header: 'INCIDENT TYPE',
    badgeTone: 'success',
    severity: 'Low',
    severityLabel: 'Low Severity',
    reporter: 'Anonymous User #9031',
    reporterMeta: 'Reported by',
    statusLabel: 'Verified by police',
    statusDetail: '4 users corroborated the checkpoint',
    verifiedCount: 4,
    voteCount: 9,
    description: 'A checkpoint is slowing traffic slightly near the intersection. Vehicles are being directed one lane at a time.',
  },
  'breakdown-1': {
    ...reportSummaries[4],
    header: 'INCIDENT TYPE',
    badgeTone: 'success',
    severity: 'Medium',
    severityLabel: 'Medium Severity',
    reporter: 'Anonymous User #7710',
    reporterMeta: 'Reported by',
    statusLabel: 'Cleared',
    statusDetail: 'Vehicle removed from shoulder',
    verifiedCount: 5,
    voteCount: 10,
    description: 'A stalled vehicle was blocking part of the shoulder and causing a small backup. Traffic has since normalized.',
  },
};

export function getReportDetail(id?: string) {
  if (!id) {
    return reportDetails['accident-1'];
  }

  return reportDetails[id] ?? reportDetails['accident-1'];
}

export const reportIncidentTypes = [
  {
    id: 'accident',
    label: 'Accident',
    icon: 'car-estate',
    iconBg: '#F8F5FF',
    iconColor: '#5B21F0',
  },
  {
    id: 'construction',
    label: 'Road Construction',
    icon: 'road-variant',
    iconBg: '#FFF9E8',
    iconColor: '#F59E0B',
  },
  {
    id: 'flooding',
    label: 'Flooding',
    icon: 'wave',
    iconBg: '#ECFBF7',
    iconColor: '#14B8A6',
  },
  {
    id: 'signal',
    label: 'Broken Traffic Light',
    icon: 'traffic-light',
    iconBg: '#FFF1F2',
    iconColor: '#EF4444',
  },
  {
    id: 'closure',
    label: 'Road Closure',
    icon: 'close-circle-outline',
    iconBg: '#F4F6FB',
    iconColor: '#64748B',
  },
  {
    id: 'breakdown',
    label: 'Vehicle Breakdown',
    icon: 'car-wrench',
    iconBg: '#FFF1F2',
    iconColor: '#EF4444',
  },
  {
    id: 'checkpoint',
    label: 'Police Checkpoint',
    icon: 'police-badge',
    iconBg: '#F3E8FF',
    iconColor: '#A855F7',
  },
  {
    id: 'hazard',
    label: 'Other Hazard',
    icon: 'alert-outline',
    iconBg: '#FFF9E8',
    iconColor: '#F59E0B',
  },
] as const;

export const severityOptions = [
  { id: 'low', label: 'Low', color: '#22C55E', bg: '#EEFDF2' },
  { id: 'medium', label: 'Medium', color: '#F59E0B', bg: '#FFF9E8' },
  { id: 'high', label: 'High', color: '#F43F5E', bg: '#FFF1F2' },
  { id: 'critical', label: 'Critical', color: '#EF4444', bg: '#FFE4E9' },
] as const;

export const locationSuggestions = [
  'EDSA-Shaw Blvd Intersection',
  'C5 Road Near BGC',
  'Roxas Blvd Service Road',
  'Katipunan Ave Extension',
] as const;
