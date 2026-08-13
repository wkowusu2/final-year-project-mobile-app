export type RoadAdvisory = {
  id: string; title: string; description: string; type: string; status: 'planned' | 'active'; impact: 'low' | 'moderate' | 'high';
  affectedRoadOsmId: string | null; roadName: string; city: string; latitude: number | null; longitude: number | null; startsAt: string; endsAt: string | null;
};

export type RoadAdvisoriesResponse = { success: boolean; data: { advisories: RoadAdvisory[] } | null; error: string | null };
