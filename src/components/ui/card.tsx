import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Card — 표면 컴포넌트 (v2 Forest + Lime).
 *  - default     : beige paper, 얇은 보더, 미세한 그림자
 *  - interactive : hover 시 살짝 떠오름 (링크/클릭 가능 카드용)
 *  - filled      : beige-25 톤 — 강조 / 인용 / 노트 섹션
 *  - dark        : forest 톤 (게임보드/관리자/하이라이트)
 */
type CardVariant = "default" | "interactive" | "filled" | "dark";

export const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { variant?: CardVariant }
>(({ className, variant = "default", ...props }, ref) => {
  const variants: Record<CardVariant, string> = {
    default:
      "bg-card text-card-foreground border border-border shadow-sm",
    interactive:
      "bg-card text-card-foreground border border-border shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-forest/30 transition-[transform,box-shadow,border-color] duration-[var(--duration-base)] ease-[var(--ease-out-soft)] cursor-pointer",
    filled:
      "bg-beige-25 text-card-foreground border border-beige-50",
    dark:
      "bg-forest text-beige border border-moss shadow-md",
  };

  return (
    <div
      ref={ref}
      className={cn("rounded-xl overflow-hidden", variants[variant], className)}
      {...props}
    />
  );
});
Card.displayName = "Card";

export const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col gap-1 p-5 pb-3", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-lg font-semibold leading-tight", className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground leading-relaxed", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-5 pt-2", className)} {...props} />
));
CardContent.displayName = "CardContent";

export const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center gap-2 p-5 pt-3 border-t border-border/60", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";
