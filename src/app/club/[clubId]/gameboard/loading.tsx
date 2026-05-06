/**
 * /club/[clubId]/gameboard 목록 로딩 스켈레톤
 */
export default function GameboardListLoading() {
  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#f8f8f8]">
      {/* 헤더 */}
      <div className="bg-white border-b border-[#e5e5e5]">
        <div className="max-w-[1280px] mx-auto px-4 py-3 flex items-center justify-between h-14">
          <div className="w-16 h-4 bg-[#f0f0f0] rounded-full animate-pulse" />
          <div className="w-20 h-4 bg-[#f0f0f0] rounded-full animate-pulse" />
          <div className="w-16" />
        </div>
      </div>

      {/* 목록 스켈레톤 */}
      <div className="max-w-[1280px] mx-auto px-4 py-5 space-y-5">
        {/* 버튼 */}
        <div className="flex justify-end">
          <div className="w-full sm:w-36 h-10 bg-[#f0f0f0] rounded-xl animate-pulse" />
        </div>

        {/* 섹션 */}
        {[...Array(2)].map((_, si) => (
          <div key={si}>
            <div className="w-28 h-3 bg-[#f0f0f0] rounded-full animate-pulse mb-3" />
            <div className="space-y-2.5">
              {[...Array(si === 0 ? 1 : 2)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white border border-[var(--color-brand-border)] rounded-xl p-4 h-20 animate-pulse"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
