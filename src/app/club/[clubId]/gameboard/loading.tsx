/**
 * /club/[clubId]/gameboard 로딩 스켈레톤
 * 레이아웃 auth 완료 후 SetupPhase 데이터 로딩 중 즉시 표시
 */
export default function GameboardLoading() {
  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#f8f8f8]">
      {/* 헤더 */}
      <div className="bg-white border-b border-[#e5e5e5]">
        <div className="max-w-[1088px] mx-auto px-4 py-3 flex items-center justify-between h-14">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 bg-[#f0f0f0] rounded animate-pulse" />
            <div className="w-10 h-4 bg-[#f0f0f0] rounded-full animate-pulse" />
          </div>
          <div className="w-20 h-4 bg-[#f0f0f0] rounded-full animate-pulse" />
          <div className="w-16" />
        </div>
      </div>

      {/* 게임 설정 스켈레톤 */}
      <div className="max-w-[1088px] mx-auto px-4 py-5 space-y-5">
        {/* 날짜 */}
        <div>
          <div className="h-3 w-16 bg-[#f0f0f0] rounded-full animate-pulse mb-2" />
          <div className="h-12 bg-white border border-[#e5e5e5] rounded-xl animate-pulse" />
        </div>
        {/* 코트 수 */}
        <div>
          <div className="h-3 w-20 bg-[#f0f0f0] rounded-full animate-pulse mb-2" />
          <div className="h-12 bg-white border border-[#e5e5e5] rounded-xl animate-pulse" />
        </div>
        {/* 참가자 방식 */}
        <div>
          <div className="h-3 w-24 bg-[#f0f0f0] rounded-full animate-pulse mb-2" />
          <div className="flex gap-2">
            <div className="flex-1 h-11 bg-white border border-[#e5e5e5] rounded-xl animate-pulse" />
            <div className="flex-1 h-11 bg-white border border-[#e5e5e5] rounded-xl animate-pulse" />
          </div>
        </div>
        {/* 멤버 그리드 */}
        <div>
          <div className="h-3 w-20 bg-[#f0f0f0] rounded-full animate-pulse mb-2" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-11 bg-white border border-[#e5e5e5] rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
        {/* 시작 버튼 */}
        <div className="h-14 bg-[#f0f0f0] rounded-2xl animate-pulse" />
      </div>
    </div>
  )
}
