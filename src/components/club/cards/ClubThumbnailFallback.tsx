import Image from 'next/image'

interface ClubThumbnailFallbackProps {
  /** 로고 크기(픽셀). 기본 64. 카드 카드 사이즈에 따라 조정. */
  logoSize?: number
  /** absolute 포지션으로 부모를 채울지 여부. true 면 inset-0. */
  fill?: boolean
  className?: string
}

/**
 * 썸네일 이미지가 없을 때 노출되는 기본 카드.
 * - 배경: 브랜드 메인 컬러 (`--color-brand-lime`)
 * - 오버레이: 검정 심볼 로고 50% 투명도
 *
 * thumbnail_color 옵션은 더 이상 사용하지 않음 (단일 디자인 톤 유지).
 */
export function ClubThumbnailFallback({
  logoSize = 64,
  fill = true,
  className = '',
}: ClubThumbnailFallbackProps) {
  const positionCls = fill
    ? 'absolute inset-0'
    : 'relative w-full h-full'

  return (
    <div
      className={`${positionCls} flex items-center justify-center select-none ${className}`}
      style={{ background: 'var(--color-brand-lime)' }}
      aria-hidden="true"
    >
      <Image
        src="/symbol_birdieminton-black.png"
        alt=""
        width={logoSize}
        height={logoSize}
        className="opacity-50"
        style={{ width: logoSize, height: 'auto' }}
        aria-hidden="true"
      />
    </div>
  )
}
