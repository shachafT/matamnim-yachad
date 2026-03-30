-- ============================================================
-- Difficulties sync migration
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Add difficulties column to profiles table
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS difficulties text[] DEFAULT '{}';

-- 2. RPC: grandchild saves difficulties to linked grandma's profile
--    SECURITY DEFINER bypasses RLS; checks family_links authorization internally
CREATE OR REPLACE FUNCTION update_grandma_difficulties(
  p_grandma_id   uuid,
  p_difficulties text[]
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM family_links
    WHERE grandchild_id = auth.uid()
      AND grandma_id    = p_grandma_id
  ) THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;
  UPDATE profiles
     SET difficulties = p_difficulties
   WHERE id = p_grandma_id;
END;
$$;

-- 3. RPC: grandchild reads grandma's current difficulties
CREATE OR REPLACE FUNCTION get_grandma_difficulties(p_grandma_id uuid)
RETURNS text[]
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_difficulties text[];
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM family_links
    WHERE grandchild_id = auth.uid()
      AND grandma_id    = p_grandma_id
  ) THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;
  SELECT difficulties INTO v_difficulties
    FROM profiles WHERE id = p_grandma_id;
  RETURN COALESCE(v_difficulties, '{}');
END;
$$;
