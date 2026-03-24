import { VerifyEmailForm } from "@/app/(auth)/verify-email/verify-form";

type Purpose = "verify_email" | "reset_password";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; purpose?: Purpose }>;
}) {
  const resolvedSearchParams = await searchParams;
  const email = resolvedSearchParams.email || "";
  const purpose = resolvedSearchParams.purpose || "reset_password";

  return <VerifyEmailForm email={email} purpose={purpose} />;
}
