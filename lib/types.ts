export type Team = {
  id: number;
  name: string;
  logo?: string;
};

export type Fixture = {
  id: number | string;
  date: string;
  timestamp?: number;
  status: string;
  league: { id?: number; name: string; logo?: string; season?: number };
  venue?: { name?: string; city?: string };
  home: Team;
  away: Team;
  goals?: { home: number | null; away: number | null };
  isDemo?: boolean;
};

export type RecentMatch = {
  fixtureId: number | string;
  date: string;
  opponent: string;
  venue: "home" | "away";
  gf: number;
  ga: number;
  result: "W" | "D" | "L";
};

export type TeamForm = {
  matches: RecentMatch[];
  weightedPointsPct: number;
  avgGoalsFor: number;
  avgGoalsAgainst: number;
  restDays: number | null;
};

export type Weather = {
  temperature?: number;
  precipitationProbability?: number;
  windSpeed?: number;
  label: string;
};

export type SourceAudit = {
  name: string;
  status: "ok" | "partial" | "missing";
  note: string;
};

export type Scoreline = { score: string; probability: number };

export type Prediction = {
  homeWin: number;
  draw: number;
  awayWin: number;
  expectedHomeGoals: number;
  expectedAwayGoals: number;
  topScorelines: Scoreline[];
  modelNote: string;
};

export type MatchAnalysis = {
  fixture: Fixture;
  homeForm: TeamForm;
  awayForm: TeamForm;
  homeElo?: number;
  awayElo?: number;
  homeInjuries: number;
  awayInjuries: number;
  h2h: RecentMatch[];
  weather?: Weather;
  verifiedByFootballData: boolean;
  externalPrediction?: { home: number; draw: number; away: number };
  prediction: Prediction;
  confidence: number;
  sources: SourceAudit[];
  generatedAt: string;
};
