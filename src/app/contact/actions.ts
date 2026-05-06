'use server'

const CS_EMAIL = 'skyyolle7@gmail.com'

interface ContactFormState {
  error?: string
  success?: string
}

export async function submitContactAction(
  _prevState: ContactFormState | null,
  formData: FormData
): Promise<ContactFormState> {
  const name = (formData.get('name') as string)?.trim()
  const email = (formData.get('email') as string)?.trim()
  const category = (formData.get('category') as string) ?? '기타'
  const message = (formData.get('message') as string)?.trim()

  // 서버 검증
  if (!name) return { error: '이름을 입력해주세요.' }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: '올바른 이메일을 입력해주세요.' }
  }
  if (!message || message.length < 10) {
    return { error: '문의 내용을 10자 이상 입력해주세요.' }
  }
  if (message.length > 5000) {
    return { error: '문의 내용은 5000자 이하로 입력해주세요.' }
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.error('[contact] RESEND_API_KEY not configured')
    return { error: '메일 발송 설정 오류. 관리자에게 문의해주세요.' }
  }

  const subject = `[버디민턴 문의] ${category} — ${name}`
  const html = `
    <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #0a0a0a; border-bottom: 2px solid #DBE64C; padding-bottom: 10px;">
        버디민턴 1:1 문의
      </h2>
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <tr>
          <td style="padding: 10px; background: #f8f8f8; font-weight: bold; width: 120px;">이름</td>
          <td style="padding: 10px; background: #fff; border: 1px solid #e5e5e5;">${escapeHtml(name)}</td>
        </tr>
        <tr>
          <td style="padding: 10px; background: #f8f8f8; font-weight: bold;">이메일</td>
          <td style="padding: 10px; background: #fff; border: 1px solid #e5e5e5;">
            <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a>
          </td>
        </tr>
        <tr>
          <td style="padding: 10px; background: #f8f8f8; font-weight: bold;">카테고리</td>
          <td style="padding: 10px; background: #fff; border: 1px solid #e5e5e5;">${escapeHtml(category)}</td>
        </tr>
        <tr>
          <td style="padding: 10px; background: #f8f8f8; font-weight: bold; vertical-align: top;">내용</td>
          <td style="padding: 10px; background: #fff; border: 1px solid #e5e5e5; white-space: pre-wrap;">${escapeHtml(message)}</td>
        </tr>
      </table>
      <p style="color: #999; font-size: 12px; margin-top: 20px;">
        버디민턴 웹사이트 /contact 페이지에서 접수된 문의입니다.
      </p>
    </div>
  `

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Birdieminton <onboarding@resend.dev>',
        to: [CS_EMAIL],
        reply_to: email,
        subject,
        html,
      }),
    })

    if (!res.ok) {
      const body = await res.text()
      console.error('[contact] Resend API failed:', res.status, body)
      return { error: '메일 발송에 실패했습니다. 잠시 후 다시 시도해주세요.' }
    }

    return { success: '문의가 접수되었습니다. 영업일 기준 1~3일 이내 답변드리겠습니다.' }
  } catch (err) {
    console.error('[contact] Exception:', err)
    return { error: '서버 오류가 발생했습니다.' }
  }
}

/** 간단한 HTML 이스케이프 (XSS 방지) */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
