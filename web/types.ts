import type { Day, Detail } from "../server/domain";
export type Summary = Record<string, { value: number | null; count: number }>;
export type Dashboard = {
  exploration: Day[];
  lifetime: ReturnType<typeof import("../server/analytics").lifetimeStats>;
  analytics: ReturnType<typeof import("../server/analytics").analyticsPayload>;
  name: string;
  start: string;
  end: string;
  earliest: string | null;
  latest: string | null;
  lastSync: string | null;
  summary: Summary;
  previous: Summary;
  previousStart: string;
  previousEnd: string;
  days: Day[];
  chart: { mode: string; points: Record<string, any>[] };
  details: Detail[];
  body: Detail | null;
};
export type Member = {
  name: string;
  connected: boolean;
  shareUrl: string | null;
};
export type Sync = {
  connected: boolean;
  lastSync: string | null;
  jobs: {
    kind: string;
    status: string;
    count: number;
    error: string | null;
    mode: string | null;
  }[];
};
