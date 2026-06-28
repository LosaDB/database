"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  convertToGameServerID,
  convertServerIDToAddress,
  isValidIP,
  isValidPort,
} from "@/lib/server-id";
import { Server, ArrowLeftRight, Copy, Check, Trash2 } from "lucide-react";

export function ServerIdGenerator() {
  const [ip, setIp] = useState("127.0.0.1");
  const [port, setPort] = useState("14009");
  const [generatedId, setGeneratedId] = useState("");

  const [serverIdInput, setServerIdInput] = useState("");
  const [decodedIp, setDecodedIp] = useState("");
  const [decodedPort, setDecodedPort] = useState("");

  const [copiedGenerated, setCopiedGenerated] = useState(false);
  const [errorGenerate, setErrorGenerate] = useState("");
  const [errorDecode, setErrorDecode] = useState("");

  const handleGenerate = () => {
    setErrorGenerate("");

    if (!isValidIP(ip)) {
      setErrorGenerate("Please enter a valid IPv4 address.");
      return;
    }

    const portNum = parseInt(port, 10);
    if (!isValidPort(portNum)) {
      setErrorGenerate("Please enter a valid port (0-65535).");
      return;
    }

    setGeneratedId(convertToGameServerID(ip, portNum).toString());
  };

  const handleDecode = () => {
    setErrorDecode("");
    setDecodedIp("");
    setDecodedPort("");

    const trimmed = serverIdInput.trim();
    if (!trimmed) {
      setErrorDecode("Please enter a server ID.");
      return;
    }

    try {
      const id = BigInt(trimmed);
      const { ip: decodedIpAddr, port: decodedPortNum } =
        convertServerIDToAddress(id);
      setDecodedIp(decodedIpAddr);
      setDecodedPort(decodedPortNum.toString());
    } catch {
      setErrorDecode("Invalid server ID. Must be a valid 64-bit integer.");
    }
  };

  const copyGenerated = async () => {
    if (!generatedId) return;
    try {
      await navigator.clipboard.writeText(generatedId);
      setCopiedGenerated(true);
      setTimeout(() => setCopiedGenerated(false), 1500);
    } catch {
      // ignore
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Generate */}
      <section className="ls-card p-5">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-[var(--border)] bg-[#0b1120]">
            <Server className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-black text-foreground">
              Generate Server ID
            </h2>
            <p className="text-xs text-muted-foreground">
              Convert IP:Port into a 64-bit Game Server ID.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase text-muted-foreground">
              IP Address
            </label>
            <Input
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              placeholder="127.0.0.1"
              className="h-10 border-2 border-[var(--border)] bg-[#0b1120] text-sm"
            />
          </div>
          <div className="space-y-1.5 sm:w-28">
            <label className="text-xs font-bold uppercase text-muted-foreground">
              Port
            </label>
            <Input
              value={port}
              onChange={(e) => setPort(e.target.value)}
              placeholder="14009"
              inputMode="numeric"
              className="h-10 border-2 border-[var(--border)] bg-[#0b1120] text-sm"
            />
          </div>
        </div>

        {errorGenerate && (
          <p className="mt-2 text-xs font-bold text-destructive">
            {errorGenerate}
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={handleGenerate} className="gap-1">
            <ArrowLeftRight className="h-4 w-4" /> Generate
          </Button>
          <Button
            onClick={() => {
              setIp("");
              setPort("");
              setGeneratedId("");
              setErrorGenerate("");
            }}
            variant="outline"
            className="gap-1"
          >
            <Trash2 className="h-4 w-4" /> Clear
          </Button>
        </div>

        {generatedId && (
          <div className="mt-4 space-y-1.5">
            <label className="text-xs font-bold uppercase text-muted-foreground">
              Game Server ID
            </label>
            <div className="flex gap-2">
              <Input
                readOnly
                value={generatedId}
                className="h-10 flex-1 border-2 border-[var(--border)] bg-[#0b1120] text-sm"
              />
              <Button
                onClick={copyGenerated}
                variant="outline"
                size="icon"
                className="h-10 w-10 shrink-0"
              >
                {copiedGenerated ? (
                  <Check className="h-4 w-4 text-[#22c55e]" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        )}
      </section>

      {/* Decode */}
      <section className="ls-card p-5">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-[var(--border)] bg-[#0b1120]">
            <ArrowLeftRight className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-black text-foreground">
              Decode Server ID
            </h2>
            <p className="text-xs text-muted-foreground">
              Extract IP and Port from a 64-bit Game Server ID.
            </p>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase text-muted-foreground">
            Game Server ID
          </label>
          <Input
            value={serverIdInput}
            onChange={(e) => setServerIdInput(e.target.value)}
            placeholder="e.g. 6016766468753261695"
            className="h-10 border-2 border-[var(--border)] bg-[#0b1120] text-sm"
          />
        </div>

        {errorDecode && (
          <p className="mt-2 text-xs font-bold text-destructive">
            {errorDecode}
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={handleDecode} className="gap-1">
            <Server className="h-4 w-4" /> Decode
          </Button>
          <Button
            onClick={() => {
              setServerIdInput("");
              setDecodedIp("");
              setDecodedPort("");
              setErrorDecode("");
            }}
            variant="outline"
            className="gap-1"
          >
            <Trash2 className="h-4 w-4" /> Clear
          </Button>
        </div>

        {(decodedIp || decodedPort) && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-muted-foreground">
                IP Address
              </label>
              <Input
                readOnly
                value={decodedIp}
                className="h-10 border-2 border-[var(--border)] bg-[#0b1120] text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-muted-foreground">
                Port
              </label>
              <Input
                readOnly
                value={decodedPort}
                className="h-10 border-2 border-[var(--border)] bg-[#0b1120] text-sm"
              />
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
