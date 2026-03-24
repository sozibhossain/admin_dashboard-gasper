import { ResetPasswordForm } from "@/app/(auth)/reset-password/reset-password-form";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; otp?: string }>;
}) {
  const resolvedSearchParams = await searchParams;

  return <ResetPasswordForm email={resolvedSearchParams.email || ""} otp={resolvedSearchParams.otp || ""} />;
}
