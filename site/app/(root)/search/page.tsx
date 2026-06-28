import { Breadcrumb } from "@/components/Breadcrumb";
import { SearchPanel } from "@/components/SearchPanel";
import { heroes } from "@/lib/server/data";
import { etcItems } from "@/lib/server/items";
import { gears } from "@/lib/server/gears";
import { medals } from "@/lib/server/medals";
import { pets } from "@/lib/server/pets";
import { Search } from "lucide-react";

export const metadata = {
  title: "Search — Lost Saga Database",
  description:
    "Search across heroes, items, gears, medals, and pets in Lost Saga.",
};

const validCategories = [
  "all",
  "heroes",
  "items",
  "gears",
  "medals",
  "pets",
] as const;
type Category = (typeof validCategories)[number];

function parseCategory(value: unknown): Category {
  const str = typeof value === "string" ? value : "all";
  return validCategories.includes(str as Category) ? (str as Category) : "all";
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q : "";
  const category = parseCategory(params.category);

  return (
    <>
      <Breadcrumb items={[{ label: "Search" }]} />

      <div className="ls-section-header mb-4">
        <Search className="h-5 w-5" />
        <span>Global Search</span>
      </div>

      <SearchPanel
        heroes={heroes}
        items={etcItems}
        gears={gears}
        medals={medals}
        pets={pets}
        initialQuery={query}
        initialCategory={category}
      />
    </>
  );
}
