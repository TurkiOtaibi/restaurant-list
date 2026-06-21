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
  ["#6B5FB5", "#E57A4C", "#101822"]
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

  return (
    <span
      aria-hidden="true"
      className={cx("ds-artwork", `ds-artwork--${variant}`, className)}
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
