import { supabase } from './supabase';
import type { Difficulty } from '../types';

/**
 * Grandchild saves difficulties to their linked grandma's profile.
 * Uses a SECURITY DEFINER RPC that verifies the family_links relationship.
 */
export async function saveDifficultiesForGrandma(
  grandmaId: string,
  difficulties: Difficulty[],
): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc('update_grandma_difficulties', {
    p_grandma_id: grandmaId,
    p_difficulties: difficulties,
  });
  if (error) {
    console.error('[difficulties] save error:', error.message);
    return { error: error.message };
  }
  return { error: null };
}

/**
 * Grandchild loads the current difficulties of their linked grandma.
 * Uses a SECURITY DEFINER RPC that verifies the family_links relationship.
 */
export async function loadDifficultiesForGrandma(
  grandmaId: string,
): Promise<Difficulty[]> {
  const { data, error } = await supabase.rpc('get_grandma_difficulties', {
    p_grandma_id: grandmaId,
  });
  if (error) {
    console.error('[difficulties] load error:', error.message);
    return [];
  }
  return (data ?? []) as Difficulty[];
}
