import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";
import Link from "next/link";
import { googleEnabled } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default function Page() {
  if (!process.env.DATABASE_URL) {
    return (
      <div className="mx-auto max-w-sm space-y-3 px-4 pt-16 text-center">
        <h1 className="text-[22px] font-semibold">Accounts are paused on this copy</h1>
        <p className="text-[14px] text-muted-foreground">Everything else works. Your shortlist is saved in this browser.</p>
        <Link href="/search?kind=rent" className="text-primary underline">Back to search</Link>
      </div>
    );
  }
  return (
    <Suspense>
      <AuthForm mode="signup" googleEnabled={googleEnabled} />
    </Suspense>
  );
}
