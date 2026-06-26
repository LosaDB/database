"use client";

import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";

interface HeroFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  selectedTypes: string[];
  toggleType: (type: string) => void;
  availableTypes: string[];
  selectedRarities: string[];
  toggleRarity: (rarity: string) => void;
  availableRarities: string[];
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md border px-2.5 py-1 text-xs font-bold capitalize transition-all ${
        active
          ? "border-[#284f7f] bg-gradient-to-b from-[#6d9edc] to-[#2770cb] text-white"
          : "border-[var(--border)] bg-[#0e1626] text-muted-foreground hover:border-[#3b82f6]/50 hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}

export function HeroFilters({
  search,
  onSearchChange,
  selectedTypes,
  toggleType,
  availableTypes,
  selectedRarities,
  toggleRarity,
  availableRarities,
}: HeroFiltersProps) {
  const hasFilters =
    search || selectedTypes.length > 0 || selectedRarities.length > 0;

  const clearAll = () => {
    onSearchChange("");
    selectedTypes.forEach(toggleType);
    selectedRarities.forEach(toggleRarity);
  };

  return (
    <div className="ls-card h-fit space-y-4 p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-foreground">Filters</span>
        {hasFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-primary"
          >
            <X className="h-3 w-3" /> Clear
          </button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search hero or code..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="border-2 border-[var(--border)] bg-[#0b1120] pl-9 text-sm placeholder:text-muted-foreground focus-visible:ring-primary/50"
        />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-bold uppercase text-muted-foreground">
          Type
        </span>
        <div className="flex flex-wrap gap-2">
          {availableTypes.map((type) => (
            <FilterChip
              key={type}
              label={type}
              active={selectedTypes.includes(type)}
              onClick={() => toggleType(type)}
            />
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <span className="text-xs font-bold uppercase text-muted-foreground">
          Rarity
        </span>
        <div className="flex flex-wrap gap-2">
          {availableRarities.map((rarity) => (
            <FilterChip
              key={rarity}
              label={rarity}
              active={selectedRarities.includes(rarity)}
              onClick={() => toggleRarity(rarity)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
