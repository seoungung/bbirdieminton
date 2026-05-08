'use client'

interface Props {
  description: string | null
  ownerName: string | null
  activityPlace: string | null
  courtCount: number | null
}

/**
 * 모임 소개 + 운영자/활동 장소/코트 미니 메타.
 * description 은 whitespace-pre-wrap 으로 이모지·줄바꿈 그대로 보존.
 */
export function ClubPreviewAbout({
  description,
  ownerName,
  activityPlace,
  courtCount,
}: Props) {
  const subMeta: { label: string; value: string }[] = []
  if (ownerName) subMeta.push({ label: '운영자', value: ownerName })
  if (activityPlace) subMeta.push({ label: '활동 장소', value: activityPlace })
  if (courtCount != null && courtCount > 0)
    subMeta.push({ label: '코트', value: `${courtCount}면` })

  return (
    <section>
      <h2 className="text-[18px] sm:text-[20px] font-extrabold text-[var(--color-text-strong)] mb-3">
        모임 소개
      </h2>
      {description ? (
        <p className="text-[14px] leading-[1.7] text-[#333] whitespace-pre-wrap break-keep">
          {description}
        </p>
      ) : (
        <p className="text-[14px] leading-[1.7] text-[#bbb]">
          운영자가 모임을 소개하지 않았어요.
        </p>
      )}

      {subMeta.length > 0 && (
        <dl className="mt-5 grid grid-cols-1 gap-y-2 text-[13px] sm:grid-cols-[88px_1fr] sm:gap-y-1.5">
          {subMeta.map((m) => (
            <div
              key={m.label}
              className="flex sm:contents items-baseline gap-2"
            >
              <dt className="text-[#999] font-medium shrink-0 w-[60px] sm:w-auto">
                {m.label}
              </dt>
              <dd className="text-[#333] font-medium break-keep">{m.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  )
}
