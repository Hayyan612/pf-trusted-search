"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/** Image that fades in once loaded, over a muted placeholder of the same size. */
export function FadeImage({ className, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [loaded, setLoaded] = useState(false);
  return (
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    <img
      {...props}
      ref={(el) => {
        if (el?.complete && el.naturalWidth > 0 && !loaded) setLoaded(true);
      }}
      onLoad={() => setLoaded(true)}
      className={cn("bg-muted transition-opacity duration-500 motion-reduce:transition-none", loaded ? "opacity-100" : "opacity-0", className)}
    />
  );
}
