import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { formatToPar, windDirectionLabel, weatherCodeToDescription } from '@/utils/scoring';
import { getTournament } from '@/lib/firebase/tournaments';
import { getPriorExportMeta, saveExportMeta } from './exportMetaService';
import { buildNotableMoments } from './notableMomentsBuilder';
import { buildFantasyMovementSummary } from './movementSummaryBuilder';
import type { PlayerScore } from '@/lib/scoring/types';
import type { TeamResult } from '@/lib/scoring/fantasyEngine';
import type {
  AgentExportPayload,
  AgentExportWeather,
  AgentExportGolfer,
  AgentExportLeaderboardEntry,
  AgentExportFantasyTeam,
  ExportMeta,
} from './types';

const WEATHER_BASE = 'https://api.open-meteo.com/v1/forecast';

async function fetchExportWeather(lat: number, lon: number): Promise<AgentExportWeather | null> {
  try {
    const params = new URLSearchParams({
      latitude: String(lat),
      longitude: String(lon),
      current: 'temperature_2m,wind_speed_10m,wind_direction_10m,weather_code,precipitation,relative_humidity_2m',
      temperature_unit: 'fahrenheit',
      wind_speed_unit: 'mph',
      precipitation_unit: 'inch',
      forecast_days: '1',
    });
    const res = await fetch(`${WEATHER_BASE}?${params}`);
    if (!res.ok) throw new Error(`Weather fetch failed: ${res.status}`);
    const data = await res.json();
    const c = data.current;
    return {
      fetchedAt: new Date().toISOString(),
      temperatureF: c.temperature_2m,
      windSpeedMph: c.wind_speed_10m,
      windDirection: windDirectionLabel(c.wind_direction_10m),
      conditionDescription: weatherCodeToDescription(c.weather_code),
      precipitationInches: c.precipitation ?? 0,
      humidity: c.relative_humidity_2m ?? 0,
    };
  } catch (err) {
    console.warn('Weather fetch failed; export will proceed without it.', err);
    return null;
  }
}

function safeScore(score: number): number {
  return Number.isFinite(score) ? score : 0;
}

function parsePositionNumeric(position: string): number | null {
  const cleaned = position.replace(/^T/, '');
  const num = parseInt(cleaned, 10);
  return Number.isFinite(num) ? num : null;
}

function mapGolfer(p: PlayerScore): AgentExportGolfer {
  const totalScore = safeScore(p.totalScore);
  const todayScore = safeScore(p.todayScore);
  return {
    playerId: p.id,
    playerName: p.name,
    totalScore,
    scoreDisplay: formatToPar(totalScore),
    todayScore,
    todayScoreDisplay: formatToPar(todayScore),
    thru: p.thru || '-',
    position: p.position || '-',
    positionNumeric: p.status === 'cut' || p.status === 'wd' ? null : parsePositionNumeric(p.position),
    roundScores: [p.r1, p.r2, p.r3, p.r4],
    status: p.status,
  };
}

function mapLeaderboardEntry(p: PlayerScore): AgentExportLeaderboardEntry {
  const totalScore = safeScore(p.totalScore);
  const todayScore = safeScore(p.todayScore);
  return {
    position: p.position || '-',
    positionNumeric: p.status === 'cut' || p.status === 'wd' ? null : parsePositionNumeric(p.position),
    playerId: p.id,
    playerName: p.name,
    totalScore,
    scoreDisplay: formatToPar(totalScore),
    todayScore,
    todayScoreDisplay: formatToPar(todayScore),
    thru: p.thru || '-',
    roundScores: [p.r1, p.r2, p.r3, p.r4],
    status: p.status,
  };
}

function mapFantasyTeam(t: TeamResult, priorMeta: ExportMeta | null): AgentExportFantasyTeam {
  const totalScore = safeScore(t.totalScore);
  const priorRank = priorMeta?.fantasyRanks[t.teamName] ?? null;
  const movementToday = priorRank != null ? priorRank - t.rank : 0;
  let movementDisplay = '—';
  if (movementToday > 0) movementDisplay = `↑${movementToday}`;
  else if (movementToday < 0) movementDisplay = `↓${Math.abs(movementToday)}`;

  return {
    rank: t.rank,
    teamName: t.teamName,
    totalScore,
    scoreDisplay: formatToPar(totalScore),
    movementToday,
    movementDisplay,
    isTied: t.isTied,
    golfers: t.golfers.map(mapGolfer),
  };
}

function mapTournamentStatus(status: string): 'pre' | 'active' | 'complete' {
  if (status === 'upcoming') return 'pre';
  if (status === 'completed') return 'complete';
  return 'active';
}

function computeRoundsComplete(leaderboard: PlayerScore[]): number {
  if (leaderboard.length === 0) return 0;
  const activePlayers = leaderboard.filter(p => p.status === 'active' || p.status === 'complete');
  if (activePlayers.length === 0) return 0;
  let rounds = 0;
  if (activePlayers.every(p => p.r1 != null)) rounds = 1;
  if (activePlayers.every(p => p.r2 != null)) rounds = 2;
  if (activePlayers.every(p => p.r3 != null)) rounds = 3;
  if (activePlayers.every(p => p.r4 != null)) rounds = 4;
  return rounds;
}

function computeCurrentRound(leaderboard: PlayerScore[]): number {
  const complete = computeRoundsComplete(leaderboard);
  if (complete >= 4) return 4;
  return complete + 1;
}

export async function generateAndUploadAgentExport(
  tournamentId: string,
  players: PlayerScore[],
  fantasyStandings: TeamResult[],
): Promise<{ documentPath: string }> {
  const [tournament, priorMeta] = await Promise.all([
    getTournament(tournamentId),
    getPriorExportMeta(tournamentId),
  ]);

  if (!tournament) throw new Error(`Tournament "${tournamentId}" not found`);

  const weather = await fetchExportWeather(tournament.lat, tournament.lon);

  const notableMoments = buildNotableMoments({
    leaderboard: players,
    fantasyStandings,
    priorMeta,
  });

  const fantasyMovementSummary = buildFantasyMovementSummary({
    fantasyStandings,
    priorMeta,
  });

  const exportStatus = mapTournamentStatus(tournament.status);

  const payload: AgentExportPayload = {
    exportedAt: new Date().toISOString(),
    summaryType: exportStatus === 'complete' ? 'final' : 'daily',
    appVersion: import.meta.env.VITE_APP_VERSION ?? '0.0.0',
    tournament: {
      id: tournament.id,
      name: tournament.name,
      course: tournament.venue,
      location: tournament.location,
      currentRound: computeCurrentRound(players),
      roundsComplete: computeRoundsComplete(players),
      status: exportStatus,
      parScore: tournament.par,
      startDate: tournament.startDate.split('T')[0],
      endDate: tournament.endDate.split('T')[0],
    },
    weather,
    fantasyStandings: fantasyStandings.map(t => mapFantasyTeam(t, priorMeta)),
    leaderboard: players.map(mapLeaderboardEntry),
    notableMoments,
    fantasyMovementSummary,
  };

  const payloadJson = JSON.stringify(payload, null, 2);

  await setDoc(doc(db, 'agentExports', tournamentId), {
    payload: payloadJson,
    exportedAt: payload.exportedAt,
  });

  const newMeta: ExportMeta = {
    lastExportAt: payload.exportedAt,
    fantasyRanks: Object.fromEntries(fantasyStandings.map(t => [t.teamName, t.rank])),
    leaderboardPositions: Object.fromEntries(players.map(p => [p.id, p.finishPosition])),
    leaderboardLeader: players.find(p => p.position === '1' || p.position === 'T1')?.id ?? null,
    fantasyLeader: fantasyStandings.find(t => t.rank === 1)?.teamName ?? null,
    playerStatuses: Object.fromEntries(players.map(p => [p.id, p.status])),
  };
  await saveExportMeta(tournamentId, newMeta);

  return { documentPath: `agentExports/${tournamentId}` };
}
