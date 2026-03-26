'use server'

import { Resend } from 'resend'
import { createAdminClient } from '@/lib/supabase/admin'
import { buildWelcomeEmail } from '@/lib/email/welcomeTemplate'
import type { QuizLevel } from '@/lib/email/welcomeTemplate'

const resend = new Resend(process.env.RESEND_API_KEY)

const VALID_LEVELS: QuizLevel[] = ['왕초보', '초심자', 'D조', 'C조']

export async function subscribeAndSendWelcome(
  email: string,
  level: string
): Promise<{ success: boolean; error?: string }> {
  if (!email || !email.includes('@')) return { success: false, error: '유효하지 않은 이메일' }

  const quizLevel = VALID_LEVELS.includes(level as QuizLevel) ? (level as QuizLevel) : null
  if (!quizLevel) return { success: false, error: '유효하지 않은 레벨' }

  // 1. Supabase에 구독자 저장
  try {
    const supabase = createAdminClient()
    await supabase.from('subscribers').upsert(
      { email, level, source: 'quiz' },
      { onConflict: 'email' }
    )
  } catch {
    // 저장 실패해도 이메일 발송은 진행
  }

  // 2. 웰컴 이메일 발송
  const resultUrl = `https://birdieminton.com/quiz/result/${encodeURIComponent(quizLevel)}`
  const { subject, html } = buildWelcomeEmail(quizLevel, resultUrl)

  const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'Birdieminton <onboarding@resend.dev>'

  const { error } = await resend.emails.send({
    from: fromEmail,
    to: email,
    subject,
    html,
  })

  if (error) {
    console.error('[Resend] 이메일 발송 실패:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}
