/**
 * /club/[clubId]/gameboard/[sessionId] 로딩 스켈레톤
 *
 * 세션 상태(open/in_progress/closed)에 관계없이 공통 헤더 + 본문 윤곽만 표시.
 * 실제 페이지가 로드되면 분기별 UI 가 그려진다.
 */
export default function GameboardSessionLoading() {
  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#f8f8f8]">
      {/* 헤더 */}
      <div className="bg-white border-b border-[#e5e5e5]">
        <div className="max-w-[1280px] mx-auto px-4 py-3 flex items-center justify-between h-14">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 bg-[#f0f0f0] rounded animate-pulse" />
            <div className="w-14 h-4 bg-[#f0f0f0] rounded-full animate-pulse" />
          </div>
          <div className="w-20 h-4 bg-[#f0f0f0] rounded-full animate-pulse" />
          <div className="w-16 h-4 bg-[#f0f0f0] rounded-full animate-pulse" />
        </div>
      </div>

      {/* 본문 */}
      <div className="max-w-[1280px] mx-auto px-4 py-5 space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] gap-5">
          {/* LEFT */}
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-white border border-[#e5e5e5] rounded-2xl p-4 h-[100px] animate-pulse"
              />
            ))}
          </div>
          {/* RIGHT */}
          <div className="space-y-3">
            <div className="h-3 w-20 bg-[#f0f0f0] rounded-full animate-pulse" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white border border-[#e5e5e5] rounded-xl h-[52px] animate-pulse"
                />
              ))}
            </div>
          </div>
        </div>

        {/* 액션 */}
        <div className="h-14 bg-[#f0f0f0] rounded-2xl animate-pulse" />
      </div>
    </div>
  )
}
