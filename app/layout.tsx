import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Admin dashboard for Gasper",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={manrope.variable}>
      <body suppressHydrationWarning className="min-h-screen bg-[#dbe8f7] font-sans text-[#101828] antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
