import type { BookmakerOdds, Fixture, MatchAnalysis, RecentMatch, TeamForm } from "@/lib/types";
import { buildPrediction } from "@/lib/prediction.mjs";

const logo = (id: number) => "https://media.api-sports.io/football/teams/" + id + ".png";

const fixtures: Fixture[] = [
  { id:"demo-1", date:"2026-10-04T22:30:00+07:00", status:"NS", isDemo:true, league:{id:39,name:"Premier League",season:2026}, venue:{name:"Emirates Stadium",city:"London"}, home:{id:42,name:"Arsenal",logo:logo(42)}, away:{id:40,name:"Liverpool",logo:logo(40)} },
  { id:"demo-2", date:"2026-10-04T19:30:00+07:00", status:"NS", isDemo:true, league:{id:39,name:"Premier League",season:2026}, venue:{name:"Etihad Stadium",city:"Manchester"}, home:{id:50,name:"Man City",logo:logo(50)}, away:{id:1359,name:"Luton Town"} },
  { id:"demo-3", date:"2026-10-04T21:15:00+07:00", status:"NS", isDemo:true, league:{id:140,name:"La Liga",season:2026}, venue:{name:"Santiago Bernabéu",city:"Madrid"}, home:{id:541,name:"Real Madrid",logo:logo(541)}, away:{id:529,name:"Barcelona",logo:logo(529)} },
  { id:"demo-4", date:"2026-10-04T23:00:00+07:00", status:"NS", isDemo:true, league:{id:135,name:"Serie A",season:2026}, venue:{name:"San Siro",city:"Milan"}, home:{id:505,name:"Inter Milan",logo:logo(505)}, away:{id:489,name:"AC Milan",logo:logo(489)} },
  { id:"demo-5", date:"2026-10-04T20:30:00+07:00", status:"NS", isDemo:true, league:{id:78,name:"Bundesliga",season:2026}, venue:{name:"Allianz Arena",city:"Munich"}, home:{id:157,name:"Bayern Munich",logo:logo(157)}, away:{id:165,name:"Dortmund",logo:logo(165)} },
  { id:"demo-6", date:"2026-10-04T22:45:00+07:00", status:"NS", isDemo:true, league:{id:61,name:"Ligue 1",season:2026}, venue:{name:"Parc des Princes",city:"Paris"}, home:{id:85,name:"PSG",logo:logo(85)}, away:{id:81,name:"Marseille",logo:logo(81)} },
  { id:"demo-7", date:"2026-10-04T19:15:00+07:00", status:"NS", isDemo:true, league:{id:340,name:"V-League",season:2026}, venue:{name:"Hàng Đẫy",city:"Hà Nội"}, home:{id:10001,name:"Thể Công Viettel"}, away:{id:10002,name:"Hà Nội FC"} }
];

function recent(prefix:number, rows:Array<[string,string,number,number,"home"|"away"]>):RecentMatch[] {
  return rows.map((r,i)=>({fixtureId:prefix+"-"+i,date:r[0],opponent:r[1],gf:r[2],ga:r[3],venue:r[4],result:r[2]>r[3]?"W":r[2]===r[3]?"D":"L"}));
}
function form(matches:RecentMatch[],pct:number,gf:number,ga:number,rest:number):TeamForm {
  return {matches,weightedPointsPct:pct,avgGoalsFor:gf,avgGoalsAgainst:ga,restDays:rest};
}
const demoOdds:BookmakerOdds[]=[
 {id:1,name:"BetPro",updatedAt:"2026-10-03T14:00:00+07:00",markets:[
  {name:"Match Winner",values:[{value:"Home",odd:"1.95"},{value:"Draw",odd:"3.60"},{value:"Away",odd:"3.40"}]},
  {name:"Goals Over/Under",values:[{value:"Over 2.5",odd:"1.88"},{value:"Under 2.5",odd:"1.98"}]},
  {name:"Asian Handicap",values:[{value:"Home -0.5",odd:"1.92"},{value:"Away +0.5",odd:"1.94"}]},
  {name:"Both Teams Score",values:[{value:"Yes",odd:"1.72"},{value:"No",odd:"2.08"}]},
  {name:"Double Chance",values:[{value:"1X",odd:"1.31"},{value:"12",odd:"1.29"},{value:"X2",odd:"1.84"}]}
 ]},
 {id:2,name:"Win365",updatedAt:"2026-10-03T14:00:00+07:00",markets:[
  {name:"Match Winner",values:[{value:"Home",odd:"1.97"},{value:"Draw",odd:"3.64"},{value:"Away",odd:"3.48"}]},
  {name:"Goals Over/Under",values:[{value:"Over 2.5",odd:"1.91"},{value:"Under 2.5",odd:"1.96"}]},
  {name:"Asian Handicap",values:[{value:"Home -0.5",odd:"1.95"},{value:"Away +0.5",odd:"1.93"}]},
  {name:"Both Teams Score",values:[{value:"Yes",odd:"1.75"},{value:"No",odd:"2.05"}]}
 ]},
 {id:3,name:"LuckyBet",updatedAt:"2026-10-03T14:00:00+07:00",markets:[
  {name:"Match Winner",values:[{value:"Home",odd:"1.94"},{value:"Draw",odd:"3.55"},{value:"Away",odd:"3.50"}]},
  {name:"Goals Over/Under",values:[{value:"Over 2.5",odd:"1.90"},{value:"Under 2.5",odd:"1.95"}]},
  {name:"Asian Handicap",values:[{value:"Home -0.5",odd:"1.90"},{value:"Away +0.5",odd:"1.96"}]},
  {name:"Both Teams Score",values:[{value:"Yes",odd:"1.73"},{value:"No",odd:"2.10"}]}
 ]},
 {id:4,name:"VivaBet",updatedAt:"2026-10-03T14:00:00+07:00",markets:[
  {name:"Match Winner",values:[{value:"Home",odd:"1.98"},{value:"Draw",odd:"3.58"},{value:"Away",odd:"3.42"}]},
  {name:"Goals Over/Under",values:[{value:"Over 2.5",odd:"1.87"},{value:"Under 2.5",odd:"2.00"}]},
  {name:"Asian Handicap",values:[{value:"Home -0.5",odd:"1.94"},{value:"Away +0.5",odd:"1.94"}]},
  {name:"Both Teams Score",values:[{value:"Yes",odd:"1.70"},{value:"No",odd:"2.12"}]}
 ]},
 {id:5,name:"ZoneBet",updatedAt:"2026-10-03T14:00:00+07:00",markets:[
  {name:"Match Winner",values:[{value:"Home",odd:"1.93"},{value:"Draw",odd:"3.62"},{value:"Away",odd:"3.55"}]},
  {name:"Goals Over/Under",values:[{value:"Over 2.5",odd:"1.92"},{value:"Under 2.5",odd:"1.94"}]},
  {name:"Asian Handicap",values:[{value:"Home -0.5",odd:"1.91"},{value:"Away +0.5",odd:"1.97"}]},
  {name:"Both Teams Score",values:[{value:"Yes",odd:"1.74"},{value:"No",odd:"2.06"}]}
 ]}
];

export function demoFixtures():Fixture[]{ return fixtures; }

export function demoAnalysis(id:string):MatchAnalysis {
 const fixture=fixtures.find(f=>String(f.id)===id)??fixtures[0];
 const homeMatches=recent(1,[
  ["2026-09-27T20:00:00Z","BHA",2,0,"home"],["2026-09-20T20:00:00Z","MCI",1,0,"away"],["2026-09-13T20:00:00Z","CHE",2,2,"home"],["2026-09-06T20:00:00Z","BRE",1,0,"away"],["2026-08-30T20:00:00Z","SHU",6,0,"home"]
 ]);
 const awayMatches=recent(2,[
  ["2026-09-28T20:00:00Z","MUN",3,0,"home"],["2026-09-21T20:00:00Z","EVE",0,2,"away"],["2026-09-14T20:00:00Z","NFO",3,1,"home"],["2026-09-07T20:00:00Z","BHA",2,1,"away"],["2026-08-31T20:00:00Z","MCI",1,1,"home"]
 ]);
 const homeForm=form(homeMatches,86,2.0,0.65,7), awayForm=form(awayMatches,61,1.38,1.02,6);
 const externalPrediction={home:0.48,draw:0.25,away:0.27};
 const prediction = String(fixture.id) === "demo-1" ? {
  homeWin: 44,
  draw: 26,
  awayWin: 30,
  expectedHomeGoals: 1.62,
  expectedAwayGoals: 1.18,
  topScorelines: [
    { score: "2-1", probability: 13.4 },
    { score: "1-1", probability: 11.8 },
    { score: "1-0", probability: 9.6 },
    { score: "2-0", probability: 8.7 },
    { score: "1-2", probability: 8.2 }
  ],
  modelNote: "Dữ liệu minh họa dùng để tái hiện giao diện mẫu."
} : buildPrediction({homeAvgGF:homeForm.avgGoalsFor,homeAvgGA:homeForm.avgGoalsAgainst,awayAvgGF:awayForm.avgGoalsFor,awayAvgGA:awayForm.avgGoalsAgainst,homeElo:2604,awayElo:2396,homeRestDays:7,awayRestDays:6,homeInjuries:1,awayInjuries:2,externalPrediction});
 const h2h=recent(9,[
  ["2026-05-12T20:00:00Z",fixture.away.name,2,1,"home"],["2025-12-20T20:00:00Z",fixture.away.name,1,1,"away"],["2025-04-06T20:00:00Z",fixture.away.name,3,2,"home"],["2024-11-17T20:00:00Z",fixture.away.name,0,1,"away"],["2024-03-09T20:00:00Z",fixture.away.name,2,0,"home"]
 ]);
 return {
  fixture,homeForm,awayForm,homeElo:2604,awayElo:2396,homeInjuries:1,awayInjuries:2,h2h,
  weather:{temperature:15,precipitationProbability:28,windSpeed:12,label:"15°C · mưa 28% · gió 12 km/h"},
  odds:demoOdds,verifiedByFootballData:true,externalPrediction,prediction,confidence:88,generatedAt:new Date().toISOString(),
  sources:[
   {name:"API-Football",status:"partial",note:"Đang hiển thị dữ liệu minh họa khi API thật chưa phản hồi."},
   {name:"API-Football Odds",status:"partial",note:"Odds minh họa để hoàn thiện giao diện; sẽ tự thay khi nguồn thật có dữ liệu."},
   {name:"football-data.org",status:"partial",note:"Đối chiếu minh họa trong Demo Mode."},
   {name:"PlayerElo",status:"partial",note:"Elo minh họa trong Demo Mode."},
   {name:"Open-Meteo",status:"partial",note:"Thời tiết minh họa trong Demo Mode."}
  ]
 };
}
