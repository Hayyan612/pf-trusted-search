"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BadgeCheck, Camera, ChevronLeft, ChevronRight, ExternalLink, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { FadeImage } from "@/components/fade-image";
import { cn } from "@/lib/utils";

const large = (src: string) => src.replace(/\/\d+x\d+\.jpg$/, "/1312x894.jpg");

export function PhotoGallery({
  images, total, verified, superAgent, sourceUrl, title,
}: { images: string[]; total: number | null; verified: boolean; superAgent: boolean; sourceUrl: string; title: string }) {
  const [open, setOpen] = useState(false);
  const [i, setI] = useState(0);
  const touchX = useRef<number | null>(null);
  const n = images.length;
  const go = useCallback((d: number) => setI((x) => (x + d + n) % n), [n]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, go]);

  const show = (idx: number) => {
    setI(idx);
    setOpen(true);
  };
  const more = (total ?? n) - n;

  return (
    <>
      <div className="relative">
        <div className="flex snap-x snap-mandatory gap-1 overflow-x-auto md:grid md:aspect-[2.4/1] md:grid-cols-[1.6fr_1fr] md:grid-rows-2 md:gap-2 md:overflow-hidden md:rounded-2xl">
          {images.slice(0, 3).map((src, idx) => (
            <button
              key={src}
              type="button"
              onClick={() => show(idx)}
              aria-label={`Open photo ${idx + 1} of ${n}`}
              className={cn("group relative aspect-[4/3] w-[88%] shrink-0 snap-start overflow-hidden bg-muted md:aspect-auto md:w-auto", idx === 0 && "md:row-span-2")}
            >
              <FadeImage src={src} alt="" loading={idx === 0 ? "eager" : "lazy"} className="absolute inset-0 size-full object-cover transition-[opacity,transform] duration-500 group-hover:scale-[1.02] motion-reduce:group-hover:scale-100" />
              <span className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
            </button>
          ))}
        </div>
        <div className="pointer-events-none absolute bottom-3 left-3 flex gap-1">
          {verified && <span className="inline-flex items-center gap-1 rounded-md bg-white/95 px-2 py-0.5 text-[12px] font-medium"><BadgeCheck className="size-3.5 text-sky-600" /> Verified</span>}
          {superAgent && <span className="rounded-md bg-primary/90 px-2 py-0.5 text-[12px] font-medium text-white">SuperAgent</span>}
        </div>
        <button
          type="button"
          onClick={() => show(0)}
          className="absolute right-3 bottom-3 inline-flex items-center gap-1 rounded-md bg-black/60 px-2.5 py-1 text-[12px] text-white transition-colors hover:bg-black/75"
        >
          <Camera className="size-3.5" /> {total ?? n} photos
        </button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton={false}
          className="flex h-dvh max-h-dvh w-screen max-w-none flex-col gap-0 rounded-none border-0 bg-black p-0 text-white sm:max-w-none"
        >
          <DialogTitle className="sr-only">Photos: {title}</DialogTitle>
          <div className="flex items-center justify-between px-4 py-3 text-[14px]">
            <span className="tabular-nums">{i + 1} / {n}</span>
            <span className="hidden max-w-[50%] truncate opacity-80 sm:block">{title}</span>
            <button type="button" onClick={() => setOpen(false)} className="grid size-9 place-items-center rounded-full bg-white/10 transition-colors hover:bg-white/20" aria-label="Close photos">
              <X className="size-5" />
            </button>
          </div>

          <div
            className="relative flex min-h-0 flex-1 items-center justify-center px-2 sm:px-16"
            onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
            onTouchEnd={(e) => {
              if (touchX.current === null) return;
              const dx = e.changedTouches[0].clientX - touchX.current;
              if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
              touchX.current = null;
            }}
          >
            <div key={images[i]} className="relative size-full motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300">
              {/* Small photo shows at once (usually cached); the sharp one fades in over it. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={images[i]} alt="" aria-hidden className="absolute inset-0 size-full object-contain" />
              <FadeImage src={large(images[i])} alt={`Photo ${i + 1} of ${n}`} className="absolute inset-0 size-full bg-transparent object-contain" />
            </div>
            {/* Preload neighbours so paging feels instant */}
            {n > 1 && (
              <div className="hidden" aria-hidden>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={large(images[(i + 1) % n])} alt="" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={large(images[(i - 1 + n) % n])} alt="" />
              </div>
            )}
            {n > 1 && (
              <>
                <button type="button" onClick={() => go(-1)} aria-label="Previous photo" className="absolute left-3 grid size-11 place-items-center rounded-full bg-white/15 backdrop-blur transition-colors hover:bg-white/25">
                  <ChevronLeft className="size-6" />
                </button>
                <button type="button" onClick={() => go(1)} aria-label="Next photo" className="absolute right-3 grid size-11 place-items-center rounded-full bg-white/15 backdrop-blur transition-colors hover:bg-white/25">
                  <ChevronRight className="size-6" />
                </button>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            {images.map((src, idx) => (
              <button
                key={src}
                type="button"
                onClick={() => setI(idx)}
                aria-label={`Show photo ${idx + 1}`}
                className={cn("relative h-14 w-20 shrink-0 overflow-hidden rounded-md opacity-60 ring-2 ring-transparent transition", idx === i && "opacity-100 ring-white")}
              >
                <FadeImage src={src} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" />
              </button>
            ))}
            {more > 0 && (
              <a href={sourceUrl} target="_blank" rel="noreferrer" className="inline-flex h-14 shrink-0 items-center gap-1 rounded-md bg-white/10 px-3 text-[12px] whitespace-nowrap transition-colors hover:bg-white/20">
                +{more} on Property Finder <ExternalLink className="size-3" />
              </a>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
