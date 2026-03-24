import { cva, type VariantProps } from "class-variance-authority";
import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center justify-center rounded-sm px-3 py-1 text-[16px] font-semibold leading-[150%]", {
  variants: {
    variant: {
      default: "bg-[#d9ecff] text-[#1f73e8]",
      success: "bg-[#c6e4c9] text-[#0d8a22]",
      warning: "bg-[#f8efcc] text-[#c49a00]",
      destructive: "bg-[#f5c7c7] text-[#db2222]",
      neutral: "bg-[#eceef1] text-[#606670]",
      outline: "border border-[#d4deea] bg-white text-[#4f5662]",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
