import type { HexagramIdentity } from "@/features/divination/types";

interface HexagramGlyphProps {
  lines: HexagramIdentity["lines"];
  name: string;
  movingLines?: readonly number[];
  size?: "default" | "compact";
}

export function HexagramGlyph({
  lines,
  name,
  movingLines = [],
  size = "default",
}: HexagramGlyphProps) {
  return (
    <div
      className={`hexagram-glyph hexagram-glyph-${size}`}
      role="img"
      aria-label={`${name}六爻图${movingLines.length ? `，第${movingLines.join("、")}爻为动爻` : ""}`}
    >
      {[...lines].reverse().map((line, visualIndex) => {
        const position = lines.length - visualIndex;
        const moving = movingLines.includes(position);

        return (
          <span className={`glyph-line ${line === 1 ? "yang-line" : "yin-line"}${moving ? " moving-line" : ""}`} key={position}>
            {line === 1 ? <i /> : <><i /><i /></>}
            {moving && <b aria-hidden="true" />}
          </span>
        );
      })}
    </div>
  );
}
