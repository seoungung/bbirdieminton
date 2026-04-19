/**
 * /club/[clubId]/view 로딩 스켈레톤
 * 서버 컴포넌트가 DB 쿼리하는 동안 실제 UI 프레임을 즉시 표시
 */
export default function ViewLoading() {
  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      {/* 상단 헤더 스켈레톤 */}
      <div className="sticky top-0 z-30 bg-white">
        <div className="border-b border-[#e5e5e5]">
          <div className="max-w-[1088px] mx-auto flex items-center justify-between px-5 h-14">
            <div className="w-6 h-6 bg-[#f0f0f0] rounded-lg animate-pulse" />
            <div className="w-32 h-4 bg-[#f0f0f0] rounded-full animate-pulse" />
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-[#f0f0f0] rounded-xl animate-pulse" />
              <div className="w-9 h-9 bg-[#f0f0f0] rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
        {/* 탭바 스켈레톤 */}
        <div className="border-b border-[#e5e5e5] flex items-center h-12 px-5 gap-1 overflow-hidden">
          {[52, 40, 64, 64, 40, 40].map((w, i) => (
            <div key={i} className="px-3 shrink-0 py-3.5">
              <div className="h-3 bg-[#f0f0f0] rounded-full animate-pulse" style={{ width: w }} />
            </div>
          ))}
        </div>
      </div>

      {/* 히어로 스켈레톤 */}
      <div className="w-full h-[200px] bg-[#f0f0f0] animate-pulse" />

      {/* 메타 스트립 스켈레톤 */}
      <div className="bg-white border-b border-[#e5e5e5] px-5 py-3 flex items-center gap-3">
        <div className="h-3 w-16 bg-[#f0f0f0] rounded-full animate-pulse" />
        <div className="h-3 w-1 bg-[#f0f0f0] rounded-full animate-pulse" />
        <div className="h-3 w-20 bg-[#f0f0f0] rounded-full animate-pulse" />
        <div className="h-3 w-1 bg-[#f0f0f0] rounded-full animate-pulse" />
        <div className="h-5 w-14 bg-[#f0f0f0] rounded-md animate-pulse" />
      </div>

      {/* 모임명 스켈레톤 */}
      <div className="bg-white border-b border-[#e5e5e5]">
        <div className="max-w-[1088px] mx-auto px-5 pt-4 pb-5">
          <div className="h-7 w-44 bg-[#f0f0f0] rounded-lg animate-pulse mb-2" />
          <div className="h-4 w-28 bg-[#f0f0f0] rounded-full animate-pulse" />
        </div>
      </div>

      {/* 콘텐츠 카드 스켈레톤 */}
      <div className="max-w-[1088px] mx-auto px-5 py-5 space-y-3">
        <div className="h-4 w-24 bg-[#f0f0f0] rounded-full animate-pulse" />
        {[100, 80, 100].map((w, i) => (
          <div key={i} className="bg-white rounded-2xl border border-[#e5e5e5] px-5 py-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-[#f0f0f0] rounded-xl animate-pulse shrink-0" />
              <div className="flex-1 space-y-2 pt-0.5">
                <div className="h-4 bg-[#f0f0f0] rounded-full animate-pulse" style={{ width: `${w}%` }} />
                <div className="h-3 w-3/4 bg-[#f0f0f0] rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
