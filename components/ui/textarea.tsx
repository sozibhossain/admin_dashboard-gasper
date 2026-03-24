import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "min-h-[112px] w-full rounded-sm border border-[#c9ccd3] bg-white px-3 py-2 text-[16px] text-[#202020] placeholder:text-[#a6abb3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f73e8] focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
