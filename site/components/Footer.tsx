import Link from "next/link";
import { Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-[#1e3a5f] bg-[#0b1120] py-8">
      <div className="mx-auto flex max-w-[1370px] flex-col items-center justify-between gap-4 px-4 sm:flex-row">
        <div className="text-center sm:text-left">
          <p className="text-sm font-semibold text-white">Lost Saga Database</p>
          <p className="text-xs text-muted-foreground">
            Open-source project. Not affiliated with Valofe or OG Planet.
          </p>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <span>Made with</span>
          <Heart className="h-3 w-3 fill-red-500 text-red-500" />
          <span>by the community.</span>
        </div>
        <div className="flex gap-4 text-xs text-muted-foreground">
          <Link href="/heroes" className="hover:text-primary">
            Heroes
          </Link>
          <a
            href="https://github.com/LosaDB/database"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
