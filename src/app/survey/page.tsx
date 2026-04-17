'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { submitSurveyAction } from './actions'

const ROLES = [
  { value: '총무', label: '총무', desc: '출석·회비·코트 관리 담당' },
  { value: '모임장·운영진', label: '모임장·운영진', desc: '모임 전체 운영 책임' },
  { value: '코치', label: '코치', desc: '레슨 및 회원 관리' },
  { value: '일반 회원', label: '일반 회원', desc: '동호회·소모임 참여자' },
]

const CURRENT_TOOLS = [
  '카카오톡 단체방',
  '엑셀·구글 시트',
  '수기(종이)',
  '별도 앱 사용 중',
  '그냥 안 함',
]

const PAIN_POINTS = [
  '출석 취합이 번거로워요 (카톡으로 일일이 확인)',
  '회비 누가 냈는지 추적이 어려워요',
  '코트 배정·팀 구성을 매번 머릿속으로 해요',
  '공지가 카톡에 묻혀 못 보는 사람이 생겨요',
  '회원 실력 파악이 안 돼서 팀 불균형이 생겨요',
  '경기 기록·전적이 남지 않아요',
]

const DESIRED_FEATURES = [
  '출석 체크 (버튼 클릭으로 간단하게)',
  '회비 납부 현황 & 미납자 알림',
  '자동 팀 배정 (실력 균등 매칭)',
  '경기 결과 기록 & 개인 전적',
  '일정 공지 & 참석 여부 확인',
  '회원 실력 등급 관리',
]

export default function SurveyPage() {
  const [step, setStep] = useState(1)
  const [role, setRole] = useState('')
  const [currentTools, setCurrentTools] = useState<string[]>([])
  const [painPoints, setPainPoints] = useState<string[]>([])
  const [desiredFeatures, setDesiredFeatures] = useState<string[]>([])
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [isPending, startTransition] = useTransition()

  const stepRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    if (step > 1) {
      stepRefs.current[step - 1]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [step])

  function toggleMulti(value: string, list: string[], setList: (v: string[]) => void, max: number) {
    if (list.includes(value)) {
      setList(list.filter(v => v !== value))
    } else if (list.length < max) {
      setList([...list, value])
    }
  }

  function handleSubmit() {
    const formData = new FormData()
    formData.set('role', role)
    currentTools.forEach(t => formData.append('currentTools', t))
    painPoints.forEach(p => formData.append('painPoints', p))
    desiredFeatures.forEach(f => formData.append('desiredFeatures', f))
    if (email) formData.set('email', email)

    startTransition(async () => {
      const result = await submitSurveyAction(formData)
      if (result.error) {
        setErrorMsg(result.error)
      } else {
        setSubmitted(true)
      }
    })
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-6">🏸</div>
          <h1 className="text-2xl font-extrabold text-[#111111] mb-3">응답해주셔서 감사해요!</h1>
          <p className="text-[#555555] mb-2">
            여러분의 고충을 바탕으로<br />진짜 필요한 서비스를 만들겠습니다.
          </p>
          <p className="text-base text-[#999999] mb-8">베타 출시 시 이메일로 가장 먼저 알려드릴게요.</p>
          <a href="/" className="inline-block bg-[#beff00] text-[#111111] font-bold px-6 py-3 rounded-xl hover:bg-[#a8e600] transition-colors">
            홈으로 돌아가기
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      {/* Hero */}
      <div className="bg-white border-b border-[#e5e5e5]">
        <div className="max-w-[1088px] mx-auto px-4 py-12 text-center">
          <span className="inline-block bg-[#beff00] text-[#111111] text-sm font-bold px-3 py-1 rounded-full mb-4">
            유저 리서치
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111111] mb-4 leading-tight">
            배드민턴 동호회 운영,<br />어떻게 하고 계세요?
          </h1>
          <p className="text-[#555555] text-lg max-w-xl mx-auto">
            총무·모임장·코치분들의 현실적인 고충을 듣고 싶어요.<br />
            <span className="font-semibold text-[#111111]">3분</span>이면 충분합니다.
          </p>
        </div>
      </div>

      <div className="max-w-[680px] mx-auto px-4 py-10 space-y-6">

        {/* Q1 */}
        <div ref={el => { stepRefs.current[0] = el }} className="bg-white rounded-2xl p-6 sm:p-8 border border-[#e5e5e5]">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-bold text-[#999999] uppercase tracking-wider">Q1</span>
          </div>
          <h2 className="text-2xl font-bold text-[#111111] mb-6">나는 어떤 역할인가요?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ROLES.map(r => (
              <button
                key={r.value}
                onClick={() => { setRole(r.value); if (step === 1) setStep(2) }}
                className={`text-left p-4 rounded-xl border-2 transition-all ${
                  role === r.value
                    ? 'border-[#beff00] bg-[#beff00]/10'
                    : 'border-[#e5e5e5] hover:border-[#111111]'
                }`}
              >
                <div className="font-bold text-[#111111]">{r.label}</div>
                <div className="text-base text-[#999999] mt-0.5">{r.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Q2 */}
        {step >= 2 && (
          <div ref={el => { stepRefs.current[1] = el }} className="bg-white rounded-2xl p-6 sm:p-8 border border-[#e5e5e5]">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-bold text-[#999999] uppercase tracking-wider">Q2</span>
            </div>
            <h2 className="text-2xl font-bold text-[#111111] mb-2">지금 어떻게 관리하고 있나요?</h2>
            <p className="text-base text-[#999999] mb-6">복수 선택 가능</p>
            <div className="flex flex-wrap gap-3">
              {CURRENT_TOOLS.map(t => (
                <button
                  key={t}
                  onClick={() => {
                    toggleMulti(t, currentTools, setCurrentTools, 5)
                  }}
                  className={`px-4 py-2.5 rounded-full border-2 text-base font-medium transition-all ${
                    currentTools.includes(t)
                      ? 'border-[#111111] bg-[#111111] text-white'
                      : 'border-[#e5e5e5] text-[#555555] hover:border-[#111111]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            {step === 2 && currentTools.length > 0 && (
              <button
                onClick={() => setStep(3)}
                className="mt-6 w-full bg-[#beff00] text-[#111111] font-bold py-3 rounded-xl hover:bg-[#a8e600] transition-colors"
              >
                다음 →
              </button>
            )}
          </div>
        )}

        {/* Q3 */}
        {step >= 3 && (
          <div ref={el => { stepRefs.current[2] = el }} className="bg-white rounded-2xl p-6 sm:p-8 border border-[#e5e5e5]">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-bold text-[#999999] uppercase tracking-wider">Q3</span>
            </div>
            <h2 className="text-2xl font-bold text-[#111111] mb-2">가장 불편한 게 뭔가요?</h2>
            <p className="text-base text-[#999999] mb-6">최대 3개 선택</p>
            <div className="space-y-3">
              {PAIN_POINTS.map(p => (
                <button
                  key={p}
                  onClick={() => toggleMulti(p, painPoints, setPainPoints, 3)}
                  disabled={!painPoints.includes(p) && painPoints.length >= 3}
                  className={`w-full text-left px-5 py-4 rounded-xl border-2 text-base font-medium transition-all ${
                    painPoints.includes(p)
                      ? 'border-[#111111] bg-[#111111] text-white'
                      : painPoints.length >= 3
                      ? 'border-[#e5e5e5] text-[#cccccc] cursor-not-allowed'
                      : 'border-[#e5e5e5] text-[#555555] hover:border-[#111111]'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            {step === 3 && painPoints.length > 0 && (
              <button
                onClick={() => setStep(4)}
                className="mt-6 w-full bg-[#beff00] text-[#111111] font-bold py-3 rounded-xl hover:bg-[#a8e600] transition-colors"
              >
                다음 →
              </button>
            )}
          </div>
        )}

        {/* Q4 */}
        {step >= 4 && (
          <div ref={el => { stepRefs.current[3] = el }} className="bg-white rounded-2xl p-6 sm:p-8 border border-[#e5e5e5]">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-bold text-[#999999] uppercase tracking-wider">Q4</span>
            </div>
            <h2 className="text-2xl font-bold text-[#111111] mb-2">있으면 바로 쓸 기능은요?</h2>
            <p className="text-base text-[#999999] mb-6">최대 3개 선택</p>
            <div className="space-y-3">
              {DESIRED_FEATURES.map(f => (
                <button
                  key={f}
                  onClick={() => toggleMulti(f, desiredFeatures, setDesiredFeatures, 3)}
                  disabled={!desiredFeatures.includes(f) && desiredFeatures.length >= 3}
                  className={`w-full text-left px-5 py-4 rounded-xl border-2 text-base font-medium transition-all ${
                    desiredFeatures.includes(f)
                      ? 'border-[#beff00] bg-[#beff00]/10 text-[#111111]'
                      : desiredFeatures.length >= 3
                      ? 'border-[#e5e5e5] text-[#cccccc] cursor-not-allowed'
                      : 'border-[#e5e5e5] text-[#555555] hover:border-[#111111]'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            {step === 4 && desiredFeatures.length > 0 && (
              <button
                onClick={() => setStep(5)}
                className="mt-6 w-full bg-[#beff00] text-[#111111] font-bold py-3 rounded-xl hover:bg-[#a8e600] transition-colors"
              >
                다음 →
              </button>
            )}
          </div>
        )}

        {/* Q5 + Submit */}
        {step >= 5 && (
          <div ref={el => { stepRefs.current[4] = el }} className="bg-white rounded-2xl p-6 sm:p-8 border border-[#e5e5e5]">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-bold text-[#999999] uppercase tracking-wider">Q5</span>
              <span className="text-sm text-[#beff00] font-bold">선택</span>
            </div>
            <h2 className="text-2xl font-bold text-[#111111] mb-2">베타 출시 때 가장 먼저 알려드릴게요</h2>
            <p className="text-base text-[#999999] mb-6">이메일 주소를 남겨주시면 출시 소식을 먼저 보내드립니다.</p>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="이메일 주소 (선택사항)"
              className="w-full border border-[#e5e5e5] rounded-xl px-4 py-3 text-[#111111] placeholder:text-[#cccccc] focus:outline-none focus:border-[#111111] mb-6"
            />
            {errorMsg && (
              <p className="text-red-500 text-sm mb-4">{errorMsg}</p>
            )}
            <button
              onClick={handleSubmit}
              disabled={isPending}
              className="w-full bg-[#111111] text-white font-bold py-4 rounded-xl hover:bg-[#333333] transition-colors disabled:opacity-50 text-lg"
            >
              {isPending ? '제출 중...' : '제출하기 🏸'}
            </button>
            <p className="text-sm text-[#999999] text-center mt-4">
              수집된 정보는 서비스 개발 목적으로만 사용됩니다.
            </p>
          </div>
        )}

      </div>
    </div>
  )
}
