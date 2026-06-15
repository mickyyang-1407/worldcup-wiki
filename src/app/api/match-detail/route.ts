import { NextResponse } from "next/server";
import { espnNameToSlug, espnStatusToLocal } from "@/lib/espnTeamMap";

export const runtime = "edge";
export const dynamic = "force-dynamic";

function moneylineToProb(ml: number): number {
  if (ml > 0) return 100 / (ml + 100);
  return Math.abs(ml) / (Math.abs(ml) + 100);
}

function normalizeProbs(h: number, d: number, a: number) {
  const sum = h + d + a;
  return { h: h / sum, d: d / sum, a: a / sum };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const home = searchParams.get("home");
  const away = searchParams.get("away");
  const date = searchParams.get("date"); // YYYY-MM-DD

  if (!home || !away || !date) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  // Search ESPN scoreboard ±2 days around the match date
  const d0 = new Date(date + "T00:00:00Z");
  const d1 = new Date(d0.getTime() - 1 * 86400000);
  const d2 = new Date(d0.getTime() + 2 * 86400000);
  const fmt = (dt: Date) =>
    `${dt.getUTCFullYear()}${String(dt.getUTCMonth() + 1).padStart(2, "0")}${String(dt.getUTCDate()).padStart(2, "0")}`;

  const boardRes = await fetch(
    `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=${fmt(d1)}-${fmt(d2)}&limit=30`,
    { cache: "no-store" }
  );
  if (!boardRes.ok) return NextResponse.json({ error: "ESPN unavailable" }, { status: 502 });
  const boardData = await boardRes.json();

  // Find the event by matching team slugs
  let eventId: string | null = null;
  let eventStatus = "upcoming";
  let eventScore = { home: null as number | null, away: null as number | null };
  let eventDate = date;
  let eventTime = "";
  let eventVenue = "";
  let eventCity = "";
  let homeEspnId = "";
  let awayEspnId = "";

  for (const event of boardData.events || []) {
    const comp = event.competitions?.[0];
    const competitors = comp?.competitors || [];
    const homeComp = competitors.find((c: any) => c.homeAway === "home");
    const awayComp = competitors.find((c: any) => c.homeAway === "away");
    const hs = espnNameToSlug(homeComp?.team?.displayName || "");
    const as_ = espnNameToSlug(awayComp?.team?.displayName || "");
    if (hs === home && as_ === away) {
      eventId = event.id;
      eventStatus = espnStatusToLocal(comp?.status?.type?.name || "");
      homeEspnId = homeComp?.team?.id || "";
      awayEspnId = awayComp?.team?.id || "";
      if (eventStatus !== "upcoming") {
        eventScore = {
          home: homeComp?.score != null ? parseInt(homeComp.score) : null,
          away: awayComp?.score != null ? parseInt(awayComp.score) : null,
        };
      }
      eventDate = event.date?.slice(0, 10) || date;
      eventTime = event.date || "";
      eventVenue = comp?.venue?.fullName || "";
      eventCity = comp?.venue?.address?.city || "";
      break;
    }
  }

  if (!eventId) {
    return NextResponse.json({ error: "Match not found in ESPN" }, { status: 404 });
  }

  // Fetch ESPN summary
  const sumRes = await fetch(
    `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/summary?event=${eventId}`,
    { cache: "no-store" }
  );
  if (!sumRes.ok) return NextResponse.json({ error: "Summary unavailable" }, { status: 502 });
  const sum = await sumRes.json();

  // --- Stats ---
  const statsMap: Record<string, Record<string, any>> = { home: {}, away: {} };
  for (const teamData of sum.boxscore?.teams || []) {
    const side = teamData.homeAway === "home" ? "home" : "away";
    for (const s of teamData.statistics || []) {
      statsMap[side][s.name] = s.displayValue ?? s.value;
    }
  }

  // --- Key Events ---
  const KEY_SHOW = new Set(["Goal", "Goal - Header", "Goal - Penalty", "Yellow Card", "Red Card", "Own Goal", "Substitution"]);
  const keyEvents: any[] = [];

  for (const ke of sum.keyEvents || []) {
    const typeText: string = ke.type?.text || "";
    if (!KEY_SHOW.has(typeText)) continue;

    const minute: string = ke.clock?.displayValue || "";
    const teamId: string = ke.team?.id || "";
    const side = teamId === homeEspnId ? "home" : teamId === awayEspnId ? "away" : "unknown";
    const parts: any[] = ke.participants || [];

    if (ke.scoringPlay) {
      const scorer = parts.find((p: any) => p.type?.text === "scorer") || parts[0];
      const assister = parts.find((p: any) => p.type?.text === "assister");
      keyEvents.push({
        type: ke.ownGoal ? "own-goal" : typeText === "Goal - Penalty" ? "penalty" : "goal",
        minute,
        player: scorer?.athlete?.displayName || "",
        assist: assister?.athlete?.displayName || null,
        team: side,
        text: ke.shortText || "",
      });
    } else if (typeText === "Yellow Card" || typeText === "Red Card") {
      keyEvents.push({
        type: typeText === "Yellow Card" ? "yellow" : "red",
        minute,
        player: parts[0]?.athlete?.displayName || "",
        team: side,
      });
    } else if (typeText === "Substitution") {
      const out = parts.find((p: any) => p.type?.text === "exit" || p.subbedOut);
      const inn = parts.find((p: any) => p.type?.text === "entry" || p.subbedIn);
      if (out || inn) {
        keyEvents.push({
          type: "sub",
          minute,
          playerOut: out?.athlete?.displayName || "",
          playerIn: inn?.athlete?.displayName || "",
          team: side,
        });
      }
    }
  }

  // --- Odds ---
  let odds: any = null;
  const pc = (sum.pickcenter || []).find((p: any) => p.homeTeamOdds?.moneyLine != null);
  if (pc) {
    const hML = pc.homeTeamOdds?.moneyLine;
    const aML = pc.awayTeamOdds?.moneyLine;
    const dML = pc.drawOdds?.moneyLine;
    const rawH = hML != null ? moneylineToProb(hML) : 0.33;
    const rawD = dML != null ? moneylineToProb(dML) : 0.33;
    const rawA = aML != null ? moneylineToProb(aML) : 0.33;
    const probs = normalizeProbs(rawH, rawD, rawA);
    odds = {
      homeMoneyLine: hML ?? null,
      drawMoneyLine: dML ?? null,
      awayMoneyLine: aML ?? null,
      homeWinPct: Math.round(probs.h * 100),
      drawPct: Math.round(probs.d * 100),
      awayWinPct: Math.round(probs.a * 100),
      overUnder: pc.overUnder ?? null,
      spread: pc.spread ?? null,
      provider: pc.provider?.name || "ESPN BET",
    };
  }

  return NextResponse.json({
    eventId,
    status: eventStatus,
    date: eventDate,
    time: eventTime,
    venue: eventVenue,
    city: eventCity,
    score: eventScore,
    home,
    away,
    homeEspnId,
    awayEspnId,
    stats: statsMap,
    keyEvents,
    odds,
  });
}
