import type { Prediction } from "./types";

export function buildPrediction(input: {
  homeAvgGF: number;
  homeAvgGA: number;
  awayAvgGF: number;
  awayAvgGA: number;
  homeElo?: number;
  awayElo?: number;
  homeRestDays?: number | null;
  awayRestDays?: number | null;
  homeInjuries?: number;
  awayInjuries?: number;
  externalPrediction?: { home: number; draw: number; away: number };
}): Prediction;
