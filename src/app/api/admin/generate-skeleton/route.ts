import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export const CONTENT_LIST = [
  { id: 2, title: '배드민턴 체육관 처음 갔을 때 당황했던 것들', type: '바이럴', category: '공감/스토리' },
  { id: 3, title: '배드민턴 그립 잡는 법 — 포핸드 vs 백핸드', type: 'SEO', category: '기초 기술' },
  { id: 4, title: '헤드라이트 vs 헤드헤비 — 왕초보는 뭘 사야 할까?', type: 'SEO', category: '라켓/장비' },
  { id: 5, title: '배드민턴 동호회 처음 나갔을 때 생기는 일', type: '바이럴', category: '공감/스토리' },
  { id: 6, title: '클리어 치는 법 — 왕초보도 코트 끝까지 보내는 방법', type: 'SEO', category: '기초 기술' },
  { id: 7, title: '스매시 소리 나는 법 — "뻥" 소리의 비밀', type: 'SEO', category: '기초 기술' },
  { id: 8, title: '체육관 에티켓 완전 정리 — 이것만 알면 눈치 안 봐요', type: 'SEO', category: '실용 정보' },
  { id: 9, title: '배드민턴 1년 치면 실제로 얼마나 늘어요?', type: '바이럴', category: '공감/스토리' },
  { id: 10, title: '깃털 셔틀콕 vs 나일론 셔틀콕 — 입문자는 뭘 써야 할까?', type: 'SEO', category: '라켓/장비' },
]

const systemPrompt = `당신은 배드민턴 입문자(배린이) 전문 콘텐츠 작가입니다.
브랜드: Birdieminton (버디민턴)
슬로건: "배드민턴, 제대로 시작하는 법"
타겟: 왕초보~C조 배드민턴 입문자

글 스타일:
- 전문적이지만 어렵지 않게
- 배린이 편에서 확신을 주는 톤
- 짧고 명확하게 (한 문장 = 한 메시지)
- 구어체 허용 ("~거든요", "~해요" 등)

뼈대 구조:
1. 도입부: 공감 한 줄 + 간단한 소개 (3~4문장)
2. 소제목 3~5개: 각 소제목 아래 2~3문장 본문 + 💬 살붙이기 포인트 (작성자가 개인 경험 추가할 수 있도록 구체적인 가이드 제공)
3. 마무리: 요약 + CTA (퀴즈/도감 링크 자리 표시)
4. 관련 글 3개 제목 추천

💬 살붙이기 포인트는 반드시 포함하고, 어떤 개인 경험을 넣으면 좋은지 구체적으로 안내.`

export async function POST(req: Request) {
  const { title, type, category, password } = await req.json()

  if (password !== process.env.ADMIN_PASSWORD) {
    return Response.json({ error: 'unauthorized' }, { status: 401 })
  }

  const userPrompt = `다음 콘텐츠의 뼈대를 작성해주세요.

제목: ${title}
타입: ${type} (${type === 'SEO' ? '검색 유입 목적, 1500~3000자 목표' : '공감/바이럴 목적, 800~1200자 목표'})
카테고리: ${category}

마크다운 형식으로 작성해주세요.`

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2000,
      messages: [{ role: 'user', content: userPrompt }],
      system: systemPrompt,
    })

    const content = message.content[0].type === 'text' ? message.content[0].text : ''

    const seoTitle = title.includes('—') ? title : `${title} (왕초보 가이드)`

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9가-힣\s]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 60)

    return Response.json({
      title: seoTitle,
      slug,
      content,
      excerpt: `${category} — ${type === 'SEO' ? '검색 최적화' : '바이럴'} 콘텐츠`,
    })
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : '생성 실패' }, { status: 500 })
  }
}
