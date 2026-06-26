"use client";

import { useEffect, useMemo, useState } from "react";
import { HeroFilters } from "./HeroFilters";
import { HeroGrid } from "./HeroGrid";
import { Hero } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface HeroListProps {
  heroes: Hero[];
  heroTypes: string[];
  heroRarities: string[];
  pageSize?: number;
}

export function HeroList({
  heroes,
  heroTypes,
  heroRarities,
  pageSize = 24,
}: HeroListProps) {
  const [search, setSearch] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedRarities, setSelectedRarities] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const toggleRarity = (rarity: string) => {
    setSelectedRarities((prev) =>
      prev.includes(rarity)
        ? prev.filter((r) => r !== rarity)
        : [...prev, rarity]
    );
  };

  const filteredHeroes = useMemo(() => {
    const query = search.trim().toLowerCase();
    return heroes.filter((hero) => {
      const matchesSearch =
        !query ||
        hero.name.toLowerCase().includes(query) ||
        hero.code.includes(query);
      const matchesType =
        selectedTypes.length === 0 || selectedTypes.includes(hero.type);
      const matchesRarity =
        selectedRarities.length === 0 ||
        selectedRarities.includes(hero.rarity);
      return matchesSearch && matchesType && matchesRarity;
    });
  }, [heroes, search, selectedTypes, selectedRarities]);

  // Reset to first page whenever filters/search change
  useEffect(() => {
    setPage(1);
  }, [search, selectedTypes, selectedRarities]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredHeroes.length / pageSize)),
    [filteredHeroes.length, pageSize]
  );

  const paginatedHeroes = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredHeroes.slice(start, start + pageSize);
  }, [filteredHeroes, page, pageSize]);

  const hasFilters =
    search || selectedTypes.length > 0 || selectedRarities.length > 0;

  return (
    <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
      <aside className="h-fit lg:sticky lg:top-8">
        <HeroFilters
          search={search}
          onSearchChange={setSearch}
          selectedTypes={selectedTypes}
          toggleType={toggleType}
          availableTypes={heroTypes}
          selectedRarities={selectedRarities}
          toggleRarity={toggleRarity}
          availableRarities={heroRarities}
        />
      </aside>

      <section className="space-y-4">
        <HeroGrid heroes={paginatedHeroes} />

        <div className="flex flex-col items-center gap-3 pt-4 sm:flex-row sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-bold text-foreground">
              {paginatedHeroes.length}
            </span>{" "}
            of{" "}
            <span className="font-bold text-foreground">
              {filteredHeroes.length}
            </span>{" "}
            heroes
            {hasFilters && " (filtered)"}
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

            <span className="min-w-[5rem] text-center text-sm font-semibold text-foreground">
              Page {page} of {totalPages}
            </span>

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
      </section>
    </div>
  );
}
