'use server'

import { createAdminClient } from '@/lib/supabase/admin'

export interface RacketRow {
  id: string
  slug: string
  name: string
  brand: string
  weight: string | null
  balance: string | null
  flex: string | null
  level: string[] | null
  type: string[] | null
  price_range: string | null
  popular_rank: number | null
  editor_pick: boolean
  is_popular: boolean
  status: string | null
  stat_power: number
  stat_control: number
  stat_speed: number
  stat_durability: number
  stat_repulsion: number
  stat_maneuver: number
  created_at: string
}

export async function getRackets(): Promise<{ data: RacketRow[]; error: string | null }> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('rackets')
    .select(
      'id, slug, name, brand, weight, balance, flex, level, type, price_range, popular_rank, editor_pick, is_popular, status, stat_power, stat_control, stat_speed, stat_durability, stat_repulsion, stat_maneuver, created_at',
    )
    .order('brand', { ascending: true })
    .order('name', { ascending: true })

  if (error) {
    return { data: [], error: error.message }
  }

  return { data: (data ?? []) as RacketRow[], error: null }
}

export async function updateRacketField(
  id: string,
  field: string,
  value: unknown,
): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('rackets')
    .update({ [field]: value, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

export async function createRacket(data: {
  name: string
  slug: string
  brand: string
}): Promise<{ data: RacketRow | null; error: string | null }> {
  const supabase = createAdminClient()
  const { data: created, error } = await supabase
    .from('rackets')
    .insert({
      name: data.name,
      slug: data.slug,
      brand: data.brand,
    })
    .select(
      'id, slug, name, brand, weight, balance, flex, level, type, price_range, popular_rank, editor_pick, is_popular, status, stat_power, stat_control, stat_speed, stat_durability, stat_repulsion, stat_maneuver, created_at',
    )
    .single()
  if (error) return { data: null, error: error.message }
  return { data: created as RacketRow, error: null }
}
