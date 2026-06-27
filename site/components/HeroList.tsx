"use client";

import { useMemo, useState } from "react";
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
  const [typeFilter, setTypeFilter] = useState("");
  const [rarityFilter, setRarityFilter] = useState("");
  const [page, setPage] = useState(1);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleTypeChange = (value: string) => {
    setTypeFilter(value);
    setPage(1);
  };

  const handleRarityChange = (value: string) => {
    setRarityFilter(value);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setTypeFilter("");
    setRarityFilter("");
    setPage(1);
  };

  const filteredHeroes = useMemo(() => {
    const query = search.trim().toLowerCase();
    return heroes.filter((hero) => {
      const matchesSearch =
        !query ||
        hero.name.toLowerCase().includes(query) ||
        hero.code.includes(query);
      const matchesType = !typeFilter || hero.type === typeFilter;
      const matchesRarity = !rarityFilter || hero.rarity === rarityFilter;
      return matchesSearch && matchesType && matchesRarity;
    });
  }, [heroes, search, typeFilter, rarityFilter]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredHeroes.length / pageSize)),
    [filteredHeroes.length, pageSize]
  );

  const paginatedHeroes = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredHeroes.slice(start, start + pageSize);
  }, [filteredHeroes, page, pageSize]);

  const hasFilters = search || typeFilter || rarityFilter;

  return (
    <div className="space-y-4">
      <HeroFilters
        search={search}
        onSearchChange={handleSearchChange}
        typeFilter={typeFilter}
        onTypeChange={handleTypeChange}
        availableTypes={heroTypes}
        rarityFilter={rarityFilter}
        onRarityChange={handleRarityChange}
        availableRarities={heroRarities}
        onClear={clearFilters}
      />

      <p className="text-xs text-muted-foreground">
        Showing{" "}
        <span className="font-bold text-foreground">
          {paginatedHeroes.length.toLocaleString("en-US")}
        </span>{" "}
        of{" "}
        <span className="font-bold text-foreground">
          {filteredHeroes.length.toLocaleString("en-US")}
        </span>{" "}
        heroes
        {hasFilters && " (filtered)"}
      </p>

      <HeroGrid heroes={paginatedHeroes} />

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
    </div>
  );
}
