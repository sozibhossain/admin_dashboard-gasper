import { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
};

export function EmptyState({ title, description, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-sm border border-dashed border-[#cfdae8] bg-[#f8fbff] px-4 py-16 text-center">
      {icon ? <div className="mb-4">{icon}</div> : null}
      <h3 className="text-[28px] font-semibold leading-[150%] text-[#1f73e8]">{title}</h3>
      {description ? <p className="mt-2 text-[16px] font-normal leading-[150%] text-[#6e7683]">{description}</p> : null}
    </div>
  );
}
