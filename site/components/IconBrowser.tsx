"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  LayoutGrid,
} from "lucide-react";
import {
  UIIcon,
  UIImageset,
  UI_ICONS_JSON_URL,
  UI_IMAGESET_JSON_URL,
} from "@/lib/ui-icons";

const PAGE_SIZE = 48;
const MAX_PREVIEW_SIZE = 120;

function IconSprite({ icon }: { icon: UIIcon }) {
  const maxDim = Math.max(icon.width, icon.height);
  const scale =
    maxDim > MAX_PREVIEW_SIZE ? MAX_PREVIEW_SIZE / maxDim : 1;

  return (
    <div
      className="ls-image-frame inline-flex overflow-hidden"
      style={{
        width: Math.max(1, Math.round(icon.width * scale)),
        height: Math.max(1, Math.round(icon.height * scale)),
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={icon.pngUrl}
        alt={`${icon.imageset} — ${icon.name}`}
        loading="lazy"
        decoding="async"
        draggable={false}
        style={{
          width: icon.width,
          height: icon.height,
          objectFit: "none",
          objectPosition: `${-icon.x}px ${-icon.y}px`,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          imageRendering: "pixelated",
        }}
        className="shrink-0"
      />
    </div>
  );
}

function IconCard({ icon }: { icon: UIIcon }) {
  const label = `${icon.imageset}#${icon.name}`;

  return (
    <div className="ls-card flex min-h-[180px] flex-col items-center justify-between gap-3 p-4">
      <IconSprite icon={icon} />
      <p
        className="w-full break-all text-center text-[11px] font-bold text-foreground"
        title={label}
      >
        {label}
      </p>
    </div>
  );
}

export function IconBrowser() {
  const [icons, setIcons] = useState<UIIcon[]>([]);
  const [imagesets, setImagesets] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [selectedImageset, setSelectedImageset] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const [iconsRes, imagesetRes] = await Promise.all([
          fetch(UI_ICONS_JSON_URL, { cache: "default" }),
          fetch(UI_IMAGESET_JSON_URL, { cache: "default" }),
        ]);

        if (!iconsRes.ok) {
          throw new Error(
            `Failed to load ui-icons.json (${iconsRes.status})`,
          );
        }
        if (!imagesetRes.ok) {
          throw new Error(
            `Failed to load ui-imageset.json (${imagesetRes.status})`,
          );
        }

        const [iconsMap, imagesetArray]: [
          Record<string, UIIcon>,
          UIImageset[],
        ] = await Promise.all([
          iconsRes.json(),
          imagesetRes.json(),
        ]);

        if (cancelled) return;

        const iconsList = Object.values(iconsMap)
          .filter((icon) => icon.width > 0 && icon.height > 0)
          .sort((a, b) =>
            a.imageset === b.imageset
              ? a.name.localeCompare(b.name)
              : a.imageset.localeCompare(b.imageset),
          );

        const imagesetNames = imagesetArray
          .map((set) => set.name)
          .sort((a, b) => a.localeCompare(b));

        setIcons(iconsList);
        setImagesets(imagesetNames);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "An unexpected error occurred while loading icon data.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredIcons = useMemo(() => {
    const query = search.trim().toLowerCase();
    return icons.filter((icon) => {
      const matchesSearch =
        !query ||
        icon.name.toLowerCase().includes(query) ||
        icon.imageset.toLowerCase().includes(query);
      const matchesImageset =
        !selectedImageset || icon.imageset === selectedImageset;
      return matchesSearch && matchesImageset;
    });
  }, [icons, search, selectedImageset]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredIcons.length / PAGE_SIZE)),
    [filteredIcons.length],
  );

  const paginatedIcons = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredIcons.slice(start, start + PAGE_SIZE);
  }, [filteredIcons, page]);

  const hasFilters = search || selectedImageset;

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleImagesetChange = (value: string) => {
    setSelectedImageset(value);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedImageset("");
    setPage(1);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-semibold">Loading UI icon data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted-foreground">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <p className="text-center text-sm font-semibold text-foreground">
          Couldn&apos;t load icons
        </p>
        <p className="max-w-md text-center text-xs">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="ls-card space-y-4 p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by icon or imageset name..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="border-2 border-[var(--border)] bg-[#0b1120] pl-9 text-sm placeholder:text-muted-foreground focus-visible:ring-primary/50"
            />
          </div>

          <div className="flex flex-col gap-1 sm:w-72">
            <label className="text-xs font-bold uppercase text-muted-foreground">
              Imageset
            </label>
            <div className="relative">
              <LayoutGrid className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <select
                value={selectedImageset}
                onChange={(e) => handleImagesetChange(e.target.value)}
                className="h-9 w-full appearance-none rounded-md border-2 border-[var(--border)] bg-[#0b1120] pl-9 pr-8 text-sm text-foreground focus:border-primary/50 focus:outline-none"
              >
                <option value="">All imagesets</option>
                {imagesets.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                ▼
              </span>
            </div>
          </div>

          {hasFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="shrink-0 gap-1"
            >
              <X className="h-4 w-4" /> Clear
            </Button>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          Showing{" "}
          <span className="font-bold text-foreground">
            {filteredIcons.length.toLocaleString()}
          </span>{" "}
          of{" "}
          <span className="font-bold text-foreground">
            {icons.length.toLocaleString()}
          </span>{" "}
          icons
          {hasFilters && " (filtered)"}
        </p>
      </div>

      {filteredIcons.length === 0 ? (
        <div className="py-16 text-center text-sm text-muted-foreground">
          No icons match your filters.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-6">
            {paginatedIcons.map((icon) => (
              <IconCard key={`${icon.imageset}#${icon.name}`} icon={icon} />
            ))}
          </div>

          <div className="flex flex-col items-center gap-3 pt-4 sm:flex-row sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Page{" "}
              <span className="font-bold text-foreground">{page}</span> of{" "}
              <span className="font-bold text-foreground">{totalPages}</span>
            </p>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || totalPages === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={page === totalPages || totalPages === 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
