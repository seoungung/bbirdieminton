'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function updateNicknameAction(
  _prevState: { error?: string; success?: string } | null,
  formData: FormData
): Promise<{ error?: string; success?: string }> {
  const name = (formData.get('name') as string)?.trim()

  if (!name) return { error: '닉네임을 입력해주세요.' }
  if (name.length < 2) return { error: '닉네임은 2자 이상이어야 합니다.' }
  if (name.length > 20) return { error: '닉네임은 20자 이하여야 합니다.' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요합니다.' }

  const { error } = await supabase
    .from('users')
    .update({ name })
    .eq('birdieminton_user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/my/profile')
  revalidatePath('/club/home')
  return { success: '닉네임이 변경되었습니다.' }
}
