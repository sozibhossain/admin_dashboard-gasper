import Link from "next/link";
import { APP_NAME } from "@/lib/constants";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <header className="px-6 py-7 md:px-12">
        <Link href="/login" className="text-[28px] font-semibold tracking-[0.18em] text-[#101820] md:text-[28px]">
          {APP_NAME}
        </Link>
      </header>
      <main className="mx-auto flex min-h-[calc(100vh-96px)] w-full max-w-[1040px] items-center justify-center px-4 pb-10">
        {children}
      </main>
    </div>
  );
}
