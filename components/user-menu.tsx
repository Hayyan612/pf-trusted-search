"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Cloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { signOut, useSession } from "@/lib/auth-client";
import { replaceShortlist } from "@/lib/shortlist";

export function UserMenu() {
  const { data, isPending } = useSession();
  const router = useRouter();
  if (isPending) return <div className="size-8" />;
  if (!data) {
    return (
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex"><Link href="/signup">Sign up</Link></Button>
        <Button asChild size="sm"><Link href="/login">Log in</Link></Button>
      </div>
    );
  }
  const name = data.user.name || data.user.email;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="grid size-8 place-items-center overflow-hidden rounded-full bg-primary text-[13px] font-semibold text-primary-foreground" aria-label="Account">
          {data.user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.user.image} alt="" className="size-full object-cover" />
          ) : (
            name.slice(0, 1).toUpperCase()
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="font-normal">
          <div className="font-medium">{data.user.name}</div>
          <div className="truncate text-[12px] text-muted-foreground">{data.user.email}</div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild><Link href="/shortlist"><Cloud className="size-4" /> Shortlist synced to your account</Link></DropdownMenuItem>
        <DropdownMenuItem
          onClick={async () => {
            await signOut();
            replaceShortlist([]);
            router.push("/");
            router.refresh();
          }}
        >
          <LogOut className="size-4" /> Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
