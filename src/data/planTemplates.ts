/**
 * Plan templates: 3 tracks × 4 week lengths = 12 plans.
 *
 * Each schedule is an array of length (weeks × 7).
 * null  = rest day
 * 'WXX' = scheduled workout ID from WORKOUTS library
 *
 * Track frequencies (workouts/week):
 *   GENTLE   – 3/week  (easy entry, breathing + short workouts)
 *   BALANCED – 4/week  (varied categories, moderate progression)
 *   STRENGTH – 3/week  (strength-focused, heavier rest between sessions)
 */

export type PlanTrack = 'GENTLE' | 'BALANCED' | 'STRENGTH';
export type PlanWeekCount = 1 | 2 | 3 | 4;

export interface PlanTemplate {
  id: string;
  track: PlanTrack;
  weeks: PlanWeekCount;
  label: string;
  shortLabel: string;
  description: string;
  color: string;
  schedule: (string | null)[];  // length = weeks × 7
}

// ──────────────────────────────────────────────────────────────────
// Helper: build multi-week schedule by repeating/rotating week patterns
// ──────────────────────────────────────────────────────────────────
function buildSchedule(
  weekPatterns: (string | null)[][],
  totalWeeks: PlanWeekCount
): (string | null)[] {
  const out: (string | null)[] = [];
  for (let w = 0; w < totalWeeks; w++) {
    out.push(...weekPatterns[w % weekPatterns.length]);
  }
  return out;
}

// ──────────────────────────────────────────────────────────────────
// GENTLE – 3 workouts/week, gentle workouts only (W01 W06 W07 W08)
// Pattern: workout Sun, workout Tue, workout Thu; rest the rest
// ──────────────────────────────────────────────────────────────────
const GENTLE_WEEKS: (string | null)[][] = [
  ['W01', null, 'W07', null, 'W06', null, null], // week 1
  ['W01', null, 'W08', null, 'W06', null, null], // week 2 – vary mid-week
  ['W07', null, 'W01', null, 'W08', null, null], // week 3
  ['W06', null, 'W07', null, 'W01', null, null], // week 4
];

// ──────────────────────────────────────────────────────────────────
// BALANCED – 4 workouts/week, varied: breathing, walking, strength, balance
// Pattern: workout Sun, skip Mon, workout Tue+Wed, skip Thu, workout Fri, skip Sat
// ──────────────────────────────────────────────────────────────────
const BALANCED_WEEKS: (string | null)[][] = [
  ['W01', null, 'W02', 'W04', null, 'W05', null], // week 1 – intro mix
  ['W01', null, 'W03', 'W04', null, 'W05', null], // week 2 – add leg strength
  ['W02', null, 'W04', 'W09', null, 'W05', null], // week 3 – balance + coord
  ['W01', null, 'W03', 'W04', null, 'W12', null], // week 4 – rhythm finish
];

// ──────────────────────────────────────────────────────────────────
// STRENGTH – 3 workouts/week, strength-focused (W03 W04 W05 W09 W11)
// Rest between each workout day; heavier category
// ──────────────────────────────────────────────────────────────────
const STRENGTH_WEEKS: (string | null)[][] = [
  [null, 'W03', null, 'W04', null, 'W05', null], // week 1 – core trio
  [null, 'W03', null, 'W11', null, 'W04', null], // week 2 – swap
  [null, 'W05', null, 'W09', null, 'W11', null], // week 3 – coord added
  [null, 'W03', null, 'W04', null, 'W12', null], // week 4 – rhythm finish
];

// ──────────────────────────────────────────────────────────────────
// Build all 12 templates
// ──────────────────────────────────────────────────────────────────
const GENTLE_META = {
  track: 'GENTLE' as PlanTrack,
  label: 'מסלול עדין',
  shortLabel: 'עדין',
  description: 'אימונים קצרים ועדינים, 3 פעמים בשבוע. מתאים לכניסה ראשונה לפעילות.',
  color: '#4A9EC4',
};

const BALANCED_META = {
  track: 'BALANCED' as PlanTrack,
  label: 'מסלול מאוזן',
  shortLabel: 'מאוזן',
  description: 'שילוב הליכה, כוח ושיווי משקל, 4 פעמים בשבוע.',
  color: '#4A9B60',
};

const STRENGTH_META = {
  track: 'STRENGTH' as PlanTrack,
  label: 'מסלול חיזוק',
  shortLabel: 'חיזוק',
  description: 'אימוני כוח ויציבות, 3 פעמים בשבוע עם ימי מנוחה ביניהם.',
  color: '#C4744A',
};

export const PLAN_TEMPLATES: PlanTemplate[] = [
  // GENTLE
  ...[1, 2, 3, 4].map(w => ({
    id: `P-GENTLE-${w}W`,
    ...GENTLE_META,
    weeks: w as PlanWeekCount,
    schedule: buildSchedule(GENTLE_WEEKS, w as PlanWeekCount),
  })),
  // BALANCED
  ...[1, 2, 3, 4].map(w => ({
    id: `P-BALANCED-${w}W`,
    ...BALANCED_META,
    weeks: w as PlanWeekCount,
    schedule: buildSchedule(BALANCED_WEEKS, w as PlanWeekCount),
  })),
  // STRENGTH
  ...[1, 2, 3, 4].map(w => ({
    id: `P-STRENGTH-${w}W`,
    ...STRENGTH_META,
    weeks: w as PlanWeekCount,
    schedule: buildSchedule(STRENGTH_WEEKS, w as PlanWeekCount),
  })),
];

/** Get a specific template by track + week count */
export function getPlanTemplate(track: PlanTrack, weeks: PlanWeekCount): PlanTemplate {
  return PLAN_TEMPLATES.find(p => p.track === track && p.weeks === weeks)!;
}

/** All 3 track meta objects (for picker UI) */
export const PLAN_TRACKS = [GENTLE_META, BALANCED_META, STRENGTH_META];
