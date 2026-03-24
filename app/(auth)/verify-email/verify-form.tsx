"use client";

import { KeyboardEvent, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { forgotPassword, verifyOtp } from "@/lib/api";
import { toErrorMessage } from "@/lib/utils";
import { AuthShell } from "@/components/shared/auth-shell";
import { Button } from "@/components/ui/button";

type Purpose = "verify_email" | "reset_password";

const OTP_LENGTH = 6;

export function VerifyEmailForm({
  email,
  purpose,
}: {
  email: string;
  purpose: Purpose;
}) {
  const router = useRouter();

  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(""));
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  const otp = useMemo(() => digits.join(""), [digits]);

  const verifyMutation = useMutation({
    mutationFn: verifyOtp,
    onSuccess: (response) => {
      toast.success(response.message || "OTP verified");
      router.push(`/reset-password?email=${encodeURIComponent(email)}&otp=${otp}`);
    },
    onError: (error) => {
      toast.error(toErrorMessage(error));
    },
  });

  const resendMutation = useMutation({
    mutationFn: forgotPassword,
    onSuccess: (response) => toast.success(response.message || "OTP resent"),
    onError: (error) => toast.error(toErrorMessage(error)),
  });

  const onChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);

    if (digit && index < OTP_LENGTH - 1) {
      refs.current[index + 1]?.focus();
    }
  };

  const onKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  return (
    <AuthShell title="Verify Email" subtitle="Enter the otp to verify your email">
      <div className="space-y-8">
        <div className="flex justify-between gap-3">
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(element) => {
                refs.current[index] = element;
              }}
              className="h-14 w-14 border border-[#6b7280] bg-white text-center text-[28px] text-[#1f73e8] outline-none focus:border-[#1f73e8]"
              maxLength={1}
              value={digit}
              onChange={(event) => onChange(index, event.target.value)}
              onKeyDown={(event) => onKeyDown(index, event)}
              inputMode="numeric"
              autoComplete="one-time-code"
            />
          ))}
        </div>

        <Button
          className="w-full"
          onClick={() => verifyMutation.mutate({ email, otp, purpose })}
          disabled={verifyMutation.isPending || otp.length !== OTP_LENGTH}
        >
          {verifyMutation.isPending ? "Verifying..." : "Verify"}
        </Button>

        <p className="text-center text-[16px] text-[#636b75]">
          Didn&apos;t get a code?{" "}
          <button
            className="font-semibold text-[#1f73e8]"
            onClick={() => resendMutation.mutate({ email })}
            disabled={resendMutation.isPending}
          >
            Resend
          </button>
        </p>
      </div>
    </AuthShell>
  );
}
