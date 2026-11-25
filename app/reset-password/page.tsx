"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

function ResetForm() {
  const sp = useSearchParams();
  const router = useRouter();
  const token = sp.get("token");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  if (!token || sp.get("error")) {
    return <p className="rounded-xl border p-4 text-[14px]">This reset link has expired or was already used. <Link href="/forgot-password" className="text-primary underline">Ask for a new one</Link>.</p>;
  }
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const res = await authClient.resetPassword({ newPassword: password, token });
    setBusy(false);
    if (res.error) return toast.error(res.error.message || "Could not reset the password. Ask for a new link.");
    toast.success("Password changed. Log in with your new password.");
    router.push("/login");
  };
  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="password">New password</Label>
        <Input id="password" type="password" required minLength={8} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <p className="text-[12px] text-muted-foreground">At least 8 characters.</p>
      </div>
      <Button type="submit" className="w-full" disabled={busy}>{busy ? "Saving…" : "Save new password"}</Button>
    </form>
  );
}

export default function ResetPassword() {
  return (
    <div className="mx-auto w-full max-w-sm space-y-6 px-4 pt-10 md:pt-16">
      <h1 className="text-center text-[24px] font-semibold tracking-tight">Choose a new password</h1>
      <Suspense><ResetForm /></Suspense>
    </div>
  );
}
