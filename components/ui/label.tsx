import * as React from "react";
import { cn } from "@/lib/utils";

const Label = React.forwardRef<HTMLLabelElement, React.ComponentProps<"label">>(
  ({ className, ...props }, ref) => (
    <label ref={ref} className={cn("text-[16px] font-semibold leading-[150%] text-[#0c0c0c]", className)} {...props} />
  )
);

Label.displayName = "Label";

export { Label };
