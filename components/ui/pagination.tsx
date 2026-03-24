import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
};

function buildPages(page: number, totalPages: number) {
  const pages: Array<number | "ellipsis"> = [];

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i += 1) pages.push(i);
    return pages;
  }

  pages.push(1);

  if (page > 3) pages.push("ellipsis");

  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);

  for (let i = start; i <= end; i += 1) pages.push(i);

  if (page < totalPages - 2) pages.push("ellipsis");

  pages.push(totalPages);

  return pages;
}

export function Pagination({ page, totalPages, onPageChange, className }: PaginationProps) {
  const pages = buildPages(page, totalPages);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        variant="outline"
        size="icon"
        disabled={page <= 1}
        className="h-10 w-10 rounded-none"
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {pages.map((item, index) => {
        if (item === "ellipsis") {
          return (
            <span key={`ellipsis-${index}`} className="flex h-10 w-10 items-center justify-center border border-[#d4deea] text-[#8fa6cc]">
              <MoreHorizontal className="h-4 w-4" />
            </span>
          );
        }

        const active = item === page;
        return (
          <Button
            key={item}
            variant={active ? "default" : "outline"}
            className={cn("h-10 min-w-10 rounded-none px-3", active && "shadow-none")}
            onClick={() => onPageChange(item)}
          >
            {item}
          </Button>
        );
      })}

      <Button
        variant="outline"
        size="icon"
        disabled={page >= totalPages}
        className="h-10 w-10 rounded-none"
        onClick={() => onPageChange(page + 1)}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
