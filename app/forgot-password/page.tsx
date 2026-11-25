"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    await authClient.requestPasswordReset({ email: email.trim(), redirectTo: "/reset-password" });
    setBusy(false);
    setSent(true); // same message either way, so the page does not reveal which emails have accounts
  };
  return (
    <div className="mx-auto w-full max-w-sm space-y-6 px-4 pt-10 md:pt-16">
      <h1 className="text-center text-[24px] font-semibold tracking-tight">Forgot your password?</h1>
      {sent ? (
        <p className="rounded-xl border p-4 text-[14px]">If there is an account for <b>{email}</b>, a reset link is on its way. Check your inbox and spam folder.</p>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <Button type="submit" className="w-full" disabled={busy}>{busy ? "Sending…" : "Send reset link"}</Button>
        </form>
      )}
      <p className="text-center text-[14px]"><Link href="/login" className="text-primary underline">Back to log in</Link></p>
    </div>
  );
}
