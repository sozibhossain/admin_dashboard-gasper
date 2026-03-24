import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type AuthShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  className?: string;
};

export function AuthShell({ title, subtitle, children, className }: AuthShellProps) {
  return (
    <section className={cn("w-full max-w-[520px]", className)}>
      <h1 className="text-[36px] font-bold leading-[120%] text-[#1f73e8] md:text-[48px]">{title}</h1>
      <p className="mt-2 text-[16px] font-normal leading-[150%] text-[#646b77]">{subtitle}</p>
      <div className="mt-8 space-y-5">{children}</div>
    </section>
  );
}
