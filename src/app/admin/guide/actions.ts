'use server'

import { createAdminClient } from '@/lib/supabase/admin'

interface GuideData {
  slug: string
  title: string
  excerpt: string
  content: string
  cover_image: string
  published: boolean
}

interface Guide extends GuideData {
  id: string
  created_at: string
  updated_at: string
}

export async function createGuide(data: GuideData): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient()
  const { error } = await supabase.from('guides').insert([data])
  if (error) return { success: false, error: error.message }
  return { success: true }
}

export async function updateGuide(
  id: string,
  data: GuideData
): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('guides')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) return { success: false, error: error.message }
  return { success: true }
}

export async function deleteGuide(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient()
  const { error } = await supabase.from('guides').delete().eq('id', id)
  if (error) return { success: false, error: error.message }
  return { success: true }
}

export async function getGuides(): Promise<Guide[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('guides')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) return []
  return (data as Guide[]) ?? []
}

export async function getGuideById(id: string): Promise<Guide | null> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('guides')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return null
  return data as Guide
}
