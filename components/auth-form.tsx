"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn, signUp } from "@/lib/auth-client";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.9-5.5 3.9-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.3 14.6 2.3 12 2.3 6.6 2.3 2.3 6.6 2.3 12s4.3 9.7 9.7 9.7c5.6 0 9.3-3.9 9.3-9.5 0-.6-.1-1.1-.2-1.6H12z" />
    </svg>
  );
}

export function AuthForm({ mode, googleEnabled }: { mode: "login" | "signup"; googleEnabled: boolean }) {
  const router = useRouter();
  const next = useSearchParams().get("next") || "/shortlist";
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const res =
      mode === "signup"
        ? await signUp.email({ name: form.name.trim() || form.email.split("@")[0], email: form.email.trim(), password: form.password })
        : await signIn.email({ email: form.email.trim(), password: form.password });
    setBusy(false);
    if (res.error) {
      toast.error(res.error.message || "That did not work. Check your details and try again.");
      return;
    }
    toast.success(mode === "signup" ? "Account created. Check your inbox to confirm your email." : "Welcome back");
    router.push(next);
    router.refresh();
  };

  const google = async () => {
    if (!googleEnabled) {
      toast("Google sign-in is not switched on in this prototype yet", { description: "Use email and password for now." });
      return;
    }
    await signIn.social({ provider: "google", callbackURL: next });
  };

  return (
    <div className="mx-auto w-full max-w-sm space-y-6 px-4 pt-10 md:pt-16">
      <div className="space-y-1 text-center">
        <h1 className="text-[24px] font-semibold tracking-tight">{mode === "signup" ? "Create your account" : "Log in"}</h1>
        <p className="text-[14px] text-muted-foreground">Save your shortlist and Scout&apos;s answers from agents, on the web and in the app.</p>
      </div>
      <Button type="button" variant="outline" className="w-full" onClick={google}>
        <GoogleIcon /> Continue with Google
      </Button>
      <div className="flex items-center gap-3 text-[12px] text-muted-foreground">
        <span className="h-px flex-1 bg-border" /> or with email <span className="h-px flex-1 bg-border" />
      </div>
      <form onSubmit={submit} className="space-y-4">
        {mode === "signup" && (
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" autoComplete="name" value={form.name} onChange={set("name")} />
          </div>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required autoComplete="email" value={form.email} onChange={set("email")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" required minLength={8} autoComplete={mode === "signup" ? "new-password" : "current-password"} value={form.password} onChange={set("password")} />
          {mode === "signup" ? (
            <p className="text-[12px] text-muted-foreground">At least 8 characters.</p>
          ) : (
            <Link href="/forgot-password" className="text-[12px] text-primary underline">Forgot password?</Link>
          )}
        </div>
        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? "Please wait…" : mode === "signup" ? "Create account" : "Log in"}
        </Button>
      </form>
      <p className="text-center text-[14px] text-muted-foreground">
        {mode === "signup" ? (
          <>Already have an account? <Link href={`/login?next=${encodeURIComponent(next)}`} className="text-primary underline">Log in</Link></>
        ) : (
          <>New here? <Link href={`/signup?next=${encodeURIComponent(next)}`} className="text-primary underline">Create an account</Link></>
        )}
      </p>
      <p className="text-center text-[12px] text-muted-foreground">You can use everything without an account. Signing in only saves your shortlist.</p>
    </div>
  );
}
