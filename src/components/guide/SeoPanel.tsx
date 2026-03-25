'use client'

interface SeoPanelProps {
  title: string
  slug: string
  excerpt: string
  content: string
  focusKeyword: string
  onFocusKeywordChange: (keyword: string) => void
}

type CheckStatus = 'pass' | 'warning' | 'fail'

interface CheckItem {
  label: string
  status: CheckStatus
  hint: string
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '')
}

function getFirstParagraphText(html: string): string {
  const match = html.match(/<p[^>]*>(.*?)<\/p>/i)
  if (!match) return ''
  return stripHtml(match[1])
}

function getChecks(
  title: string,
  slug: string,
  excerpt: string,
  content: string,
  focusKeyword: string,
): CheckItem[] {
  const kw = focusKeyword.trim().toLowerCase()
  const textContent = stripHtml(content)
  const excerptLen = excerpt.trim().length

  return [
    {
      label: '포커스 키워드',
      status: kw ? 'pass' : 'fail',
      hint: kw ? `"${focusKeyword}" 설정됨` : '포커스 키워드를 입력하세요',
    },
    {
      label: '제목에 키워드 포함',
      status:
        !kw ? 'fail'
        : title.toLowerCase().includes(kw) ? 'pass'
        : 'warning',
      hint:
        !kw ? '키워드를 먼저 입력하세요'
        : title.toLowerCase().includes(kw) ? '제목에 키워드가 포함되어 있습니다'
        : '제목에 키워드를 넣어보세요',
    },
    {
      label: '메타 설명 길이',
      status:
        excerptLen === 0 ? 'fail'
        : excerptLen >= 50 && excerptLen <= 160 ? 'pass'
        : 'warning',
      hint:
        excerptLen === 0 ? '요약을 입력하세요'
        : excerptLen < 50 ? `현재 ${excerptLen}자 — 최소 50자 이상 권장`
        : excerptLen > 160 ? `현재 ${excerptLen}자 — 160자 이하로 줄이세요`
        : `현재 ${excerptLen}자 — 적절합니다`,
    },
    {
      label: '슬러그에 키워드 포함',
      status:
        !kw ? 'fail'
        : slug.toLowerCase().includes(kw) ? 'pass'
        : 'warning',
      hint:
        !kw ? '키워드를 먼저 입력하세요'
        : slug.toLowerCase().includes(kw) ? '슬러그에 키워드가 포함되어 있습니다'
        : 'URL 슬러그에 키워드를 넣어보세요',
    },
    {
      label: '본문 길이',
      status: textContent.length >= 300 ? 'pass' : textContent.length > 0 ? 'warning' : 'fail',
      hint:
        textContent.length === 0 ? '본문을 작성하세요'
        : textContent.length < 300 ? `현재 ${textContent.length}자 — 300자 이상 권장`
        : `현재 ${textContent.length}자 — 충분합니다`,
    },
    {
      label: 'H2/H3 소제목 사용',
      status: /<h[23]/i.test(content) ? 'pass' : 'warning',
      hint: /<h[23]/i.test(content)
        ? '소제목이 사용되었습니다'
        : '본문에 소제목(H2/H3)을 추가하면 구조가 명확해져요',
    },
    {
      label: '첫 단락에 키워드',
      status:
        !kw ? 'fail'
        : getFirstParagraphText(content).toLowerCase().includes(kw) ? 'pass'
        : 'warning',
      hint:
        !kw ? '키워드를 먼저 입력하세요'
        : getFirstParagraphText(content).toLowerCase().includes(kw)
          ? '첫 단락에 키워드가 있습니다'
          : '첫 단락 초반에 키워드를 언급해보세요',
    },
  ]
}

const StatusDot = ({ status }: { status: CheckStatus }) => {
  const base = 'w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 text-white text-[9px] font-bold'
  if (status === 'pass') return <span className={`${base} bg-green-500`}>✓</span>
  if (status === 'warning') return <span className={`${base} bg-yellow-400 text-[#111111]`}>!</span>
  return <span className={`${base} bg-red-400`}>✕</span>
}

export default function SeoPanel({
  title, slug, excerpt, content, focusKeyword, onFocusKeywordChange,
}: SeoPanelProps) {
  const checks = getChecks(title, slug, excerpt, content, focusKeyword)
  const passCount = checks.filter((c) => c.status === 'pass').length
  const scoreLabel =
    passCount >= 5 ? 'SEO 좋음' : passCount >= 3 ? '개선 필요' : 'SEO 미흡'
  const scoreColor =
    passCount >= 5 ? 'text-green-600 bg-green-50 border-green-200'
    : passCount >= 3 ? 'text-yellow-700 bg-yellow-50 border-yellow-200'
    : 'text-red-600 bg-red-50 border-red-200'

  return (
    <div className="bg-white border border-[#e5e5e5] rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-extrabold text-[#111111]">SEO 최적화</h3>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${scoreColor}`}>
          {scoreLabel} {passCount}/7
        </span>
      </div>

      {/* Focus keyword input */}
      <div>
        <label className="block text-[10px] font-bold text-[#999999] mb-1">포커스 키워드</label>
        <input
          type="text"
          value={focusKeyword}
          onChange={(e) => onFocusKeywordChange(e.target.value)}
          placeholder="예: 배드민턴 라켓 추천"
          className="w-full px-3 py-2 text-sm border border-[#e5e5e5] rounded-lg text-[#111111] placeholder:text-[#999999] focus:outline-none focus:border-[#beff00] transition-colors"
        />
      </div>

      {/* Checklist */}
      <div className="space-y-2.5">
        {checks.map((check) => (
          <div key={check.label} className="flex items-start gap-2.5">
            <StatusDot status={check.status} />
            <div className="min-w-0">
              <p className="text-xs font-bold text-[#111111] leading-tight">{check.label}</p>
              <p className="text-[10px] text-[#999999] mt-0.5 leading-snug">{check.hint}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
