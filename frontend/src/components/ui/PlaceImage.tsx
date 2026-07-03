"use client";

import { useEffect, useState } from "react";

import type { Place } from "@/lib/api";
import { cx } from "@/lib/ui";

import { PlaceTypeIcon } from "./PlaceTypeIcon";

type PlaceImageProps = {
  className?: string;
  imageUrl: string | null;
  type: Place["type"];
};

export function PlaceImage({ className, imageUrl, type }: PlaceImageProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [imageUrl]);

  if (!imageUrl || failed) {
    return <PlaceTypeIcon className={className} type={type} />;
  }

  return (
    <span className={cx("ds-place-image", className)} aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element -- User-uploaded storage URLs are configured at deploy time and require direct onError fallback. */}
      <img
        alt=""
        decoding="async"
        loading="lazy"
        onError={() => setFailed(true)}
        src={imageUrl}
      />
    </span>
  );
}
