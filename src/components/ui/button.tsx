import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Button — 버디민턴 디자인 시스템 v2 (Forest + Lime)
 *
 * Variants:
 *  - primary    : forest #003a0b — 가장 무거운 액션
 *  - accent     : lime #a5e119 — 단 하나의 결정적 CTA ("지금 시작" 류)
 *  - secondary  : beige-25 — 카드 위의 보조 액션
 *  - ghost      : 텍스트만, 거의 안 보이는 액션
 *  - outline    : 보더 강조, 위험하지 않은 보조
 *  - destructive: 삭제/취소
 *
 * Sizes: sm / md / lg / icon
 */
const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "font-medium select-none",
    "transition-[background,color,box-shadow,transform]",
    "duration-[var(--duration-base)] ease-[var(--ease-out-soft)]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:opacity-50 disabled:pointer-events-none",
    "[&_svg]:size-4 [&_svg]:shrink-0",
    "active:translate-y-[0.5px]",
  ].join(" "),
  {
    variants: {
      variant: {
        primary:
          "bg-forest text-beige shadow-sm hover:bg-moss active:bg-sea",
        accent:
          "bg-lime text-forest shadow-sm hover:bg-zest active:bg-grass focus-visible:ring-forest",
        secondary:
          "bg-secondary text-secondary-foreground border border-beige-50 hover:bg-beige-50",
        ghost:
          "text-foreground hover:bg-beige-25",
        outline:
          "border border-beige-75 bg-background text-foreground hover:bg-beige-25 hover:border-forest/40",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:opacity-90",
      },
      size: {
        sm:   "h-8 px-3 text-[13px] rounded-md",
        md:   "h-10 px-4 text-sm rounded-lg",
        lg:   "h-12 px-6 text-[15px] rounded-lg",
        icon: "size-10 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
);
Button.displayName = "Button";

export { buttonVariants };
