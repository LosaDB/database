"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ImageOff } from "lucide-react";

interface ImageFallbackProps {
  srcs: string[];
  alt: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  lazy?: boolean;
  objectFit?: "contain" | "cover";
}

export function ImageFallback({
  srcs,
  alt,
  className,
  fill,
  width,
  height,
  sizes,
  priority,
  lazy = true,
  objectFit = "contain",
}: ImageFallbackProps) {
  const [index, setIndex] = useState(0);
  const [allFailed, setAllFailed] = useState(false);

  const candidates = srcs.filter(
    (s, i, arr) => s && typeof s === "string" && arr.indexOf(s) === i
  );

  if (allFailed || index >= candidates.length || candidates.length === 0) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-1 bg-muted/30 text-muted-foreground",
          className
        )}
      >
        <ImageOff className="h-6 w-6 opacity-60" />
        <span className="sr-only">{alt} unavailable</span>
      </div>
    );
  }

  const handleError = () => {
    if (index + 1 >= candidates.length) {
      setAllFailed(true);
    } else {
      setIndex((prev) => prev + 1);
    }
  };

  if (fill) {
    return (
      <Image
        src={candidates[index]}
        alt={alt}
        fill
        className={cn(`object-${objectFit}`, className)}
        sizes={sizes}
        priority={priority}
        loading={priority ? "eager" : lazy ? "lazy" : "eager"}
        onError={handleError}
      />
    );
  }

  return (
    <Image
      src={candidates[index]}
      alt={alt}
      width={width ?? 64}
      height={height ?? 64}
      className={cn(`object-${objectFit}`, className)}
      sizes={sizes}
      priority={priority}
      loading={priority ? "eager" : lazy ? "lazy" : "eager"}
      onError={handleError}
    />
  );
}
