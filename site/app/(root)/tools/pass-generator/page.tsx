import { Key } from "lucide-react";
import { Breadcrumb } from "@/components/Breadcrumb";
import { IopPasswordGenerator } from "@/components/IopPasswordGenerator";

export const metadata = {
  title: "IOP Password Generator — Lost Saga Database",
  description:
    "Encrypt and decrypt Lost Saga IOP archive passwords using the same XOR cipher as the client source. Supports known locale presets and custom passwords.",
  openGraph: {
    title: "IOP Password Generator — Lost Saga Database",
    description:
      "Encrypt and decrypt Lost Saga IOP archive passwords using the client cipher.",
  },
  twitter: {
    card: "summary_large_image",
    title: "IOP Password Generator — Lost Saga Database",
    description:
      "Encrypt and decrypt Lost Saga IOP archive passwords using the client cipher.",
  },
};

export default function PassGeneratorPage() {
  return (
    <>
      <Breadcrumb
        items={[
          { label: "Tools", href: "/tools" },
          { label: "Password Generator" },
        ]}
      />

      <div className="ls-section-header mb-4">
        <Key className="h-5 w-5" />
        <span>Password Generator</span>
      </div>

      <p className="mb-6 text-sm text-muted-foreground">
        Encrypt a plaintext password into the signed byte arrays used by the
        Lost Saga client, or decrypt a known encoded array back to plaintext.
        Matches{" "}
        <code className="rounded bg-muted px-1 py-0.5 text-xs">
          ioLocalManagerParent::EncryptDecryptData
        </code>{" "}
        with{" "}
        <code className="rounded bg-muted px-1 py-0.5 text-xs">
          bPassword = true
        </code>
        .
      </p>

      <IopPasswordGenerator />
    </>
  );
}
