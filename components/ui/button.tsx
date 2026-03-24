import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-sm text-[16px] font-semibold leading-[150%] transition-colors disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f73e8] focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-[#1f73e8] text-white hover:bg-[#1a63ca]",
        destructive: "border border-[#ff4d4f] text-[#e10000] hover:bg-[#fff5f5]",
        outline: "border border-[#c7d6ea] bg-white text-[#1a1a1a] hover:bg-[#f5f9ff]",
        ghost: "text-[#4a4f57] hover:bg-[#edf3fd]",
        secondary: "bg-[#dcedff] text-[#1f73e8] hover:bg-[#cae4ff]",
      },
      size: {
        default: "h-11 px-4",
        sm: "h-9 px-3 text-[14px]",
        lg: "h-12 px-6",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = "button", ...props }, ref) => {
    return <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} type={type} {...props} />;
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
