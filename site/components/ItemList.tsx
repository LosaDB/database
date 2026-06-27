"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, ChevronLeft, ChevronRight } from "lucide-react";
import { ItemIcon } from "@/components/ItemIcon";
import type { EtcItem } from "@/lib/items";

const PAGE_SIZE = 48;

function ItemCard({ item }: { item: EtcItem }) {
  return (
    <Link href={`/items/${item.id}`} className="group block cursor-pointer">
      <div className="ls-card flex items-center gap-3 p-3 h-full">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded bg-[#0b1120]">
          {item.icon ? (
            <ItemIcon icon={item.icon} maxSize={48} />
          ) : (
            <div className="h-full w-full bg-muted" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p
            className="truncate text-sm font-bold text-foreground transition-colors group-hover:text-primary"
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
            <span className="rounded bg-[#0e1626] px-1.5 py-0.5 font-mono text-muted-foreground">
              Code {item.type}
            </span>
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
        <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
    </Link>
  );
}

interface ItemListProps {
  items: EtcItem[];
  itemGroups: number[];
}

export function ItemList({ items, itemGroups }: ItemListProps) {
  const [search, setSearch] = useState("");
  const [groupFilter, setGroupFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(1);

  const hasFilters = search.trim() || groupFilter || typeFilter.trim();

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleGroupChange = (value: string) => {
    setGroupFilter(value);
    setPage(1);
  };

  const handleTypeChange = (value: string) => {
    setTypeFilter(value);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setGroupFilter("");
    setTypeFilter("");
    setPage(1);
  };

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    const typeQuery = typeFilter.trim();

    return items.filter((item) => {
      if (groupFilter === "none") {
        if (item.group !== undefined) return false;
      } else if (groupFilter !== "") {
        if (item.group !== Number(groupFilter)) return false;
      }

      if (typeQuery && !String(item.type).includes(typeQuery)) return false;

      if (!query) return true;
      const idMatch = String(item.id).includes(query);
      const nameMatch = item.name.toLowerCase().includes(query);
      const shopNameMatch = item.shopName.toLowerCase().includes(query);
      const iconMatch = item.iconKey?.toLowerCase().includes(query) ?? false;
      return idMatch || nameMatch || shopNameMatch || iconMatch;
    });
  }, [items, search, groupFilter, typeFilter]);

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
      <div className="ls-card flex flex-col gap-3 p-4 lg:flex-row lg:items-end">
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

        <div className="flex flex-col gap-1.5 sm:flex-row sm:items-end sm:gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="group-filter" className="text-[10px] font-bold uppercase text-muted-foreground">
              Group
            </label>
            <select
              id="group-filter"
              value={groupFilter}
              onChange={(e) => handleGroupChange(e.target.value)}
              className="h-9 rounded-md border-2 border-[var(--border)] bg-[#0b1120] px-3 text-sm text-foreground focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:outline-none"
            >
              <option value="">All groups</option>
              <option value="none">Ungrouped</option>
              {itemGroups.map((g) => (
                <option key={g} value={String(g)}>
                  Group {g}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="type-filter" className="text-[10px] font-bold uppercase text-muted-foreground">
              Type code
            </label>
            <Input
              id="type-filter"
              type="text"
              inputMode="numeric"
              placeholder="e.g. 3000019"
              value={typeFilter}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="border-2 border-[var(--border)] bg-[#0b1120] text-sm placeholder:text-muted-foreground focus-visible:ring-primary/50"
            />
          </div>

          {hasFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="shrink-0 gap-1 sm:mb-0"
            >
              <X className="h-4 w-4" /> Clear
            </Button>
          )}
        </div>
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
        {hasFilters && " (filtered)"}
      </p>

      {filteredItems.length === 0 ? (
        <div className="py-16 text-center text-sm text-muted-foreground">
          No items match your filters.
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
