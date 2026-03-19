interface QuizStartProps {
  onStart: () => void
}

export function QuizStart({ onStart }: QuizStartProps) {
  return (
    <div className="flex flex-col items-center text-center px-4 py-12 max-w-sm mx-auto">
      <div className="text-6xl mb-6">🏸</div>

      <h1 className="text-[28px] font-extrabold text-white leading-tight tracking-tight mb-3">
        내 배드민턴 레벨은?
      </h1>
      <p className="text-white/60 text-[15px] leading-relaxed mb-8">
        17가지 질문으로 지금 내 실력을 확인해보세요.<br />
        레벨에 맞는 라켓까지 추천해 드릴게요.
      </p>

      <div className="flex gap-6 text-center mb-10">
        <div>
          <p className="text-[22px] font-bold text-[#beff00]">17</p>
          <p className="text-xs text-white/40 mt-0.5">문항</p>
        </div>
        <div className="w-px bg-white/10" />
        <div>
          <p className="text-[22px] font-bold text-[#beff00]">2분</p>
          <p className="text-xs text-white/40 mt-0.5">소요</p>
        </div>
        <div className="w-px bg-white/10" />
        <div>
          <p className="text-[22px] font-bold text-[#beff00]">4개</p>
          <p className="text-xs text-white/40 mt-0.5">레벨</p>
        </div>
      </div>

      <button
        onClick={onStart}
        className="w-full py-4 bg-[#beff00] text-black font-extrabold text-[15px] rounded-2xl hover:brightness-110 active:scale-95 transition-all"
      >
        지금 내 레벨 확인하기 →
      </button>

      <p className="text-xs text-white/30 mt-4">스팸 없음 · 언제든 취소 가능</p>
    </div>
  )
}
