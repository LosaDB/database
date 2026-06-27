"use client";

import type { ItemIcon } from "@/lib/items";

interface ItemIconProps {
  icon: ItemIcon;
  maxSize?: number;
  className?: string;
}

export function ItemIcon({ icon, maxSize = 48, className }: ItemIconProps) {
  const maxDim = Math.max(icon.width, icon.height);
  const scale = maxDim > maxSize ? maxSize / maxDim : 1;
  const scaledWidth = Math.max(1, Math.round(icon.width * scale));
  const scaledHeight = Math.max(1, Math.round(icon.height * scale));

  return (
    <div
      className={`relative overflow-hidden ${className ?? ""}`}
      style={{
        width: scaledWidth,
        height: scaledHeight,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={icon.pngUrl}
        alt={icon.name}
        loading="lazy"
        decoding="async"
        draggable={false}
        className="absolute left-0 top-0 max-w-none max-h-none"
        style={{
          marginLeft: Math.round(-icon.x * scale),
          marginTop: Math.round(-icon.y * scale),
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          imageRendering: "pixelated",
        }}
      />
    </div>
  );
}
