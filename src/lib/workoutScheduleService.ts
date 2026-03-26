import { supabase } from './supabase';

export interface ScheduledWorkoutRow {
  date:      string;   // ISO date string YYYY-MM-DD
  workoutId: string;
}

export async function getLinkedGrandmaId(grandchildId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('family_links')
    .select('grandma_id')
    .eq('grandchild_id', grandchildId)
    .maybeSingle();
  if (error) {
    console.error('[workoutSchedule] getLinkedGrandmaId error:', error.message);
    return null;
  }
  const id = (data as { grandma_id: string } | null)?.grandma_id ?? null;
  console.log('[workoutSchedule] linkedGrandmaId for', grandchildId, '→', id);
  return id;
}

export async function saveScheduledWorkout(
  grandmaId:  string,
  date:       string,
  workoutId:  string,
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('scheduled_workouts')
    .upsert(
      { grandma_id: grandmaId, scheduled_date: date, workout_id: workoutId },
      { onConflict: 'grandma_id,scheduled_date' },
    );
  if (error) { console.error('[workoutSchedule] save error:', error.message); return { error: error.message }; }
  return { error: null };
}

export async function removeScheduledWorkout(
  grandmaId: string,
  date:      string,
): Promise<void> {
  const { error } = await supabase
    .from('scheduled_workouts')
    .delete()
    .eq('grandma_id', grandmaId)
    .eq('scheduled_date', date);
  if (error) console.error('[workoutSchedule] remove error:', error.message);
}

export async function getScheduleForGrandma(grandmaId: string): Promise<ScheduledWorkoutRow[]> {
  const { data, error } = await supabase
    .from('scheduled_workouts')
    .select('scheduled_date, workout_id')
    .eq('grandma_id', grandmaId);
  if (error) { console.error('[workoutSchedule] load error:', error.message); return []; }
  return (data ?? []).map(r => ({ date: r.scheduled_date, workoutId: r.workout_id }));
}
