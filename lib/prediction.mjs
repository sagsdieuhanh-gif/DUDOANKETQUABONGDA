const clamp = (min, max, value) => Math.min(max, Math.max(min, value));

function factorial(n) {
  let value = 1;
  for (let i = 2; i <= n; i += 1) value *= i;
  return value;
}

function poisson(k, lambda) {
  return Math.exp(-lambda) * Math.pow(lambda, k) / factorial(k);
}

function normalize3(home, draw, away) {
  const total = home + draw + away || 1;
  return { home: home / total, draw: draw / total, away: away / total };
}

export function buildPrediction(input) {
  const leagueGoalBaseline = 1.35;
  const homeAttack = Number.isFinite(input.homeAvgGF) ? input.homeAvgGF : leagueGoalBaseline;
  const awayAttack = Number.isFinite(input.awayAvgGF) ? input.awayAvgGF : leagueGoalBaseline;
  const homeDefense = Number.isFinite(input.homeAvgGA) ? input.homeAvgGA : leagueGoalBaseline;
  const awayDefense = Number.isFinite(input.awayAvgGA) ? input.awayAvgGA : leagueGoalBaseline;

  let homeLambda = (homeAttack * 0.58 + awayDefense * 0.42) * 1.10;
  let awayLambda = (awayAttack * 0.58 + homeDefense * 0.42) * 0.96;

  if (Number.isFinite(input.homeElo) && Number.isFinite(input.awayElo)) {
    const eloDiff = clamp(-450, 450, input.homeElo - input.awayElo);
    const eloFactor = Math.pow(10, eloDiff / 1600);
    homeLambda *= eloFactor;
    awayLambda /= eloFactor;
  }

  if (Number.isFinite(input.homeRestDays) && Number.isFinite(input.awayRestDays)) {
    const restDiff = clamp(-5, 5, input.homeRestDays - input.awayRestDays);
    homeLambda *= 1 + restDiff * 0.012;
    awayLambda *= 1 - restDiff * 0.010;
  }

  const homeAvailabilityPenalty = Math.pow(0.985, Math.min(input.homeInjuries || 0, 8));
  const awayAvailabilityPenalty = Math.pow(0.985, Math.min(input.awayInjuries || 0, 8));
  homeLambda *= homeAvailabilityPenalty;
  awayLambda *= awayAvailabilityPenalty;

  homeLambda = clamp(0.25, 3.8, homeLambda);
  awayLambda = clamp(0.20, 3.5, awayLambda);

  let home = 0;
  let draw = 0;
  let away = 0;
  const scorelines = [];

  for (let hg = 0; hg <= 7; hg += 1) {
    for (let ag = 0; ag <= 7; ag += 1) {
      const p = poisson(hg, homeLambda) * poisson(ag, awayLambda);
      scorelines.push({ score: `${hg}-${ag}`, probability: p });
      if (hg > ag) home += p;
      else if (hg === ag) draw += p;
      else away += p;
    }
  }

  let normalized = normalize3(home, draw, away);
  if (input.externalPrediction) {
    const ext = normalize3(
      input.externalPrediction.home,
      input.externalPrediction.draw,
      input.externalPrediction.away
    );
    normalized = normalize3(
      normalized.home * 0.75 + ext.home * 0.25,
      normalized.draw * 0.75 + ext.draw * 0.25,
      normalized.away * 0.75 + ext.away * 0.25
    );
  }

  scorelines.sort((a, b) => b.probability - a.probability);
  const scorelineTotal = scorelines.reduce((sum, row) => sum + row.probability, 0) || 1;

  return {
    homeWin: normalized.home * 100,
    draw: normalized.draw * 100,
    awayWin: normalized.away * 100,
    expectedHomeGoals: homeLambda,
    expectedAwayGoals: awayLambda,
    topScorelines: scorelines.slice(0, 5).map((row) => ({
      score: row.score,
      probability: (row.probability / scorelineTotal) * 100
    })),
    modelNote: input.externalPrediction
      ? "Poisson theo phong độ + Elo + nghỉ + vắng mặt, blend 25% PlayerElo."
      : "Poisson theo phong độ + Elo + nghỉ + vắng mặt. PlayerElo chưa có nên không blend."
  };
}
