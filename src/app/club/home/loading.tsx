/**
 * /club/home 로딩 스켈레톤
 * SaaSShell이 헤더·사이드바를 담당하므로 본문 영역만 스켈레톤으로 표시.
 */
export default function HomeLoading() {
  return (
    <div className="max-w-[1088px] mx-auto px-4 py-6 space-y-6">
      {/* 상단 바 (제목 + 액션) */}
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-6 w-24 bg-[#f0f0f0] rounded-full animate-pulse" />
          <div className="h-3 w-48 bg-[#f0f0f0] rounded-full animate-pulse" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-20 bg-[#f0f0f0] rounded-xl animate-pulse" />
          <div className="h-9 w-28 bg-[#f0f0f0] rounded-xl animate-pulse" />
        </div>
      </div>

      {/* 검색 */}
      <div className="h-11 bg-[#f0f0f0] rounded-xl animate-pulse" />

      {/* 탭 */}
      <div className="flex gap-4 border-b border-[#f0f0f0] pb-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-4 w-16 bg-[#f0f0f0] rounded-full animate-pulse" />
        ))}
      </div>

      {/* 카드 그리드 */}
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
        {[280, 220, 260, 240, 300, 220].map((h, i) => (
          <div
            key={i}
            className="mb-4 bg-white rounded-2xl border border-[#f0f0f0] animate-pulse break-inside-avoid"
            style={{ height: h }}
          />
        ))}
      </div>
    </div>
  )
}
