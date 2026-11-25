import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";
import { googleEnabled } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense>
      <AuthForm mode="login" googleEnabled={googleEnabled} />
    </Suspense>
  );
}
