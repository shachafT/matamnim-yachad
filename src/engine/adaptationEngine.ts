/**
 * Workout Adaptation Engine
 * ──────────────────────────
 * Resolves how a given workout should be modified for a user's difficulty profile.
 *
 * Priority order:
 *  1. Physical safety   (balance, chronic, joint_pain)
 *  2. Physical load     (blood_pressure, diabetes, fatigue)
 *  3. Cognitive load    (cognitive)
 *  4. UI accessibility  (vision, hearing, tech, language)
 *  5. Emotional support (loneliness, fear_failure)
 */

import { Difficulty } from '../types';
import { ADAPTATION_MATRIX } from '../data/adaptations';

// ─────────────────────────────────────────────── Result type ──

export interface WorkoutResolution {
  workoutId: string;

  // ── 1. Physical safety ──────────────────────────────────────
  /** Force all exercises to use seated/chair version */
  forceSeated: boolean;
  /** Preferred support mode for toggle default */
  defaultSupportMode: 'רגיל' | 'כיסא' | 'קיר';
  /** Reduce range of motion on all exercises */
  reduceRange: boolean;

  // ── 2. Physical load ────────────────────────────────────────
  /** Slow down timers by this multiplier (1.0 = no change, 1.4 = 40% slower) */
  paceMultiplier: number;
  /** Reduce rep counts by this % (0–50) */
  reduceRepsByPct: number;
  /** Insert a breathing break between exercises */
  addBreaksBetween: boolean;
  /** Max exercises to show (null = show all) */
  maxSteps: number | null;

  // ── 3. Cognitive load ───────────────────────────────────────
  /** Show only one instruction word/sentence at a time */
  simplifyInstructions: boolean;
  /** Auto-advance to next exercise after timer ends */
  autoAdvance: boolean;

  // ── 4. UI accessibility ─────────────────────────────────────
  uiLargeIllustration: boolean;
  uiHighContrast:       boolean;
  uiSubtitlesRequired:  boolean;
  uiAutoplay:           boolean;
  uiIconsPreferred:     boolean;

  // ── 5. Emotional support ────────────────────────────────────
  showEmotionalBoost:      boolean;
  hidePerformanceMetrics:  boolean;
  celebratePartialSuccess: boolean;

  // ── Derived UI flags ────────────────────────────────────────
  /** Show large stop button (balance, diabetes, chronic) */
  showBigStopButton: boolean;
  /** Show persistent breathing reminder (blood_pressure) */
  showBreathingReminder: boolean;
  /** Show conservative mode badge (chronic or 2+ high-risk difficulties) */
  showConservativeModeLabel: boolean;
  /** Show meal-timing reminder (diabetes) */
  showTimingReminder: boolean;
  /** Show "hand on wall/chair" reminder (balance) */
  showHandOnWallReminder: boolean;

  // ── Meta ────────────────────────────────────────────────────
  /** Adjusted workout duration in minutes (0 = no change) */
  adjustedDuration: number;
  /** Safety alerts to display prominently */
  safetyAlerts: string[];
  /** Deduplicated stop signs from all active difficulties */
  stopSigns: string[];
  /** "If hard, do this instead" hints from active adaptation rules */
  variantNotes: string[];
  /** Human-readable list of active adaptations (for badge display) */
  activeAdaptations: { label: string; emoji: string }[];
  /** Highest risk level among active difficulties */
  maxRiskLevel: 'נמוך' | 'בינוני' | 'גבוה';
}

// ─────────────────────────────────────────────── Helpers ──

const RISK_RANK: Record<string, number> = { 'נמוך': 0, 'בינוני': 1, 'גבוה': 2 };

const DIFFICULTY_LABELS: Record<Difficulty, { label: string; emoji: string }> = {
  vision:          { label: 'בעיות ראייה',              emoji: '👁️' },
  hearing:         { label: 'בעיות שמיעה',              emoji: '👂' },
  blood_pressure:  { label: 'לחץ דם גבוה',              emoji: '🫀' },
  diabetes:        { label: 'סוכרת',                    emoji: '🩺' },
  joint_pain:      { label: 'כאבי מפרקים',              emoji: '🦵' },
  balance:         { label: 'שיווי משקל ירוד',          emoji: '⚖️' },
  cognitive:       { label: 'שכחה / ירידה קוגניטיבית',  emoji: '🧠' },
  tech:            { label: 'קושי טכנולוגי',            emoji: '📱' },
  language:        { label: 'קושי בשפה',                emoji: '💬' },
  chronic:         { label: 'מחלות כרוניות מרובות',     emoji: '🏥' },
  fatigue:         { label: 'עייפות',                   emoji: '😴' },
  loneliness:      { label: 'בדידות',                   emoji: '🤍' },
  fear_failure:    { label: 'פחד מכישלון',              emoji: '💪' },
};

// ─────────────────────────────────────────────── Engine ──

export function resolveWorkoutVariant(
  workoutId: string,
  userDifficulties: Difficulty[]
): WorkoutResolution {

  if (!userDifficulties.length) {
    return buildDefault(workoutId);
  }

  const workoutRules = ADAPTATION_MATRIX[workoutId] ?? {};

  // Collect all applicable rules
  const active = userDifficulties
    .filter(d => workoutRules[d])
    .map(d => ({ difficulty: d, rule: workoutRules[d]! }));

  if (!active.length) return buildDefault(workoutId);

  // ── Safety alerts (from safetyNote, deduplicated) ──
  const safetyAlerts = [...new Set(
    active.map(a => a.rule.safetyNote).filter(Boolean)
  )];

  // ── Stop signs (from stopSigns array, deduplicated) ──
  const stopSigns = [...new Set(
    active.flatMap(a => a.rule.stopSigns)
  )];

  // ── Variant hints ("if hard → do this") ──
  const variantNotes = [...new Set(
    active.map(a => a.rule.variantNote).filter(Boolean)
  )];

  // ── Duration: minimum across all applicable rules ──
  const durations = active.map(a => a.rule.adjustedDuration).filter(d => d > 0);
  const adjustedDuration = durations.length ? Math.min(...durations) : 0;

  // ── Max risk level ──
  const maxRisk = active.reduce<'נמוך' | 'בינוני' | 'גבוה'>((max, a) => {
    return RISK_RANK[a.rule.riskLevel] > RISK_RANK[max]
      ? a.rule.riskLevel
      : max;
  }, 'נמוך');

  const highRiskCount = active.filter(a => a.rule.riskLevel === 'גבוה').length;

  // ── PRIORITY 1: Physical safety ──
  const hasBalance   = userDifficulties.includes('balance');
  const hasJointPain = userDifficulties.includes('joint_pain');
  const hasChronic   = userDifficulties.includes('chronic');

  // forceSeated: balance always, joint_pain + balance combo, chronic, or vision + balance
  const forceSeated =
    hasBalance ||
    hasChronic ||
    (hasJointPain && (hasBalance || workoutId === 'W04')) ||
    active.some(a =>
      a.rule.changeType.includes('ישיבה') ||
      (a.rule.changeLevel === 'שינוי מהותי' && a.rule.riskLevel === 'גבוה')
    );

  let defaultSupportMode: 'רגיל' | 'כיסא' | 'קיר' = 'רגיל';
  if (forceSeated || hasBalance || hasChronic) {
    defaultSupportMode = 'כיסא';
  } else if (hasJointPain) {
    defaultSupportMode = 'כיסא';
  } else if (userDifficulties.includes('vision') && workoutId !== 'W01' && workoutId !== 'W06') {
    defaultSupportMode = 'כיסא';
  } else if (['W04'].includes(workoutId)) {
    // Balance workout defaults to wall support even without difficulties
    defaultSupportMode = 'קיר';
  }

  const reduceRange =
    hasJointPain ||
    active.some(a =>
      a.rule.changeType.includes('טווח') ||
      a.rule.changeType.includes('עומס')
    );

  // ── PRIORITY 2: Physical load ──
  const hasBP      = userDifficulties.includes('blood_pressure');
  const hasDiab    = userDifficulties.includes('diabetes');
  const hasFatigue = userDifficulties.includes('fatigue');

  const slowPace = hasBP || hasFatigue || hasChronic;
  const paceMultiplier = slowPace ? 1.4 : 1.0;

  const reduceRepsByPct =
    hasFatigue  ? 30 :
    hasChronic  ? 30 :
    hasDiab     ? 20 :
    hasBP       ? 20 : 0;

  const addBreaksBetween = hasBP || hasDiab || hasChronic || hasFatigue;

  // Max steps: most restrictive wins
  const stepLimits: number[] = [];
  if (hasChronic) stepLimits.push(4);
  if (hasFatigue) stepLimits.push(4);
  if (userDifficulties.includes('cognitive')) stepLimits.push(3);
  if (hasDiab && (workoutId === 'W02' || workoutId === 'W03')) stepLimits.push(3);
  if (hasBalance && workoutId === 'W04') stepLimits.push(4);
  const maxSteps = stepLimits.length ? Math.min(...stepLimits) : null;

  // ── PRIORITY 3: Cognitive load ──
  const hasCognitive = userDifficulties.includes('cognitive');
  const simplifyInstructions = hasCognitive;
  const autoAdvance          = hasCognitive || userDifficulties.includes('tech');

  // ── PRIORITY 4: UI accessibility ──
  const hasVision   = userDifficulties.includes('vision');
  const hasHearing  = userDifficulties.includes('hearing');
  const hasTech     = userDifficulties.includes('tech');
  const hasLanguage = userDifficulties.includes('language');

  const uiLargeIllustration = hasVision || hasCognitive;
  const uiHighContrast       = hasVision;
  const uiSubtitlesRequired  = hasHearing;
  const uiAutoplay           = hasTech || hasCognitive;
  const uiIconsPreferred     = hasLanguage || hasCognitive;

  // ── PRIORITY 5: Emotional ──
  const hasLoneliness  = userDifficulties.includes('loneliness');
  const hasFearFailure = userDifficulties.includes('fear_failure');

  const showEmotionalBoost      = hasLoneliness || hasFearFailure || hasFatigue;
  const hidePerformanceMetrics  = hasFearFailure;
  const celebratePartialSuccess = hasFearFailure || hasFatigue;

  // ── Derived UI flags ──
  const showBigStopButton        = hasBalance || hasDiab || hasChronic;
  const showBreathingReminder    = hasBP;
  const showConservativeModeLabel = hasChronic || highRiskCount >= 2;
  const showTimingReminder       = hasDiab;
  const showHandOnWallReminder   = hasBalance;

  // ── Active adaptations list ──
  const activeAdaptations = userDifficulties
    .filter(d => workoutRules[d])
    .map(d => DIFFICULTY_LABELS[d]);

  return {
    workoutId,
    forceSeated,
    defaultSupportMode,
    reduceRange,
    paceMultiplier,
    reduceRepsByPct,
    addBreaksBetween,
    maxSteps,
    simplifyInstructions,
    autoAdvance,
    uiLargeIllustration,
    uiHighContrast,
    uiSubtitlesRequired,
    uiAutoplay,
    uiIconsPreferred,
    showEmotionalBoost,
    hidePerformanceMetrics,
    celebratePartialSuccess,
    showBigStopButton,
    showBreathingReminder,
    showConservativeModeLabel,
    showTimingReminder,
    showHandOnWallReminder,
    adjustedDuration,
    safetyAlerts,
    stopSigns,
    variantNotes,
    activeAdaptations,
    maxRiskLevel: maxRisk,
  };
}

// ─────────────────────────────────────────────── Default (no difficulties) ──

function buildDefault(workoutId: string): WorkoutResolution {
  // W04 always needs wall support even without difficulties
  const defaultSupport: 'רגיל' | 'כיסא' | 'קיר' =
    workoutId === 'W04' ? 'קיר' : 'רגיל';

  return {
    workoutId,
    forceSeated: false,
    defaultSupportMode: defaultSupport,
    reduceRange: false,
    paceMultiplier: 1.0,
    reduceRepsByPct: 0,
    addBreaksBetween: false,
    maxSteps: null,
    simplifyInstructions: false,
    autoAdvance: false,
    uiLargeIllustration: false,
    uiHighContrast: false,
    uiSubtitlesRequired: false,
    uiAutoplay: false,
    uiIconsPreferred: false,
    showEmotionalBoost: false,
    hidePerformanceMetrics: false,
    celebratePartialSuccess: false,
    showBigStopButton: false,
    showBreathingReminder: false,
    showConservativeModeLabel: false,
    showTimingReminder: false,
    showHandOnWallReminder: false,
    adjustedDuration: 0,
    safetyAlerts: [],
    stopSigns: [],
    variantNotes: [],
    activeAdaptations: [],
    maxRiskLevel: 'נמוך',
  };
}

// ─────────────────────────────────────────────── Convenience helpers ──

/** Apply pace multiplier to a step's duration in seconds */
export function applyPace(durationSeconds: number, resolution: WorkoutResolution): number {
  return Math.round(durationSeconds * resolution.paceMultiplier);
}

/** Apply rep reduction */
export function applyReps(reps: number, resolution: WorkoutResolution): number {
  if (!resolution.reduceRepsByPct) return reps;
  return Math.max(3, Math.round(reps * (1 - resolution.reduceRepsByPct / 100)));
}

/** Filter steps to maxSteps (keeps first N, always includes last step as cool-down) */
export function applyMaxSteps<T>(steps: T[], resolution: WorkoutResolution): T[] {
  if (!resolution.maxSteps || steps.length <= resolution.maxSteps) return steps;
  const main = steps.slice(0, resolution.maxSteps - 1);
  const last = steps[steps.length - 1];
  return [...main, last];
}

/**
 * Get the best instruction text for a step given current support mode.
 * chair_version > wall_version > regular (screenInstruction)
 */
export function getStepInstruction(
  step: { screenInstruction: string; chairVersion: string; wallVersion: string; safetyNote: string },
  supportMode: 'רגיל' | 'כיסא' | 'קיר',
  simplify: boolean
): string {
  let base: string;
  if (supportMode === 'כיסא' && step.chairVersion && step.chairVersion !== 'לא רלוונטי') {
    base = step.chairVersion;
  } else if (supportMode === 'קיר' && step.wallVersion && step.wallVersion !== 'לא רלוונטי') {
    base = step.wallVersion;
  } else {
    base = step.screenInstruction;
  }
  return simplify ? base.split(',')[0].split('–')[0].trim() : base;
}
