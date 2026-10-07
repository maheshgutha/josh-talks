import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
  {
    variants: {
      variant: {
        neutral: "border-ink/10 bg-white text-ink-soft",
        saffron: "border-saffron-200 bg-saffron-50 text-saffron-700",
        research: "border-research-200 bg-research-50 text-research-700",
        success: "border-emerald-200 bg-emerald-50 text-emerald-700",
        warning: "border-red-200 bg-red-50 text-red-700",
      },
    },
    defaultVariants: { variant: "neutral" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export const Badge = ({ className, variant, ...props }: BadgeProps) => (
  <span className={cn(badgeVariants({ variant }), className)} {...props} />
);
