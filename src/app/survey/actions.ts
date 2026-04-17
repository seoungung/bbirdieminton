'use server'

import { createAdminClient } from '@/lib/supabase/admin'

export async function submitSurveyAction(formData: FormData) {
  const role = formData.get('role') as string
  const currentTools = formData.getAll('currentTools') as string[]
  const painPoints = formData.getAll('painPoints') as string[]
  const desiredFeatures = formData.getAll('desiredFeatures') as string[]
  const email = formData.get('email') as string | null

  if (!role || painPoints.length === 0 || desiredFeatures.length === 0) {
    return { error: '필수 항목을 모두 입력해주세요.' }
  }

  const admin = createAdminClient()
  const { error } = await admin.from('survey_responses').insert({
    role,
    current_tools: currentTools,
    pain_points: painPoints,
    desired_features: desiredFeatures,
    email: email || null,
  })

  if (error) return { error: '제출에 실패했습니다. 다시 시도해주세요.' }
  return { success: true }
}
