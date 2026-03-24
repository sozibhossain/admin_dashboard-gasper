"use client";

import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

type DashboardShellProps = {
  children: React.ReactNode;
};

export function DashboardShell({ children }: DashboardShellProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#dbe8f7]">
      <div className="hidden md:fixed md:inset-y-0 md:block md:w-[230px] lg:w-[250px]">
        <Sidebar />
      </div>

      <div className="md:pl-[230px] lg:pl-[250px]">
        <Topbar onOpenSidebar={() => setOpen(true)} />

        <main className="p-3 md:p-4 lg:p-5">
          <div className="min-h-[calc(100vh-106px)] rounded-sm border border-[#dce2ea] bg-[#f4f6fa] p-4 md:p-5">{children}</div>
        </main>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="left-0 top-0 h-screen w-[280px] max-w-[280px] translate-x-0 translate-y-0 rounded-none border-r p-0">
          <Sidebar onNavigate={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
