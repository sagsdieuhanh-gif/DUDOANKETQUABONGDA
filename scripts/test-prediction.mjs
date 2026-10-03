import assert from "node:assert/strict";
import { buildPrediction } from "../lib/prediction.mjs";

const p = buildPrediction({
  homeAvgGF: 2.0, homeAvgGA: 0.8, awayAvgGF: 1.4, awayAvgGA: 1.2,
  homeElo: 2050, awayElo: 1900, homeRestDays: 6, awayRestDays: 4,
  homeInjuries: 1, awayInjuries: 2
});
const sum = p.homeWin + p.draw + p.awayWin;
assert.ok(Math.abs(sum - 100) < 0.0001, `probability sum = ${sum}`);
assert.ok(p.expectedHomeGoals > 0 && p.expectedAwayGoals > 0);
assert.equal(p.topScorelines.length, 5);
assert.ok(p.homeWin > p.awayWin, "stronger home side should be favored in this fixture");
console.log("✓ prediction model tests passed");
console.log(JSON.stringify(p, null, 2));
