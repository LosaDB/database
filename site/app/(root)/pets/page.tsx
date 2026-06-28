import { PetList } from "@/components/PetList";
import { Breadcrumb } from "@/components/Breadcrumb";
import { pets, petRanks } from "@/lib/server/pets";
import { Bone } from "lucide-react";

export const metadata = {
  title: "Pets — Lost Saga Database",
  description:
    "Browse every pet, rank, and pet ability in Lost Saga.",
};

export default async function PetsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;

  return (
    <>
      <Breadcrumb items={[{ label: "Pets" }]} />

      <div className="ls-section-header mb-4">
        <Bone className="h-5 w-5" />
        <span>Pet Database</span>
        <span className="ml-auto rounded-full bg-white/10 px-2 py-0.5 text-xs font-bold">
          {pets.length.toLocaleString("en-US")}
        </span>
      </div>

      <PetList
        pets={pets}
        petRanks={petRanks}
        q={typeof params.q === "string" ? params.q : ""}
        baseRank={typeof params.baseRank === "string" ? params.baseRank : ""}
        maxRank={typeof params.maxRank === "string" ? params.maxRank : ""}
        sort={typeof params.sort === "string" ? params.sort : "id"}
        page={typeof params.page === "string" ? Number(params.page) : 1}
      />
    </>
  );
}
