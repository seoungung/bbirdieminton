'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  REGIONS,
  CLUB_TAGS,
  MAX_TAGS,
  CLUB_NAME_MAX,
  CLUB_DESCRIPTION_MAX,
  CUSTOM_URL_REGEX,
  FREE_PLAN_MEMBER_LIMIT,
  type CoverPresetKey,
  type Region,
  type ClubTag,
} from '@/lib/club/constants'
import {
  createClubAction,
  checkCustomUrlAvailable,
} from '@/app/club/create/actions'

type Step = 1 | 2 | 3

type FormState = {
  coverPreset: CoverPresetKey
  logoPreset: CoverPresetKey
  coverImage: string | null  // dataURL (미리보기용, 실제 Storage 업로드는 추후)
  logoImage: string | null
  name: string
  description: string
  customUrlId: string
  region: Region | ''
  regionDetail: string
  gym: string
  tags: ClubTag[]
}

const INITIAL_STATE: FormState = {
  coverPreset: 'forest',
  logoPreset: 'lime',
  coverImage: null,
  logoImage: null,
  name: '',
  description: '',
  customUrlId: '',
  region: '',
  regionDetail: '',
  gym: '',
  tags: [],
}

const STEP_TITLES: Record<Step, { title: string; description: string }> = {
  1: { title: '모임 소개',     description: '커버와 로고, 이름과 한 줄 소개를 정해 주세요.' },
  2: { title: '지역과 체육관', description: '주로 활동하는 지역과 체육관을 입력합니다.' },
  3: { title: '성향 태그',      description: `우리 모임의 분위기를 알려 주세요. 최대 ${MAX_TAGS}개까지 선택할 수 있어요.` },
}

/* ─────────────────────────────────────────────────────────────
 * 메인 컴포넌트
 * ───────────────────────────────────────────────────────────── */
export function ClubCreateForm() {
  const router = useRouter()
  const [step, setStep] = React.useState<Step>(1)
  const [form, setForm] = React.useState<FormState>(INITIAL_STATE)
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // custom URL 가용성 — 디바운스로 검사
  const [urlState, setUrlState] = React.useState<
    { status: 'idle' } | { status: 'checking' } | { status: 'ok' } | { status: 'taken' } | { status: 'invalid' }
  >({ status: 'idle' })

  React.useEffect(() => {
    const value = form.customUrlId.trim().toLowerCase()
    if (value.length === 0) {
      setUrlState({ status: 'idle' })
      return
    }
    if (!CUSTOM_URL_REGEX.test(value)) {
      setUrlState({ status: 'invalid' })
      return
    }
    setUrlState({ status: 'checking' })
    const handle = setTimeout(async () => {
      const result = await checkCustomUrlAvailable(value)
      if (result.available) setUrlState({ status: 'ok' })
      else setUrlState({ status: 'taken' })
    }, 350)
    return () => clearTimeout(handle)
  }, [form.customUrlId])

  /* Step 별 검증 — Next 버튼 disable 용 */
  const step1Valid =
    form.name.trim().length > 0 &&
    form.name.trim().length <= CLUB_NAME_MAX &&
    form.description.length <= CLUB_DESCRIPTION_MAX &&
    urlState.status === 'ok'

  const step2Valid = form.region !== ''

  const step3Valid = form.tags.length <= MAX_TAGS

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((s) => ({ ...s, [key]: value }))
  }

  function toggleTag(tag: ClubTag) {
    setForm((s) => {
      const has = s.tags.includes(tag)
      if (has) return { ...s, tags: s.tags.filter((t) => t !== tag) }
      if (s.tags.length >= MAX_TAGS) return s
      return { ...s, tags: [...s.tags, tag] }
    })
  }

  async function handleSubmit() {
    if (!step3Valid || submitting) return
    setSubmitting(true)
    setError(null)
    try {
      const result = await createClubAction({
        coverPreset: form.coverPreset,
        logoPreset: form.logoPreset,
        name: form.name.trim(),
        description: form.description.trim(),
        customUrlId: form.customUrlId.trim().toLowerCase(),
        region: form.region as Region,
        regionDetail: form.regionDetail.trim(),
        gym: form.gym.trim(),
        tags: form.tags,
      })
      if (!result.ok) {
        setError(result.error)
        setSubmitting(false)
        return
      }
      router.push(`/club/${result.data.clubId}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : '알 수 없는 오류가 발생했습니다')
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <StepIndicator current={step} />

      <Card variant="default">
        <CardHeader>
          <CardTitle className="text-xl">{STEP_TITLES[step].title}</CardTitle>
          <CardDescription>{STEP_TITLES[step].description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pb-6">
          {step === 1 && (
            <Step1Branding form={form} update={update} urlState={urlState} />
          )}
          {step === 2 && <Step2Info form={form} update={update} />}
          {step === 3 && <Step3Tags form={form} toggleTag={toggleTag} />}
        </CardContent>
      </Card>

      {/* SaaS 넛지 — PRD §3.2 */}
      {step === 3 && (
        <div className="rounded-xl border border-beige-50 bg-beige-25 p-4">
          <div className="flex items-start gap-3">
            <Badge variant="lime">FREE</Badge>
            <p className="text-sm text-forest leading-relaxed">
              현재 <strong>Free 플랜</strong>(최대 {FREE_PLAN_MEMBER_LIMIT}명)으로 개설됩니다.
              <br />
              <span className="text-muted-foreground">
                인원이 늘면 Basic/Pro 로 자유롭게 업그레이드할 수 있어요.
              </span>
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        {step > 1 ? (
          <Button
            variant="ghost"
            onClick={() => {
              setError(null)
              setStep((s) => (s - 1) as Step)
            }}
            disabled={submitting}
          >
            이전
          </Button>
        ) : (
          <div />
        )}

        {step < 3 && (
          <Button
            variant="accent"
            onClick={() => setStep((s) => (s + 1) as Step)}
            disabled={(step === 1 && !step1Valid) || (step === 2 && !step2Valid)}
          >
            다음
          </Button>
        )}

        {step === 3 && (
          <Button
            variant="accent"
            onClick={handleSubmit}
            disabled={!step3Valid || submitting}
          >
            {submitting ? '만드는 중…' : '모임 만들기'}
          </Button>
        )}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
 * Step indicator — 상단 진행 바 (PRD: 1 브랜딩 → 2 정보 → 3 태그)
 * ───────────────────────────────────────────────────────────── */
function StepIndicator({ current }: { current: Step }) {
  const steps: { id: Step; label: string }[] = [
    { id: 1, label: '브랜딩' },
    { id: 2, label: '정보' },
    { id: 3, label: '태그' },
  ]
  return (
    <div>
      <div className="flex items-center gap-2">
        {steps.map((s, i) => {
          const active = current === s.id
          const done = current > s.id
          return (
            <React.Fragment key={s.id}>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'inline-flex items-center justify-center w-7 h-7 rounded-full text-[12px] font-bold tabular transition-colors',
                    done && 'bg-forest text-beige',
                    active && 'bg-lime text-forest',
                    !done && !active && 'bg-beige-50 text-muted-foreground'
                  )}
                >
                  {done ? '✓' : s.id}
                </span>
                <span
                  className={cn(
                    'text-sm font-semibold transition-colors',
                    active ? 'text-forest' : 'text-muted-foreground'
                  )}
                >
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className="flex-1 h-px bg-beige-50 mx-1" />
              )}
            </React.Fragment>
          )
        })}
      </div>

      {/* progress fill */}
      <div className="mt-3 h-1.5 rounded-full bg-beige-50 overflow-hidden">
        <div
          className="h-full bg-lime transition-[width] duration-[var(--duration-base)] ease-[var(--ease-out-soft)]"
          style={{ width: `${(current / 3) * 100}%` }}
        />
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
 * Step 1 — 브랜딩
 * ───────────────────────────────────────────────────────────── */
function Step1Branding({
  form,
  update,
  urlState,
}: {
  form: FormState
  update: <K extends keyof FormState>(key: K, value: FormState[K]) => void
  urlState:
    | { status: 'idle' }
    | { status: 'checking' }
    | { status: 'ok' }
    | { status: 'taken' }
    | { status: 'invalid' }
}) {
  const initials = form.name.trim().slice(0, 2) || '모임'

  function handleFile(
    e: React.ChangeEvent<HTMLInputElement>,
    kind: 'coverImage' | 'logoImage'
  ) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      alert('파일은 5MB 이하만 업로드할 수 있어요.')
      return
    }
    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string
      update(kind, dataUrl)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-6">
      {/* 미리보기 — YouTube 채널 페이지 패턴 (커버 + 로고/정보 row) */}
      <div>
        <div className="text-sm font-semibold text-forest mb-2">미리보기</div>
        <div className="space-y-4">
          {/* 커버 */}
          <div className="rounded-xl overflow-hidden bg-beige-50 aspect-[4/1]">
            {form.coverImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={form.coverImage}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[11px] text-muted-foreground">
                커버 이미지가 여기에 표시됩니다
              </div>
            )}
          </div>

          {/* 로고 + 정보 row */}
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-forest text-beige flex items-center justify-center text-base font-bold shadow-[0_4px_12px_-2px_rgb(0_58_11_/_0.25)] shrink-0 overflow-hidden">
              {form.logoImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={form.logoImage}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{initials}</span>
              )}
            </div>

            <div className="flex-1 min-w-0 space-y-1">
              <div className="text-lg font-bold text-forest leading-tight truncate">
                {form.name.trim() || '모임 이름'}
              </div>
              {form.customUrlId.trim() && (
                <div className="text-[11px] text-muted-foreground font-mono tabular truncate">
                  /club/{form.customUrlId.trim().toLowerCase()}
                </div>
              )}
              <div className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                {form.description.trim() || '한 줄 소개가 여기에 표시됩니다'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 커버 이미지 업로드 */}
      <Field
        label="커버 이미지"
        optional
        hint="권장 16:9, 5MB 이하"
      >
        <ImageUpload
          value={form.coverImage}
          onChange={(v) => update('coverImage', v)}
          onFileSelect={(e) => handleFile(e, 'coverImage')}
          previewClass="w-20 h-12"
        />
      </Field>

      {/* 로고 이미지 업로드 */}
      <Field
        label="로고 이미지"
        optional
        hint="정사각형 권장, 5MB 이하"
      >
        <ImageUpload
          value={form.logoImage}
          onChange={(v) => update('logoImage', v)}
          onFileSelect={(e) => handleFile(e, 'logoImage')}
          previewClass="w-12 h-12 rounded-full"
          round
        />
      </Field>

      {/* 모임 이름 */}
      <Field
        label="모임 이름"
        hint={`${form.name.length}/${CLUB_NAME_MAX}자`}
      >
        <Input
          value={form.name}
          maxLength={CLUB_NAME_MAX}
          placeholder="예: 마포 타우너스"
          onChange={(e) => update('name', e.target.value)}
        />
      </Field>

      {/* 한 줄 소개 */}
      <Field
        label="한 줄 소개"
        optional
        hint={`${form.description.length}/${CLUB_DESCRIPTION_MAX}자`}
      >
        <Input
          value={form.description}
          maxLength={CLUB_DESCRIPTION_MAX}
          placeholder="예: 주말 아침 망원한강공원에서 만나요"
          onChange={(e) => update('description', e.target.value)}
        />
      </Field>

      {/* custom URL ID */}
      <Field
        label="커스텀 URL"
        hint={
          urlState.status === 'checking' ? '확인 중…' :
          urlState.status === 'ok'       ? '사용 가능' :
          urlState.status === 'taken'    ? '이미 사용 중' :
          urlState.status === 'invalid'  ? '형식 불일치 (영문 소문자/숫자/하이픈 3~30자)' :
          '영문 소문자/숫자/하이픈, 3~30자'
        }
        hintTone={
          urlState.status === 'ok' ? 'success'
          : urlState.status === 'taken' || urlState.status === 'invalid' ? 'danger'
          : 'muted'
        }
      >
        <div className="flex items-stretch rounded-lg border border-beige-75 bg-background overflow-hidden focus-within:border-forest focus-within:ring-2 focus-within:ring-lime/30 transition-[border-color,box-shadow] duration-[var(--duration-fast)] ease-[var(--ease-out-soft)]">
          <span className="px-3 inline-flex items-center text-sm text-muted-foreground bg-beige-25 border-r border-beige-50 select-none">
            buddyminton.com/club/
          </span>
          <input
            className="flex-1 h-10 px-3 text-sm text-foreground placeholder:text-muted-foreground bg-background focus:outline-none lowercase"
            placeholder="mapo-tauners"
            value={form.customUrlId}
            maxLength={30}
            onChange={(e) =>
              update(
                'customUrlId',
                e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')
              )
            }
          />
        </div>
      </Field>
    </div>
  )
}

function ImageUpload({
  value,
  onChange,
  onFileSelect,
  previewClass,
  round = false,
}: {
  value: string | null
  onChange: (v: string | null) => void
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
  previewClass: string
  round?: boolean
}) {
  const inputId = React.useId()
  return (
    <div className="flex items-center gap-3">
      {value ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt=""
            className={cn(
              'object-cover border border-beige-50',
              previewClass,
              round ? 'rounded-full' : 'rounded-lg'
            )}
          />
          <label
            htmlFor={inputId}
            className="text-xs text-muted-foreground hover:text-forest underline cursor-pointer transition-colors"
          >
            변경
          </label>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-xs text-muted-foreground hover:text-destructive underline transition-colors"
          >
            제거
          </button>
        </>
      ) : (
        <label
          htmlFor={inputId}
          className={cn(
            'inline-flex items-center justify-center px-4 py-2 rounded-lg bg-beige-25 border border-beige-75 text-sm font-medium text-forest cursor-pointer transition-colors',
            'hover:bg-beige-50 hover:border-forest/40'
          )}
        >
          파일 선택
        </label>
      )}
      <input
        id={inputId}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={onFileSelect}
      />
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
 * Step 2 — 정보
 * ───────────────────────────────────────────────────────────── */
function Step2Info({
  form,
  update,
}: {
  form: FormState
  update: <K extends keyof FormState>(key: K, value: FormState[K]) => void
}) {
  return (
    <div className="space-y-6">
      <Field label="시/도">
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
          {REGIONS.map((r) => {
            const selected = form.region === r
            return (
              <button
                key={r}
                type="button"
                onClick={() => update('region', r)}
                className={cn(
                  'h-10 rounded-lg text-sm font-medium border transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-soft)]',
                  selected
                    ? 'bg-forest text-beige border-forest'
                    : 'bg-background text-foreground border-beige-75 hover:border-forest/40 hover:bg-beige-25'
                )}
              >
                {r}
              </button>
            )
          })}
        </div>
      </Field>

      <Field
        label="시/군/구"
        optional
        hint="예: 마포구, 분당구 — 정확한 동적 검색은 추후 지원합니다"
      >
        <Input
          value={form.regionDetail}
          maxLength={40}
          placeholder="예: 마포구 망원동"
          onChange={(e) => update('regionDetail', e.target.value)}
        />
      </Field>

      <Field
        label="체육관"
        optional
        hint="자주 모이는 체육관 이름 (지도 검색은 추후 지원)"
      >
        <Input
          value={form.gym}
          maxLength={60}
          placeholder="예: 망원배드민턴장"
          onChange={(e) => update('gym', e.target.value)}
        />
      </Field>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
 * Step 3 — 태그
 * ───────────────────────────────────────────────────────────── */
function Step3Tags({
  form,
  toggleTag,
}: {
  form: FormState
  toggleTag: (tag: ClubTag) => void
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-forest">성향 태그</div>
        <div className="text-xs text-muted-foreground tabular">
          {form.tags.length} / {MAX_TAGS} 선택
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {CLUB_TAGS.map((tag) => {
          const selected = form.tags.includes(tag)
          const disabled = !selected && form.tags.length >= MAX_TAGS
          return (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              disabled={disabled}
              className={cn(
                'inline-flex items-center h-9 px-3.5 rounded-full text-sm font-medium border transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-soft)]',
                selected
                  ? 'bg-forest text-beige border-forest'
                  : 'bg-background text-foreground border-beige-75 hover:border-forest/40 hover:bg-beige-25',
                disabled && 'opacity-40 cursor-not-allowed hover:bg-background hover:border-beige-75'
              )}
            >
              {tag}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
 * Field — 라벨 + 힌트 + children
 * ───────────────────────────────────────────────────────────── */
function Field({
  label,
  hint,
  hintTone = 'muted',
  optional = false,
  children,
}: {
  label: string
  hint?: string
  hintTone?: 'muted' | 'success' | 'danger'
  optional?: boolean
  children: React.ReactNode
}) {
  const hintClass =
    hintTone === 'success' ? 'text-grass'
    : hintTone === 'danger' ? 'text-destructive'
    : 'text-muted-foreground'
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-forest">
          {label}
          {optional && (
            <span className="ml-1.5 text-[11px] font-normal text-muted-foreground">(선택)</span>
          )}
        </label>
        {hint && <span className={cn('text-[11px] tabular', hintClass)}>{hint}</span>}
      </div>
      {children}
    </div>
  )
}
