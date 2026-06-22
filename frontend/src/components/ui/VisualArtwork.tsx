import type { CSSProperties } from "react";

import type { Place } from "@/lib/api";
import { cx } from "@/lib/ui";

type VisualArtworkProps = {
  className?: string;
  id: string;
  label?: string;
  type?: Place["type"];
  variant?: "list" | "place" | "mini";
};

const palettes = [
  ["#A84231", "#F2B95A", "#101822"],
  ["#2E8B61", "#E0BE54", "#0C121B"],
  ["#4D73B5", "#F58A43", "#101822"],
  ["#2D6E82", "#C48948", "#111923"],
  ["#A95E34", "#F1D16F", "#141B24"],
  ["#6B5FB5", "#E57A4C", "#101822"],
  ["#7A3D5C", "#6DD0A3", "#111923"],
  ["#36664C", "#F2D06B", "#0D141E"],
  ["#933B2F", "#8CCB7A", "#111923"],
  ["#315A8A", "#E9A84E", "#0C121B"]
];

export function VisualArtwork({
  className,
  id,
  label,
  type,
  variant = "place"
}: VisualArtworkProps) {
  const seed = stableHash(`${type ?? "list"}:${id}:${label ?? ""}`);
  const palette = palettes[seed % palettes.length];
  const pattern = seed % 4;
  const initial = artworkInitial(label);

  return (
    <span
      aria-hidden="true"
      className={cx(
        "ds-artwork",
        `ds-artwork--${variant}`,
        `ds-artwork--pattern-${pattern}`,
        className
      )}
      style={
        {
          "--art-a": palette[0],
          "--art-b": palette[1],
          "--art-c": palette[2],
          "--art-shift": `${seed % 23}px`
        } as CSSProperties
      }
    >
      <span className="ds-artwork__base" />
      <span className="ds-artwork__shape ds-artwork__shape--a" />
      <span className="ds-artwork__shape ds-artwork__shape--b" />
      <span className="ds-artwork__shadow" />
      {initial ? <span className="ds-artwork__initial">{initial}</span> : null}
    </span>
  );
}

function stableHash(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function artworkInitial(label?: string): string | null {
  const value = label?.trim();
  if (!value) {
    return null;
  }

  return Array.from(value)[0]?.toUpperCase() ?? null;
}
