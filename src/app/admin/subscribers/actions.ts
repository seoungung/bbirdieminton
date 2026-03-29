'use server'
import { createClient } from '@/lib/supabase/server'

export async function deleteSubscriber(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('subscribers').delete().eq('id', id)
  if (error) return { success: false, error: error.message }
  return { success: true }
}
