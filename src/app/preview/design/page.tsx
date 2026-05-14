import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Calendar,
  ChevronRight,
  Clock,
  MapPin,
  Plus,
  Search,
  Trophy,
  Users,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

function Section({
  id,
  eyebrow,
  title,
  description,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20 py-16 border-t border-border/60 first:border-t-0">
      <div className="mb-10">
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-forest mb-3">
          {eyebrow}
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">{title}</h2>
        {description && (
          <p className="text-base text-muted-foreground max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {children}
    </section>
  );
}

function Swatch({
  name,
  varName,
  hex,
  textOnDark = false,
  className,
}: {
  name: string;
  varName: string;
  hex: string;
  textOnDark?: boolean;
  className: string;
}) {
  return (
    <div className="group">
      <div
        className={`${className} h-24 rounded-xl border border-border/60 shadow-sm flex items-end p-3`}
      >
        <span
          className={`text-[11px] font-mono tabular ${
            textOnDark ? "text-beige/70" : "text-forest/70"
          }`}
        >
          {hex}
        </span>
      </div>
      <div className="mt-2.5 px-0.5">
        <div className="text-[13px] font-semibold text-foreground leading-tight">{name}</div>
        <div className="text-[11px] text-muted-foreground font-mono mt-0.5">{varName}</div>
      </div>
    </div>
  );
}

function SpacingBar({
  token,
  rem,
  px,
  widthClass,
}: {
  token: string;
  rem: string;
  px: number;
  widthClass: string;
}) {
  return (
    <div className="flex items-center gap-4 py-2.5 border-b border-border/60 last:border-b-0">
      <div className="w-16 shrink-0">
        <div className="text-sm font-semibold text-foreground">{token}</div>
        <div className="text-[11px] text-muted-foreground font-mono tabular">{rem}</div>
      </div>
      <div className={`${widthClass} h-3 bg-lime rounded-sm`} />
      <div className="text-[11px] text-muted-foreground font-mono tabular ml-auto">{px}px</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function DesignPreviewPage() {
  return (
    <main className="min-h-screen bg-beige">
      {/* ─── Top Bar ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-beige/85 border-b border-border/70">
        <div className="max-w-[1200px] mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-7 rounded-md bg-forest grid place-items-center">
              <span className="text-lime text-sm font-black tabular">B</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight">버디민턴</span>
              <Badge variant="outline" className="!h-5 !px-2 !text-[10px]">
                Design v2
              </Badge>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-1 text-sm">
            <a
              href="#color"
              className="px-3 py-1.5 rounded-md hover:bg-beige-25 text-muted-foreground hover:text-foreground transition-colors"
            >
              컬러
            </a>
            <a
              href="#type"
              className="px-3 py-1.5 rounded-md hover:bg-beige-25 text-muted-foreground hover:text-foreground transition-colors"
            >
              타이포
            </a>
            <a
              href="#components"
              className="px-3 py-1.5 rounded-md hover:bg-beige-25 text-muted-foreground hover:text-foreground transition-colors"
            >
              컴포넌트
            </a>
            <a
              href="#spacing"
              className="px-3 py-1.5 rounded-md hover:bg-beige-25 text-muted-foreground hover:text-foreground transition-colors"
            >
              스페이싱
            </a>
            <a
              href="#prd"
              className="px-3 py-1.5 rounded-md hover:bg-beige-25 text-muted-foreground hover:text-foreground transition-colors"
            >
              PRD 미리보기
            </a>
          </nav>
        </div>
      </header>

      {/* ─── Hero ────────────────────────────────────────────────── */}
      <section className="max-w-[1200px] mx-auto px-6 pt-20 pb-12">
        <div className="grid md:grid-cols-12 gap-8 items-end">
          <div className="md:col-span-8">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-forest mb-5 flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-lime inline-block animate-pulse" />
              디자인 시스템 v2 · Forest + Lime
            </div>
            <h1 className="text-[44px] md:text-[56px] leading-[1.04] font-bold tracking-tight text-foreground">
              실력이 아니라
              <br />
              <span className="relative inline-block">
                <span className="relative z-10">시스템</span>
                <span className="absolute inset-x-0 bottom-1 h-3.5 bg-lime/70 -z-0" />
              </span>
              으로 운영합니다.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
              버디민턴 v2 의 시각 언어. 짙은 숲 그린과 셔틀콕 라임이 만나는 한 장.
              따뜻한 종이 위에 또렷한 잉크, 한국어 우선 인터페이스.
            </p>
            <div className="mt-8 flex items-center gap-3">
              <Button variant="accent" size="lg">
                토큰 둘러보기 <ArrowRight />
              </Button>
              <Button variant="ghost" size="lg">
                컴포넌트로 이동
              </Button>
            </div>
          </div>

          <div className="md:col-span-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-forest p-6 shadow-lg">
              <div
                className="absolute inset-0 opacity-[0.22]"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 20% 10%, #a5e119 0%, transparent 42%), radial-gradient(circle at 82% 82%, #7ed353 0%, transparent 55%)",
                }}
              />
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    "linear-gradient(transparent 95%, rgba(255,255,255,0.06) 95%), linear-gradient(90deg, transparent 95%, rgba(255,255,255,0.06) 95%)",
                  backgroundSize: "24px 24px",
                }}
              />
              <div className="relative h-full flex flex-col justify-between">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-lime">
                    Forest · Lime
                  </div>
                  <div className="mt-3 text-beige text-2xl font-bold leading-tight">
                    #003A0B
                    <br />
                    <span className="text-lime">#A5E119</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-[11px] text-beige/60 font-mono">v2.0 · 2026-05</div>
                  <div className="size-10 rounded-full bg-lime grid place-items-center">
                    <span className="text-forest font-black text-lg">B</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-[1200px] mx-auto px-6">
        {/* ─── 컬러 ──────────────────────────────────────────────── */}
        <Section
          id="color"
          eyebrow="01 · Color"
          title="숲과 셔틀콕, 그리고 종이"
          description="Forest 는 권위·신뢰의 베이스. Lime 은 셔틀콕이 코트에 떨어지는 결정적 한 순간 — CTA·LIVE 에서만 등장. Beige paper 가 모든 화면의 호흡을 만든다."
        >
          {/* Greens */}
          <div className="mb-10">
            <div className="flex items-baseline justify-between mb-4">
              <h3 className="text-lg font-semibold">Greens — 메인 톤</h3>
              <span className="text-xs text-muted-foreground font-mono">--color-{"{forest,moss,olive,grass,lime,zest,mint}"}</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-3">
              <Swatch name="Forest" varName="forest" hex="#003A0B" className="bg-forest" textOnDark />
              <Swatch name="Moss"   varName="moss"   hex="#1F3A1A" className="bg-moss" textOnDark />
              <Swatch name="Olive"  varName="olive"  hex="#777733" className="bg-olive" textOnDark />
              <Swatch name="Grass"  varName="grass"  hex="#7ED353" className="bg-grass" />
              <Swatch name="Lime"   varName="lime"   hex="#A5E119" className="bg-lime" />
              <Swatch name="Zest"   varName="zest"   hex="#E2F192" className="bg-zest" />
              <Swatch name="Mint"   varName="mint"   hex="#DAF5CB" className="bg-mint" />
            </div>
          </div>

          {/* Cool */}
          <div className="mb-10">
            <div className="flex items-baseline justify-between mb-4">
              <h3 className="text-lg font-semibold">Cool — 보조 한기</h3>
              <span className="text-xs text-muted-foreground font-mono">--color-{"{sea,lake,sky}"}</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Swatch name="Sea"  varName="sea"  hex="#193A37" className="bg-sea" textOnDark />
              <Swatch name="Lake" varName="lake" hex="#8CB1AD" className="bg-lake" />
              <Swatch name="Sky"  varName="sky"  hex="#CEE7E8" className="bg-sky" />
            </div>
          </div>

          {/* Warm */}
          <div className="mb-10">
            <div className="flex items-baseline justify-between mb-4">
              <h3 className="text-lg font-semibold">Warm — 감정 강조</h3>
              <span className="text-xs text-muted-foreground font-mono">--color-{"{coral,orchid,violet,red-600}"}</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Swatch name="Coral"   varName="coral"   hex="#E07849" className="bg-coral" textOnDark />
              <Swatch name="Orchid"  varName="orchid"  hex="#CF3AA3" className="bg-orchid" textOnDark />
              <Swatch name="Violet"  varName="violet"  hex="#DCCAEB" className="bg-violet" />
              <Swatch name="Red 600" varName="red-600" hex="#D63831" className="bg-red-600" textOnDark />
            </div>
          </div>

          {/* Beige */}
          <div className="mb-10">
            <div className="flex items-baseline justify-between mb-4">
              <h3 className="text-lg font-semibold">Beige — 종이 베이스</h3>
              <span className="text-xs text-muted-foreground font-mono">--color-beige{"{,-25,-50,-75,-100}"}</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <Swatch name="Beige"     varName="beige"     hex="#FBFAF4" className="bg-beige border-2" />
              <Swatch name="Beige 25"  varName="beige-25"  hex="#F6F3E7" className="bg-beige-25" />
              <Swatch name="Beige 50"  varName="beige-50"  hex="#EEE7D8" className="bg-beige-50" />
              <Swatch name="Beige 75"  varName="beige-75"  hex="#D6CDB3" className="bg-beige-75" />
              <Swatch name="Beige 100" varName="beige-100" hex="#BEAC7D" className="bg-beige-100" textOnDark />
            </div>
          </div>

          {/* Gray */}
          <div>
            <div className="flex items-baseline justify-between mb-4">
              <h3 className="text-lg font-semibold">Gray — 미세 청록 기 neutral</h3>
              <span className="text-xs text-muted-foreground font-mono">--color-gray-{"{50-900}"}</span>
            </div>
            <div className="grid grid-cols-4 md:grid-cols-7 gap-3">
              <Swatch name="50"  varName="gray-50"  hex="#F9FAF9" className="bg-gray-50" />
              <Swatch name="100" varName="gray-100" hex="#F1F3F3" className="bg-gray-100" />
              <Swatch name="400" varName="gray-400" hex="#7C9AA5" className="bg-gray-400" textOnDark />
              <Swatch name="500" varName="gray-500" hex="#5C6E7C" className="bg-gray-500" textOnDark />
              <Swatch name="600" varName="gray-600" hex="#3B4F5E" className="bg-gray-600" textOnDark />
              <Swatch name="700" varName="gray-700" hex="#293C4C" className="bg-gray-700" textOnDark />
              <Swatch name="900" varName="gray-900" hex="#000919" className="bg-gray-900" textOnDark />
            </div>
          </div>
        </Section>

        {/* ─── 타이포그래피 ──────────────────────────────────────── */}
        <Section
          id="type"
          eyebrow="02 · Typography"
          title="Pretendard Variable"
          description="한국어와 라틴 알파벳, 숫자가 균형 있게 호흡하는 가변 폰트. tabular-nums 가 통계 페이지의 신뢰감을 만든다."
        >
          <Card className="p-10">
            <div className="space-y-8">
              <div className="grid grid-cols-[120px_1fr] gap-6 items-baseline pb-6 border-b border-border/60">
                <div className="text-xs text-muted-foreground font-mono">
                  H1 · 40/48
                  <br />
                  <span className="text-gray-400">w700</span>
                </div>
                <h1 className="text-[40px] leading-[1.2] font-bold tracking-tight">
                  실력이 아니라 시스템으로 운영합니다
                </h1>
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-6 items-baseline pb-6 border-b border-border/60">
                <div className="text-xs text-muted-foreground font-mono">
                  H2 · 30/38
                  <br />
                  <span className="text-gray-400">w700</span>
                </div>
                <h2 className="text-3xl leading-[1.25] font-bold tracking-tight">
                  오늘 저녁 7시, 강남클럽 13명 출석
                </h2>
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-6 items-baseline pb-6 border-b border-border/60">
                <div className="text-xs text-muted-foreground font-mono">
                  H3 · 22/30
                  <br />
                  <span className="text-gray-400">w600</span>
                </div>
                <h3 className="text-[22px] leading-[1.35] font-semibold tracking-tight">
                  코트 2 · 박지원·김민서 vs 이서연·정태훈
                </h3>
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-6 items-baseline pb-6 border-b border-border/60">
                <div className="text-xs text-muted-foreground font-mono">
                  Body · 16/26
                  <br />
                  <span className="text-gray-400">w400</span>
                </div>
                <p className="text-base leading-[1.65] text-foreground max-w-prose">
                  버디민턴은 한국 배드민턴 동호회를 위한 운영 SaaS 입니다.
                  매주 반복되는 코트 배정·점수 기록·레이팅 계산을 자동화하고,
                  운영진이 사람을 챙기는 본질에만 집중할 수 있도록 돕습니다.
                </p>
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-6 items-baseline pb-6 border-b border-border/60">
                <div className="text-xs text-muted-foreground font-mono">
                  Small · 14/22
                  <br />
                  <span className="text-gray-400">w400</span>
                </div>
                <p className="text-sm leading-[1.6] text-muted-foreground max-w-prose">
                  보조 설명, 폼 헬프 텍스트, 메타데이터에 사용. 톤은 차분하게.
                </p>
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-6 items-baseline pb-6 border-b border-border/60">
                <div className="text-xs text-muted-foreground font-mono">
                  Caption · 12/18
                  <br />
                  <span className="text-gray-400">w500</span>
                </div>
                <p className="text-xs leading-[1.5] uppercase tracking-[0.08em] text-gray-500 font-medium">
                  Updated 2026-05-14 · v2.0
                </p>
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-6 items-baseline">
                <div className="text-xs text-muted-foreground font-mono">
                  Numeric
                  <br />
                  <span className="text-gray-400">tabular</span>
                </div>
                <div className="flex items-baseline gap-8 flex-wrap">
                  <div>
                    <div className="text-5xl font-bold tabular tracking-tight">21 : 17</div>
                    <div className="text-xs text-muted-foreground mt-1.5">최종 스코어</div>
                  </div>
                  <div>
                    <div className="text-5xl font-bold tabular tracking-tight text-forest">1,247</div>
                    <div className="text-xs text-muted-foreground mt-1.5">Rating · Glicko-2</div>
                  </div>
                  <div>
                    <div className="text-5xl font-bold tabular tracking-tight">38</div>
                    <div className="text-xs text-muted-foreground mt-1.5">이번 시즌 경기수</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </Section>

        {/* ─── 컴포넌트: 버튼 ────────────────────────────────────── */}
        <Section
          id="components"
          eyebrow="03 · Components"
          title="버튼"
          description="6개 변형 × 4개 사이즈. lime accent 는 사용자가 한 번에 알아채야 하는 가장 결정적인 한 곳에만 쓴다."
        >
          <Card className="p-10 space-y-10">
            {/* Variants */}
            <div>
              <div className="text-xs text-muted-foreground font-mono uppercase tracking-widest mb-4">
                Variants (size=md)
              </div>
              <div className="flex flex-wrap gap-3 items-center">
                <Button variant="primary">Primary</Button>
                <Button variant="accent">셔틀콕 Accent</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
              </div>
            </div>
            {/* Sizes */}
            <div>
              <div className="text-xs text-muted-foreground font-mono uppercase tracking-widest mb-4">
                Sizes (variant=primary)
              </div>
              <div className="flex flex-wrap gap-3 items-center">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
                <Button size="icon" aria-label="추가"><Plus /></Button>
              </div>
            </div>
            {/* With icons */}
            <div>
              <div className="text-xs text-muted-foreground font-mono uppercase tracking-widest mb-4">
                With Icons
              </div>
              <div className="flex flex-wrap gap-3 items-center">
                <Button variant="accent" size="lg">
                  세션 시작 <ArrowRight />
                </Button>
                <Button variant="primary">
                  <Calendar /> 일정 추가
                </Button>
                <Button variant="outline">
                  <Search /> 클럽 검색
                </Button>
                <Button variant="ghost" disabled>
                  비활성 상태
                </Button>
              </div>
            </div>
          </Card>
        </Section>

        {/* ─── 컴포넌트: 카드 ────────────────────────────────────── */}
        <Section
          id="cards"
          eyebrow="03 · Components"
          title="카드"
          description="4 가지 표면. 일반 / 인터랙티브 / 강조 / 다크. hover 모션은 0.5px만 — 절제된 반응."
        >
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            <Card>
              <CardHeader>
                <Badge variant="secondary" className="w-fit mb-2">기본</Badge>
                <CardTitle>일반 카드</CardTitle>
                <CardDescription>
                  정보 표시용 기본 표면. hover 반응 없음.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  설정 페이지·상세 페이지처럼 정적 정보를 담을 때 사용합니다.
                </p>
              </CardContent>
            </Card>

            <Card variant="interactive">
              <CardHeader>
                <Badge variant="accent" className="w-fit mb-2">Interactive</Badge>
                <CardTitle>인터랙티브 카드</CardTitle>
                <CardDescription>
                  hover 시 0.5px 떠오릅니다. 링크 카드 전용.
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <span className="text-sm font-medium text-foreground inline-flex items-center gap-1">
                  자세히 <ChevronRight className="size-4" />
                </span>
              </CardFooter>
            </Card>

            <Card variant="filled">
              <CardHeader>
                <Badge variant="outline" className="w-fit mb-2">Filled</Badge>
                <CardTitle>강조 카드</CardTitle>
                <CardDescription>
                  beige-25 따뜻한 톤. 추천·노트·인용 섹션에 적합.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm italic">
                  &ldquo;운영진이 사람을 챙기는 일에만 집중하게.&rdquo;
                </p>
              </CardContent>
            </Card>

            <Card variant="dark">
              <CardHeader>
                <Badge variant="accent" className="w-fit mb-2">Dark</Badge>
                <CardTitle className="text-beige">다크 카드</CardTitle>
                <CardDescription className="text-beige/60">
                  Forest 톤. 게임보드·관리자·하이라이트 섹션.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold tabular text-lime">
                  21 : 17
                </div>
                <div className="text-xs text-beige/50 mt-1.5">최종 스코어</div>
              </CardContent>
            </Card>
          </div>
        </Section>

        {/* ─── 컴포넌트: Input + Badge ─────────────────────────── */}
        <Section
          id="forms"
          eyebrow="03 · Components"
          title="입력 & 배지"
          description="폼은 40px 높이로 터치 친화. 배지는 11 가지 의미 톤 — 새 팔레트의 풍부함을 활용."
        >
          <div className="grid md:grid-cols-2 gap-5">
            <Card className="p-8">
              <div className="text-xs text-muted-foreground font-mono uppercase tracking-widest mb-5">
                Input
              </div>
              <div className="space-y-4 max-w-sm">
                <div>
                  <label className="block text-sm font-medium mb-1.5">클럽명</label>
                  <Input placeholder="예: 강남 셔틀러즈" defaultValue="강남 셔틀러즈" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">이메일</label>
                  <Input type="email" placeholder="you@example.com" />
                  <p className="text-xs text-muted-foreground mt-1.5">
                    초대 발송용. 가입 후 변경 가능합니다.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">검색</label>
                  <Input placeholder="멤버 이름·전화번호" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-muted-foreground">
                    비활성 필드
                  </label>
                  <Input disabled defaultValue="잠긴 값" />
                </div>
              </div>
            </Card>

            <Card className="p-8">
              <div className="text-xs text-muted-foreground font-mono uppercase tracking-widest mb-5">
                Badge
              </div>
              <div className="space-y-5">
                <div>
                  <div className="text-xs text-muted-foreground mb-2.5">기본 변형</div>
                  <div className="flex flex-wrap gap-2">
                    <Badge>운영진</Badge>
                    <Badge variant="secondary">멤버</Badge>
                    <Badge variant="accent">LIVE</Badge>
                    <Badge variant="outline">초대 대기</Badge>
                    <Badge variant="success">출석 완료</Badge>
                    <Badge variant="warning">대기 8명</Badge>
                    <Badge variant="danger">결제 실패</Badge>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-2.5">팔레트 변형</div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="lime">신규</Badge>
                    <Badge variant="olive">시즌 2</Badge>
                    <Badge variant="coral">이벤트</Badge>
                    <Badge variant="sky">안내</Badge>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-2.5">실제 사용 예</div>
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2.5">
                      <Badge variant="accent">LIVE</Badge>
                      <span className="text-sm">코트 2 — 매치 진행 중</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Badge variant="success">출석 완료</Badge>
                      <span className="text-sm">박지원 · 19:23 체크인</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Badge variant="warning">대기 8명</Badge>
                      <span className="text-sm">코트 부족 — 다음 라운드</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Badge variant="coral">이벤트</Badge>
                      <span className="text-sm">5월 월말 토너먼트 모집</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </Section>

        {/* ─── Spacing ─────────────────────────────────────────── */}
        <Section
          id="spacing"
          eyebrow="04 · Spacing"
          title="스페이싱 토큰"
          description="모든 간격은 0.25rem (4px) 의 배수. 섹션 간 80px (3xl) 이 기본 호흡."
        >
          <Card className="p-8">
            <SpacingBar token="xs"  rem="0.5rem"  px={8}  widthClass="w-2" />
            <SpacingBar token="sm"  rem="0.75rem" px={12} widthClass="w-3" />
            <SpacingBar token="md"  rem="1rem"    px={16} widthClass="w-4" />
            <SpacingBar token="lg"  rem="1.5rem"  px={24} widthClass="w-6" />
            <SpacingBar token="xl"  rem="2rem"    px={32} widthClass="w-8" />
            <SpacingBar token="2xl" rem="3rem"    px={48} widthClass="w-12" />
            <SpacingBar token="3xl" rem="5rem"    px={80} widthClass="w-20" />
          </Card>

          <div className="mt-8 grid md:grid-cols-2 gap-5">
            <Card className="p-8">
              <div className="text-xs text-muted-foreground font-mono uppercase tracking-widest mb-4">
                Border Radius
              </div>
              <div className="grid grid-cols-4 gap-4">
                {[
                  { name: "sm", val: "8" },
                  { name: "md", val: "12" },
                  { name: "lg", val: "16" },
                  { name: "xl", val: "20" },
                ].map((r) => (
                  <div key={r.name} className="text-center">
                    <div
                      className="aspect-square bg-forest mb-2"
                      style={{ borderRadius: `${r.val}px` }}
                    />
                    <div className="text-sm font-semibold">{r.name}</div>
                    <div className="text-[11px] text-muted-foreground font-mono tabular">
                      {r.val}px
                    </div>
                  </div>
                ))}
              </div>
            </Card>
            <Card className="p-8">
              <div className="text-xs text-muted-foreground font-mono uppercase tracking-widest mb-4">
                Shadow
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { name: "sm", cls: "shadow-sm" },
                  { name: "md", cls: "shadow-md" },
                  { name: "lg", cls: "shadow-lg" },
                ].map((s) => (
                  <div key={s.name} className="text-center">
                    <div
                      className={`aspect-square bg-beige border border-border/40 rounded-xl mb-3 ${s.cls}`}
                    />
                    <div className="text-sm font-semibold">{s.name}</div>
                    <div className="text-[11px] text-muted-foreground font-mono">
                      --shadow-{s.name}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </Section>

        {/* ─── PRD 미리보기 ────────────────────────────────────── */}
        <Section
          id="prd"
          eyebrow="05 · In the wild"
          title="PRD 페이지 미리보기"
          description="토큰이 실제 화면에서 어떻게 살아나는지. 홈 대시보드 · 클럽 카드 · 게임보드 코트 · 결과 입력 패널 4 장면."
        >
          {/* Scene 1: Home dashboard hero card */}
          <div className="mb-10">
            <div className="text-xs text-muted-foreground font-mono uppercase tracking-widest mb-3">
              Scene 01 · 홈 대시보드 — 운영진 first view
            </div>
            <Card className="p-0 overflow-hidden">
              <div className="grid md:grid-cols-[1fr_auto] gap-0">
                <div className="p-8">
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="accent">LIVE</Badge>
                    <span className="text-xs text-muted-foreground">
                      지금 진행 중 · 오늘 19:00 시작
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight mb-2">
                    수요 정기 모임 · 강남 셔틀러즈
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6 flex-wrap">
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="size-4" /> 강남 스포츠센터 B관
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="size-4" /> 19:00–22:00
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Users className="size-4" /> 13 / 16
                    </span>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <Button variant="accent" size="lg">
                      게임보드 열기 <ArrowRight />
                    </Button>
                    <Button variant="outline" size="lg">
                      출석 체크
                    </Button>
                  </div>
                </div>
                <div className="bg-forest p-8 grid grid-cols-2 gap-x-8 gap-y-4 md:min-w-[260px]">
                  <div>
                    <div className="text-[11px] text-beige/50 uppercase tracking-widest">완료</div>
                    <div className="text-3xl font-bold tabular text-beige">8</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-beige/50 uppercase tracking-widest">진행</div>
                    <div className="text-3xl font-bold tabular text-lime">2</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-beige/50 uppercase tracking-widest">대기</div>
                    <div className="text-3xl font-bold tabular text-beige">8</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-beige/50 uppercase tracking-widest">코트</div>
                    <div className="text-3xl font-bold tabular text-beige">3</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Scene 2 + 3 side by side */}
          <div className="grid lg:grid-cols-2 gap-8 mb-10">
            {/* Club card */}
            <div>
              <div className="text-xs text-muted-foreground font-mono uppercase tracking-widest mb-3">
                Scene 02 · 클럽 카드 (PRD §2.2)
              </div>
              <Card variant="interactive">
                <div className="aspect-[16/7] bg-forest relative overflow-hidden">
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage:
                        "radial-gradient(circle at 78% 28%, rgba(165,225,25,0.35) 0%, transparent 48%), radial-gradient(circle at 20% 80%, rgba(126,211,83,0.18) 0%, transparent 55%)",
                    }}
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage:
                        "linear-gradient(transparent 96%, rgba(255,255,255,0.05) 96%), linear-gradient(90deg, transparent 96%, rgba(255,255,255,0.05) 96%)",
                      backgroundSize: "28px 28px",
                    }}
                  />
                  <div className="absolute top-4 right-4">
                    <Badge variant="accent">모집 중</Badge>
                  </div>
                </div>
                <CardHeader className="pb-2">
                  <CardTitle>강남 셔틀러즈</CardTitle>
                  <CardDescription>
                    매주 수요일 19:00 · 강남 스포츠센터 · 중급 이상
                  </CardDescription>
                </CardHeader>
                <CardFooter className="border-t-0 pt-2 flex-wrap gap-3">
                  <div className="flex items-center gap-1.5 text-sm">
                    <Users className="size-4 text-muted-foreground" />
                    <span className="tabular font-semibold">42</span>
                    <span className="text-muted-foreground">명</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm">
                    <Trophy className="size-4 text-muted-foreground" />
                    <span className="tabular font-semibold">1,247</span>
                    <span className="text-muted-foreground">평균</span>
                  </div>
                  <div className="ml-auto">
                    <Button variant="ghost" size="sm">
                      자세히 <ChevronRight />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </div>

            {/* Court card */}
            <div>
              <div className="text-xs text-muted-foreground font-mono uppercase tracking-widest mb-3">
                Scene 03 · 게임보드 코트 (PRD §3.3 영감)
              </div>
              <Card variant="dark" className="p-0">
                <div className="p-5 border-b border-moss flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="accent">LIVE</Badge>
                    <span className="text-beige font-semibold">코트 2</span>
                  </div>
                  <div className="text-xs text-beige/50 font-mono tabular">
                    08 : 42 경과
                  </div>
                </div>
                <div className="p-6 grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
                  {/* Team A */}
                  <div className="text-right">
                    <div className="text-[11px] text-beige/50 uppercase tracking-widest mb-1">
                      Team A
                    </div>
                    <div className="text-beige font-semibold">박지원</div>
                    <div className="text-beige/70 text-sm">김민서</div>
                    <div className="text-lime text-xs tabular mt-1">avg 1,310</div>
                  </div>
                  <div className="text-center">
                    <div className="text-5xl font-bold tabular text-beige leading-none">
                      14
                      <span className="text-beige/30 mx-2 text-3xl">:</span>
                      11
                    </div>
                    <div className="text-[10px] text-beige/40 uppercase tracking-widest mt-2">
                      1st game
                    </div>
                  </div>
                  {/* Team B */}
                  <div className="text-left">
                    <div className="text-[11px] text-beige/50 uppercase tracking-widest mb-1">
                      Team B
                    </div>
                    <div className="text-beige font-semibold">이서연</div>
                    <div className="text-beige/70 text-sm">정태훈</div>
                    <div className="text-lime text-xs tabular mt-1">avg 1,285</div>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Scene 4: result entry */}
          <div>
            <div className="text-xs text-muted-foreground font-mono uppercase tracking-widest mb-3">
              Scene 04 · 매치 종료 (PRD §3.3) — 3-way 결과 입력
            </div>
            <Card variant="dark" className="p-0">
              <div className="p-5 border-b border-moss flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-beige font-semibold">코트 2 · 매치 종료</span>
                  <span className="text-xs text-beige/40 font-mono">결과를 선택하세요</span>
                </div>
                <span className="text-xs text-beige/50 font-mono tabular">23:14 경과</span>
              </div>
              <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button className="group bg-moss hover:bg-lime transition-colors duration-200 rounded-xl p-5 text-left border border-moss hover:border-lime">
                  <div className="text-[11px] uppercase tracking-widest text-beige/50 group-hover:text-forest/60 mb-2">
                    Result
                  </div>
                  <div className="text-beige group-hover:text-forest text-lg font-bold mb-1">
                    A팀 승
                  </div>
                  <div className="text-beige/60 group-hover:text-forest/70 text-sm">
                    박지원·김민서
                  </div>
                </button>
                <button className="group bg-moss hover:bg-sea transition-colors duration-200 rounded-xl p-5 text-left border border-moss hover:border-sea">
                  <div className="text-[11px] uppercase tracking-widest text-beige/50 mb-2">
                    Result
                  </div>
                  <div className="text-beige text-lg font-bold mb-1">무승부</div>
                  <div className="text-beige/60 text-sm">시간 종료 / 합의</div>
                </button>
                <button className="group bg-moss hover:bg-lime transition-colors duration-200 rounded-xl p-5 text-left border border-moss hover:border-lime">
                  <div className="text-[11px] uppercase tracking-widest text-beige/50 group-hover:text-forest/60 mb-2">
                    Result
                  </div>
                  <div className="text-beige group-hover:text-forest text-lg font-bold mb-1">
                    B팀 승
                  </div>
                  <div className="text-beige/60 group-hover:text-forest/70 text-sm">
                    이서연·정태훈
                  </div>
                </button>
              </div>
              <div className="px-6 pb-6 pt-1 flex items-center gap-2 text-xs text-beige/50">
                <span className="size-1.5 rounded-full bg-lime inline-block" />
                선택 즉시 Glicko-2 레이팅이 계산됩니다 · 실수하면 5 분 내 되돌리기 가능
              </div>
            </Card>
          </div>
        </Section>

        {/* ─── Footer ──────────────────────────────────────────── */}
        <footer className="py-12 border-t border-border/60 mt-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="font-bold tracking-tight">버디민턴 디자인 시스템 v2</div>
              <div className="text-xs text-muted-foreground mt-1">
                Forest + Lime · 라이트 모드 · 2026-05-14
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="ghost" size="sm">홈으로</Button>
              </Link>
              <Button variant="outline" size="sm">
                Figma 내보내기 <ArrowRight />
              </Button>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
