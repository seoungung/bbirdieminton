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

export async function uploadGuideImage(
  formData: FormData
): Promise<{ url?: string; error?: string }> {
  const file = formData.get('file') as File | null
  if (!file || file.size === 0) return { error: '파일이 없습니다.' }

  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!allowed.includes(file.type)) return { error: '지원하지 않는 파일 형식입니다.' }

  const ext = file.name.split('.').pop() ?? 'jpg'
  const fileName = `guide-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const supabase = createAdminClient()
  const arrayBuffer = await file.arrayBuffer()
  const { error } = await supabase.storage
    .from('guide-images')
    .upload(fileName, arrayBuffer, { contentType: file.type, upsert: false })

  if (error) return { error: error.message }

  const { data: { publicUrl } } = supabase.storage
    .from('guide-images')
    .getPublicUrl(fileName)

  return { url: publicUrl }
}
