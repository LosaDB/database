"use client";

import { useMemo, useState } from "react";
import { Lock, Unlock, Copy, Check, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  encryptIopPassword,
  decryptIopPassword,
  iopPasswordPresets,
  MAX_PASSWORD,
} from "@/lib/iop-password";

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Ignore unsupported environments.
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleCopy}
      aria-label={`Copy ${label}`}
    >
      {copied ? (
        <Check className="h-4 w-4 text-[#22c55e]" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
      <span className="ml-1">{copied ? "Copied" : "Copy"}</span>
    </Button>
  );
}

function OutputField({
  label,
  value,
  monospace = true,
}: {
  label: string;
  value: string;
  monospace?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase text-muted-foreground">
          {label}
        </span>
        <CopyButton text={value} label={label} />
      </div>
      <textarea
        readOnly
        value={value}
        rows={3}
        className={`w-full rounded-lg border border-[var(--border)] bg-[#0b1120] px-3 py-2 text-sm text-foreground outline-none focus-visible:border-ring ${
          monospace ? "font-mono" : ""
        }`}
      />
    </div>
  );
}

export function IopPasswordGenerator() {
  const [plain, setPlain] = useState("iosuccess#@");
  const [cipher, setCipher] = useState(
    iopPasswordPresets[0].encrypted.join(","),
  );
  const [preset, setPreset] = useState(iopPasswordPresets[0].code);

  const encrypted = useMemo(() => {
    try {
      return encryptIopPassword(plain);
    } catch {
      return [];
    }
  }, [plain]);

  const decrypted = useMemo(() => {
    try {
      return decryptIopPassword(cipher);
    } catch {
      return "";
    }
  }, [cipher]);

  const signedCsv = encrypted.join(",");
  const cppArray = `{ ${signedCsv} }`;
  const hexString = encrypted
    .map((b) => {
      const unsigned = b < 0 ? b + 256 : b;
      return unsigned.toString(16).padStart(2, "0").toUpperCase();
    })
    .join(" ");

  const handlePresetChange = (code: string) => {
    const selected = iopPasswordPresets.find((p) => p.code === code);
    if (!selected) return;
    setPreset(code);
    setPlain(selected.plaintext);
    setCipher(selected.encrypted.join(","));
  };

  return (
    <div className="space-y-6">
      <div className="ls-card p-5">
        <div className="mb-4 flex items-center gap-2">
          <Key className="h-5 w-5 text-primary" />
          <h2 className="text-base font-black text-foreground">
            IOP Password Generator
          </h2>
        </div>

        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center">
          <label
            htmlFor="preset"
            className="text-xs font-semibold uppercase text-muted-foreground sm:w-24"
          >
            Preset
          </label>
          <select
            id="preset"
            value={preset}
            onChange={(e) => handlePresetChange(e.target.value)}
            className="h-9 w-full rounded-lg border border-[var(--border)] bg-[#0b1120] px-2.5 text-sm text-foreground outline-none focus-visible:border-ring sm:w-80"
          >
            {iopPasswordPresets.map((p) => (
              <option key={p.code} value={p.code}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <div className="space-y-4 rounded-lg border border-[var(--border)] bg-[#0b1120]/40 p-4">
            <div className="flex items-center gap-2 text-sm font-bold text-foreground">
              <Lock className="h-4 w-4 text-primary" />
              Encrypt
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="plain"
                className="text-xs font-semibold uppercase text-muted-foreground"
              >
                Plaintext Password
              </label>
              <Input
                id="plain"
                value={plain}
                onChange={(e) => setPlain(e.target.value)}
                placeholder="Enter password (max 20 bytes)"
                className="h-10 border-2 border-[var(--border)] bg-[#0b1120] px-3"
              />
              <p className="text-xs text-muted-foreground">
                Only the first {MAX_PASSWORD} bytes are used, matching
                MAX_PASSWORD in the client source.
              </p>
            </div>

            <OutputField label="Signed C++ Array" value={cppArray} />
            <OutputField label="Signed CSV" value={signedCsv} />
            <OutputField label="Hex Bytes" value={hexString} />
          </div>

          <div className="space-y-4 rounded-lg border border-[var(--border)] bg-[#0b1120]/40 p-4">
            <div className="flex items-center gap-2 text-sm font-bold text-foreground">
              <Unlock className="h-4 w-4 text-primary" />
              Decrypt
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="cipher"
                className="text-xs font-semibold uppercase text-muted-foreground"
              >
                Encrypted Bytes
              </label>
              <textarea
                id="cipher"
                value={cipher}
                onChange={(e) => setCipher(e.target.value)}
                placeholder="Paste signed decimals, unsigned decimals, or hex bytes separated by commas or spaces"
                rows={4}
                className="w-full rounded-lg border-2 border-[var(--border)] bg-[#0b1120] px-3 py-2 text-sm font-mono text-foreground outline-none focus-visible:border-ring"
              />
              <p className="text-xs text-muted-foreground">
                Accepts comma or whitespace separated signed decimals, unsigned
                decimals, or hex values.
              </p>
            </div>

            <OutputField label="Decrypted Password" value={decrypted} />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-[var(--border)] bg-[#0b1120]/50 p-4 text-xs leading-5 text-muted-foreground">
        <p className="mb-1 font-semibold text-foreground">How it works</p>
        <p>
          The client stores .iop archive passwords as encrypted char arrays. The
          same XOR transform is used for both encryption and decryption, so any
          plaintext run through it twice returns the original input. This tool
          matches the <code>ioLocalManagerParent::EncryptDecryptData</code>{" "}
          algorithm with{" "}
          <code>bPassword = true</code>.
        </p>
      </div>
    </div>
  );
}

