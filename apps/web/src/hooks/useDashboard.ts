import { useState, useEffect } from 'react';
import type { Candidate, HiringFlow, ActivityItem } from '../types';
import {
  candidates as mockCandidates,
  hiringFlows as mockFlows,
  activityItems as mockActivity,
} from '../data/mockData';

interface DashboardMetrics {
  totalCandidates: number;
  activeFlows: number;
  outreachSent: number;
  responseRate: number;
  candidatesChange: number;
  flowsChange: number;
  outreachChange: number;
  rateChange: number;
}

interface DashboardState {
  candidates: Candidate[];
  hiringFlows: HiringFlow[];
  activityItems: ActivityItem[];
  metrics: DashboardMetrics;
  isLoading: boolean;
}

const emptyMetrics: DashboardMetrics = {
  totalCandidates: 0,
  activeFlows: 0,
  outreachSent: 0,
  responseRate: 0,
  candidatesChange: 0,
  flowsChange: 0,
  outreachChange: 0,
  rateChange: 0,
};

export function useDashboard(): DashboardState {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<Omit<DashboardState, 'isLoading'> | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setData({
        candidates: mockCandidates,
        hiringFlows: mockFlows,
        activityItems: mockActivity,
        metrics: {
          totalCandidates: 48,
          activeFlows: 3,
          outreachSent: 156,
          responseRate: 34,
          candidatesChange: 12,
          flowsChange: 1,
          outreachChange: 23,
          rateChange: 18,
        },
      });
      setIsLoading(false);
    }, 700);
    return () => clearTimeout(timer);
  }, []);

  return {
    candidates: data?.candidates ?? [],
    hiringFlows: data?.hiringFlows ?? [],
    activityItems: data?.activityItems ?? [],
    metrics: data?.metrics ?? emptyMetrics,
    isLoading,
  };
}
