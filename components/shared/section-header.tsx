import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SectionHeaderProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export function SectionHeader({ title, description, action, className }: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-b border-[#d8dde6] pb-4 md:flex-row md:items-center md:justify-between",
        className
      )}
    >
      <div>
        <h1 className="text-[28px] font-semibold leading-[150%] text-[#0c0c0c]">{title}</h1>
        {description ? <p className="mt-1 text-[16px] font-normal leading-[150%] text-[#6d7681]">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
