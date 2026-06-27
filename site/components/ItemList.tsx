"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, ChevronLeft, ChevronRight } from "lucide-react";
import type { EtcItem, ItemIcon } from "@/lib/items";

const PAGE_SIZE = 48;
const MAX_ICON_PREVIEW = 48;

function ItemSprite({ icon }: { icon: ItemIcon }) {
  const maxDim = Math.max(icon.width, icon.height);
  const scale =
    maxDim > MAX_ICON_PREVIEW ? MAX_ICON_PREVIEW / maxDim : 1;
  const scaledWidth = Math.max(1, Math.round(icon.width * scale));
  const scaledHeight = Math.max(1, Math.round(icon.height * scale));

  return (
    <div
      className="relative overflow-hidden"
      style={{
        width: scaledWidth,
        height: scaledHeight,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={icon.pngUrl}
        alt={icon.name}
        loading="lazy"
        decoding="async"
        className="absolute left-0 top-0 max-w-none max-h-none"
        style={{
          marginLeft: Math.round(-icon.x * scale),
          marginTop: Math.round(-icon.y * scale),
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      />
    </div>
  );
}

function ItemCard({ item }: { item: EtcItem }) {
  return (
    <div className="ls-card flex items-center gap-3 p-3">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded bg-[#0b1120]">
        {item.icon ? (
          <ItemSprite icon={item.icon} />
        ) : (
          <div className="h-full w-full bg-muted" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p
          className="truncate text-sm font-bold text-foreground"
          title={item.name}
        >
          {item.name || item.shopName}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          #{item.id}
          {item.iconKey && (
            <span className="ml-2 font-mono text-[10px]">{item.iconKey}</span>
          )}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px]">
          {item.group !== undefined && (
            <span className="rounded bg-[#0e1626] px-1.5 py-0.5 text-muted-foreground">
              Group {item.group}
            </span>
          )}
          {item.value !== undefined && item.value > 0 && (
            <span className="rounded bg-[#0e1626] px-1.5 py-0.5 text-muted-foreground">
              ×{item.value}
            </span>
          )}
          {item.cash !== undefined && item.cash > 0 && (
            <span className="rounded bg-[#0e1626] px-1.5 py-0.5 text-[#f59e0b]">
              {item.cash.toLocaleString("en-US")} cash
            </span>
          )}
          {item.sellPeso > 0 && (
            <span className="rounded bg-[#0e1626] px-1.5 py-0.5 text-muted-foreground">
              {item.sellPeso.toLocaleString("en-US")} peso
            </span>
          )}
          {!item.active && (
            <span className="rounded bg-[#0e1626] px-1.5 py-0.5 text-destructive">
              Inactive
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

interface ItemListProps {
  items: EtcItem[];
}

export function ItemList({ items }: ItemListProps) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return items;
    return items.filter((item) => {
      const idMatch = String(item.id).includes(query);
      const nameMatch = item.name.toLowerCase().includes(query);
      const shopNameMatch = item.shopName.toLowerCase().includes(query);
      const iconMatch = item.iconKey?.toLowerCase().includes(query) ?? false;
      return idMatch || nameMatch || shopNameMatch || iconMatch;
    });
  }, [items, search]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE)),
    [filteredItems.length],
  );

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredItems.slice(start, start + PAGE_SIZE);
  }, [filteredItems, page]);

  return (
    <div className="space-y-4">
      <div className="ls-card flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by name, id, or icon key..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="border-2 border-[var(--border)] bg-[#0b1120] pl-9 text-sm placeholder:text-muted-foreground focus-visible:ring-primary/50"
          />
        </div>

        {search && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSearchChange("")}
            className="shrink-0 gap-1"
          >
            <X className="h-4 w-4" /> Clear
          </Button>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Showing{" "}
        <span className="font-bold text-foreground">
          {paginatedItems.length.toLocaleString("en-US")}
        </span>{" "}
        of{" "}
        <span className="font-bold text-foreground">
          {filteredItems.length.toLocaleString("en-US")}
        </span>{" "}
        items
        {search.trim() && " (filtered)"}
      </p>

      {filteredItems.length === 0 ? (
        <div className="py-16 text-center text-sm text-muted-foreground">
          No items match your search.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {paginatedItems.map((item) => (
              <ItemCard key={item.id} item={item} />
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
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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
