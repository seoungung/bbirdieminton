export type QuizLevel = '왕초보' | '초심자' | 'D조' | 'C조'

const levelData: Record<QuizLevel, {
  emoji: string
  tagline: string
  tip: string
  racketSpec: string
  ctaText: string
}> = {
  '왕초보': {
    emoji: '🐣',
    tagline: '이제 막 시작하는 당신을 응원해요',
    tip: '무게 5U~6U, 헤드라이트 또는 이븐밸런스, Flexible 샤프트 라켓을 추천드려요. 가볍고 다루기 쉬운 라켓으로 시작하면 기본기가 훨씬 빠르게 잡혀요.',
    racketSpec: '무게 5~6U · 헤드라이트 · Flexible',
    ctaText: '내 레벨 전체 결과 보기',
  },
  '초심자': {
    emoji: '🌱',
    tagline: '기초를 다지는 중요한 단계예요',
    tip: '무게 4U~5U, 이븐밸런스, Medium 샤프트 라켓으로 넘어갈 시점이에요. 스윙 감각이 생겼다면 조금 더 안정적인 라켓이 컨트롤을 높여줘요.',
    racketSpec: '무게 4~5U · 이븐밸런스 · Medium',
    ctaText: '내 레벨 전체 결과 보기',
  },
  'D조': {
    emoji: '⚡',
    tagline: '실력이 빠르게 오르고 있어요',
    tip: '무게 3U~4U, 플레이 스타일에 따라 헤드헤비(공격형) 또는 이븐밸런스(올라운드)를 선택하세요. 샤프트는 Medium~Stiff가 정확한 임팩트를 만들어줘요.',
    racketSpec: '무게 3~4U · 이븐밸런스~헤드헤비 · Medium~Stiff',
    ctaText: '내 레벨 전체 결과 보기',
  },
  'C조': {
    emoji: '🏆',
    tagline: '이미 탄탄한 실력의 소유자예요',
    tip: '무게 3U, 플레이 스타일에 맞는 스펙을 정밀하게 선택하세요. Stiff 샤프트로 스윙 파워를 정확하게 전달하고, 스트링 장력도 26~28lbs로 높여보세요.',
    racketSpec: '무게 3U · 스타일 맞춤 · Stiff',
    ctaText: '내 레벨 전체 결과 보기',
  },
}

export function buildWelcomeEmail(level: QuizLevel, resultUrl: string): { subject: string; html: string } {
  const d = levelData[level]

  const subject = `[버디민턴] ${d.emoji} ${level} 레벨 확인 완료 — 맞춤 라켓 가이드 도착!`

  const html = `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#f8f8f8;font-family:'Apple SD Gothic Neo',AppleGothic,'Malgun Gothic','맑은 고딕',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f8f8;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e5e5;">

          <!-- Header -->
          <tr>
            <td style="background:#111111;padding:24px 32px;text-align:center;">
              <span style="font-size:20px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">
                birdie<span style="color:#beff00;">minton</span>
              </span>
            </td>
          </tr>

          <!-- Level Badge -->
          <tr>
            <td style="padding:40px 32px 24px;text-align:center;">
              <div style="display:inline-block;background:#f0f0f0;border-radius:100px;padding:8px 20px;font-size:13px;font-weight:700;color:#555555;margin-bottom:16px;">
                레벨 진단 결과
              </div>
              <div style="font-size:48px;margin-bottom:12px;">${d.emoji}</div>
              <h1 style="font-size:28px;font-weight:800;color:#111111;margin:0 0 8px;">${level}</h1>
              <p style="font-size:15px;color:#555555;margin:0;">${d.tagline}</p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 32px;">
              <div style="border-top:1px solid #e5e5e5;"></div>
            </td>
          </tr>

          <!-- Racket Spec -->
          <tr>
            <td style="padding:28px 32px;">
              <p style="font-size:12px;font-weight:700;color:#999999;text-transform:uppercase;letter-spacing:1px;margin:0 0 12px;">추천 라켓 스펙</p>
              <div style="background:#f8f8f8;border-radius:12px;padding:16px 20px;border-left:4px solid #beff00;">
                <p style="font-size:15px;font-weight:700;color:#111111;margin:0 0 8px;">${d.racketSpec}</p>
                <p style="font-size:13px;color:#555555;line-height:1.6;margin:0;">${d.tip}</p>
              </div>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:0 32px 40px;text-align:center;">
              <a href="${resultUrl}" style="display:inline-block;background:#beff00;color:#111111;font-size:15px;font-weight:800;text-decoration:none;padding:16px 32px;border-radius:12px;">
                ${d.ctaText} →
              </a>
              <p style="font-size:12px;color:#999999;margin-top:16px;">추천 라켓 3종 · 이번 달 집중 포인트 · 실수 경보 포함</p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 32px;">
              <div style="border-top:1px solid #e5e5e5;"></div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px;text-align:center;">
              <p style="font-size:12px;color:#999999;margin:0 0 4px;">배드민턴, 제대로 시작하는 법</p>
              <a href="https://birdieminton.com" style="font-size:12px;color:#beff00;text-decoration:none;">birdieminton.com</a>
              <p style="font-size:11px;color:#cccccc;margin:12px 0 0;">더 이상 이메일을 받고 싶지 않으신가요? 이 이메일에 회신해 주세요.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  return { subject, html }
}
