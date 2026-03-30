/**
 * workoutDataService – single entry point for all workout data.
 *
 * The source of truth is the TypeScript data files built from the
 * original Excel / JSON research data:
 *   src/data/workoutsData.ts     – workout library (W01–W12) + exercise steps
 *   src/data/adaptations.ts      – adaptation matrix (workout × difficulty)
 *   src/engine/adaptationEngine.ts – resolution logic
 *
 * Consumers should import from here rather than reaching into data files
 * directly, so that the data layer can evolve without scattering imports.
 */

import { WORKOUTS, getStepsForWorkout } from '../data/workoutsData';
import type { Workout, WorkoutStep } from '../data/workoutsData';
import { ADAPTATION_MATRIX } from '../data/adaptations';
import type { AdaptationRule } from '../data/adaptations';
import { resolveWorkoutVariant } from '../engine/adaptationEngine';
import type { WorkoutResolution } from '../engine/adaptationEngine';
import type { Difficulty } from '../types';

export type { Workout, WorkoutStep, AdaptationRule, WorkoutResolution };

// ── Basic lookup ──────────────────────────────────────────────────

/** Returns the workout metadata (title, category, colors, etc.) or undefined. */
export function getWorkoutById(id: string): Workout | undefined {
  return WORKOUTS.find(w => w.id === id);
}

/** Returns all workouts in library order. */
export function getAllWorkouts(): Workout[] {
  return WORKOUTS;
}

// ── Exercise steps ────────────────────────────────────────────────

/**
 * Returns the ordered exercise steps for a workout.
 * Steps include: title, instruction variants (chair/wall/regular),
 * duration/reps, visual type, safety note.
 */
export function getExercisesForWorkout(workoutId: string): WorkoutStep[] {
  return getStepsForWorkout(workoutId);
}

// ── Adaptations ───────────────────────────────────────────────────

/**
 * Resolves the full adaptation profile for a workout + user difficulty list.
 * Returns a WorkoutResolution with all UI flags, pace adjustments, step
 * limits, safety alerts, stop signs, and variant hints already computed.
 */
export function getAdaptationsForWorkout(
  workoutId: string,
  difficulties: Difficulty[]
): WorkoutResolution {
  return resolveWorkoutVariant(workoutId, difficulties);
}

/**
 * Returns the raw adaptation rules for a workout (keyed by difficulty).
 * Useful for displaying per-difficulty notes without running the full engine.
 */
export function getRawAdaptationRules(
  workoutId: string
): Partial<Record<Difficulty, AdaptationRule>> {
  return ADAPTATION_MATRIX[workoutId] ?? {};
}

/**
 * Returns the variant hints ("if this is hard, do this instead") for a
 * specific workout, filtered to the user's active difficulties.
 */
export function getVariantHints(
  workoutId: string,
  difficulties: Difficulty[]
): string[] {
  const rules = getRawAdaptationRules(workoutId);
  return [...new Set(
    difficulties
      .map(d => rules[d]?.variantNote)
      .filter((n): n is string => Boolean(n))
  )];
}
