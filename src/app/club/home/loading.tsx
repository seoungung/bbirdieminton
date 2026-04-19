/**
 * /club/home 로딩 스켈레톤
 * 내 모임 목록 페이지 DB 쿼리 중 즉시 표시
 */
export default function HomeLoading() {
  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      {/* 헤더 */}
      <div className="bg-white border-b border-[#e5e5e5]">
        <div className="max-w-[1088px] mx-auto flex items-center justify-between px-5 h-14">
          <div className="w-20 h-5 bg-[#f0f0f0] rounded-full animate-pulse" />
          <div className="w-9 h-9 bg-[#f0f0f0] rounded-xl animate-pulse" />
        </div>
      </div>

      <div className="max-w-[1088px] mx-auto px-4 py-5 space-y-6">
        {/* 내 모임 섹션 */}
        <div className="space-y-3">
          <div className="h-3 w-16 bg-[#f0f0f0] rounded-full animate-pulse" />
          {[1, 2].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-[#e5e5e5] p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#f0f0f0] rounded-xl animate-pulse shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-[#f0f0f0] rounded-full animate-pulse" />
                  <div className="h-3 w-1/2 bg-[#f0f0f0] rounded-full animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 다른 모임 섹션 */}
        <div className="space-y-3">
          <div className="h-3 w-24 bg-[#f0f0f0] rounded-full animate-pulse" />
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-[#e5e5e5] px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#f0f0f0] rounded-lg animate-pulse shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-2/3 bg-[#f0f0f0] rounded-full animate-pulse" />
                  <div className="h-3 w-1/3 bg-[#f0f0f0] rounded-full animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
