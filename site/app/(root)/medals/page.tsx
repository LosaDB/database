import { MedalList } from "@/components/MedalList";
import { Breadcrumb } from "@/components/Breadcrumb";
import { medals, medalSubTypes } from "@/lib/server/medals";
import { Shield } from "lucide-react";

export const metadata = {
  title: "Medals — Lost Saga Database",
  description:
    "Browse every medal, rank badge, and medal inventory item in Lost Saga.",
};

export default async function MedalsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;

  return (
    <>
      <Breadcrumb items={[{ label: "Medals" }]} />

      <div className="ls-section-header mb-4">
        <Shield className="h-5 w-5" />
        <span>Medal Database</span>
        <span className="ml-auto rounded-full bg-white/10 px-2 py-0.5 text-xs font-bold">
          {medals.length.toLocaleString("en-US")}
        </span>
      </div>

      <MedalList
        medals={medals}
        medalSubTypes={medalSubTypes}
        q={typeof params.q === "string" ? params.q : ""}
        subType={typeof params.subType === "string" ? params.subType : ""}
        hasManual={typeof params.hasManual === "string" ? params.hasManual : ""}
        sort={typeof params.sort === "string" ? params.sort : "id"}
        page={typeof params.page === "string" ? Number(params.page) : 1}
      />
    </>
  );
}
