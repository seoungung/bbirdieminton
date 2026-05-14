import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Input — text input primitive (v2 Forest + Lime).
 * - 12px radius, 40px height (touch 친화)
 * - beige paper 표면, focus 시 lime ring + forest border
 */
export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type = "text", ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    className={cn(
      "flex h-10 w-full rounded-lg border border-beige-75 bg-background px-3.5 py-2",
      "text-sm text-foreground placeholder:text-muted-foreground",
      "transition-[border-color,box-shadow] duration-[var(--duration-fast)] ease-[var(--ease-out-soft)]",
      "focus-visible:outline-none focus-visible:border-forest focus-visible:ring-2 focus-visible:ring-lime/30",
      "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted",
      "file:border-0 file:bg-transparent file:text-sm file:font-medium",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";
