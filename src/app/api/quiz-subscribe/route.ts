import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const { email, level, stibeeTag, gender } = await req.json()
    if (!email || !email.includes('@')) {
      return Response.json({ error: 'invalid email' }, { status: 400 })
    }

    const supabase = await createClient()
    await supabase.from('subscribers').upsert(
      { email, level_tag: stibeeTag, source: 'quiz', gender: gender ?? '' },
      { onConflict: 'email' }
    )

    // TODO: Stibee API 연동
    // await fetch('https://api.stibee.com/v1/lists/{LIST_ID}/subscribers', {
    //   method: 'POST',
    //   headers: { 'AppToken': process.env.STIBEE_API_KEY!, 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ subscribers: [{ email, groups: [stibeeTag] }] }),
    // })

    return Response.json({ success: true })
  } catch {
    return Response.json({ error: 'server error' }, { status: 500 })
  }
}
