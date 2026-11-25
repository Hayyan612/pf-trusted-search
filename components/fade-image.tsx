"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Image that fades in once loaded. Images that finished loading before React hydrated
 * never fire onLoad, so the effect checks `complete` after mount. Broken images show the placeholder.
 */
export function FadeImage({ className, onLoad, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) {
  const ref = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (el?.complete) {
      if (el.naturalWidth > 0) setLoaded(true);
      else setFailed(true);
    }
  }, []);

  if (failed) return <div className={cn("bg-muted", className)} aria-hidden />;

  return (
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    <img
      ref={ref}
      {...props}
      onLoad={(e) => {
        setLoaded(true);
        onLoad?.(e);
      }}
      onError={() => setFailed(true)}
      className={cn("bg-muted transition-opacity duration-500 motion-reduce:transition-none", loaded ? "opacity-100" : "opacity-0", className)}
    />
  );
}
