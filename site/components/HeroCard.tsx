import Link from "next/link";
import { ImageFallback } from "./ImageFallback";
import {
  Hero,
  getAssetUrl,
  getHeroIconCandidates,
} from "@/lib/data";

interface HeroCardProps {
  hero: Hero;
}

export function HeroCard({ hero }: HeroCardProps) {
  const iconSrcs = getHeroIconCandidates(hero).map(getAssetUrl);

  return (
    <Link href={`/heroes/${hero.code}`} className="group block">
      <div className="ls-card flex h-full flex-col overflow-hidden">
        <div className="ls-image-frame relative aspect-square w-full shrink-0">
          <ImageFallback
            srcs={iconSrcs}
            alt={hero.name}
            fill
            className="p-4 transition-opacity duration-200 group-hover:opacity-85"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
          />
        </div>
        <div className="border-t-2 border-black/5 bg-[#0e1626] px-3 py-2 text-center">
          <p
            className="truncate text-xs font-medium text-foreground"
            title={hero.name}
          >
            {hero.name}
          </p>
        </div>
        <div className="mt-auto flex items-center justify-center border-t-2 border-black/5 bg-[#0c1322] px-3 py-2">
          <span className="ls-btn-green h-7 w-full text-xs">View Hero</span>
        </div>
      </div>
    </Link>
  );
}
