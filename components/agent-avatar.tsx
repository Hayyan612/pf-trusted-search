import { FadeImage } from "@/components/fade-image";
import { cn } from "@/lib/utils";

export function AgentAvatar({ name, image, size = 32, className }: { name: string | null; image: string | null; size?: number; className?: string }) {
  const initial = (name || "?").trim().slice(0, 1).toUpperCase();
  return (
    <span className={cn("relative grid shrink-0 place-items-center overflow-hidden rounded-full bg-accent text-[12px] font-semibold text-primary", className)} style={{ width: size, height: size }}>
      {initial}
      {image && <FadeImage src={image} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" />}
    </span>
  );
}
