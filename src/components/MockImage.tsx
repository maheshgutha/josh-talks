import { useId } from "react";
import type { PaletteKind, ProductKind } from "@/data";

/** Colour sets for the three visual styles. */
const palettes: Record<PaletteKind, { bg1: string; bg2: string; glow: string; accent: string; prod: string; prod2: string; ink: string }> = {
  warm: { bg1: "#431407", bg2: "#ea580c", glow: "#fde68a", accent: "#fbbf24", prod: "#b45309", prod2: "#fcd34d", ink: "#fff7ed" },
  modern: { bg1: "#2e1065", bg2: "#7c3aed", glow: "#e9d5ff", accent: "#fbbf24", prod: "#facc15", prod2: "#fef3c7", ink: "#faf5ff" },
  royal: { bg1: "#4c0519", bg2: "#be123c", glow: "#fecdd3", accent: "#fcd34d", prod: "#d97706", prod2: "#fde68a", ink: "#fff1f2" },
};

interface Props {
  product: ProductKind;
  palette: PaletteKind;
  className?: string;
  /** Hide the small "text space" guide so landing visuals stay abstract */
  label?: string;
}

/** Draws a simple, original product scene in SVG so the prototype needs no external images. */
export function MockImage({ product, palette, className, label }: Props) {
  const uid = useId().replace(/:/g, "");
  const p = palettes[palette];

  return (
    <svg
      viewBox="0 0 400 300"
      className={className}
      role="img"
      aria-label={label ?? `AI-generated style mock image of a ${product} advertisement`}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id={`bg-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={p.bg1} />
          <stop offset="1" stopColor={p.bg2} />
        </linearGradient>
        <radialGradient id={`glow-${uid}`} cx="0.65" cy="0.62" r="0.55">
          <stop offset="0" stopColor={p.glow} stopOpacity="0.85" />
          <stop offset="1" stopColor={p.glow} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`prod-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.prod2} />
          <stop offset="1" stopColor={p.prod} />
        </linearGradient>
      </defs>

      <rect width="400" height="300" fill={`url(#bg-${uid})`} />
      <rect width="400" height="300" fill={`url(#glow-${uid})`} />

      {/* soft bokeh lights, like fairy lights in the background */}
      {[
        [40, 40, 9], [90, 70, 6], [150, 30, 7], [215, 55, 5], [280, 28, 8], [340, 62, 6], [372, 30, 5],
        [30, 130, 5], [372, 120, 7],
      ].map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill={p.accent} opacity={0.35 + (i % 3) * 0.15} />
      ))}

      {/* subtle floor line */}
      <ellipse cx="270" cy="262" rx="110" ry="16" fill="#000" opacity="0.22" />

      <g transform="translate(150 0)">{renderProduct(product, p, uid)}</g>

      {/* clean space marker for brand text */}
      <rect x="22" y="104" width="110" height="9" rx="4.5" fill={p.ink} opacity="0.85" />
      <rect x="22" y="122" width="82" height="6" rx="3" fill={p.ink} opacity="0.5" />
      <rect x="22" y="148" width="56" height="18" rx="9" fill={p.accent} />
    </svg>
  );
}

function renderProduct(kind: ProductKind, p: (typeof palettes)[PaletteKind], uid: string) {
  const fill = `url(#prod-${uid})`;
  switch (kind) {
    case "diya":
      return (
        <g>
          {/* gift box */}
          <rect x="30" y="150" width="170" height="100" rx="10" fill={fill} />
          <rect x="22" y="132" width="186" height="30" rx="8" fill={p.prod2} />
          <rect x="105" y="132" width="20" height="118" fill={p.bg1} opacity="0.55" />
          <path d="M115 132 C90 100 70 118 115 132 C160 118 140 100 115 132Z" fill={p.accent} />
          {/* diyas */}
          {[60, 115, 170].map((x, i) => (
            <g key={x} transform={`translate(${x} ${i === 1 ? 218 : 224})`}>
              <path d="M-24 0 Q0 26 24 0 Z" fill={p.bg1} stroke={p.accent} strokeWidth="2" />
              <path d="M0 -4 C-8 -20 0 -30 0 -38 C8 -26 8 -14 0 -4Z" fill="#fde047" />
              <ellipse cx="0" cy="-12" rx="9" ry="14" fill="#fb923c" opacity="0.35" />
            </g>
          ))}
        </g>
      );
    case "kurta":
      return (
        <g>
          <path d="M20 90 H210" stroke={p.accent} strokeWidth="5" strokeLinecap="round" />
          <path d="M115 90 V80" stroke={p.accent} strokeWidth="4" />
          <path
            d="M70 96 L115 108 L160 96 L206 138 L186 162 L168 148 L172 250 H58 L62 148 L44 162 L24 138 Z"
            fill={fill}
          />
          <path d="M115 108 V176" stroke={p.bg1} strokeWidth="3" opacity="0.5" />
          {[124, 140, 156].map((y) => (
            <circle key={y} cx="115" cy={y} r="3.2" fill={p.accent} />
          ))}
          <path d="M70 250 H160" stroke={p.accent} strokeWidth="4" strokeDasharray="4 5" />
        </g>
      );
    case "mithai":
      return (
        <g>
          {[
            [75, 150, "#f59e0b"], [115, 138, "#fef3c7"], [155, 150, "#fb7185"],
            [95, 172, "#34d399"], [135, 172, "#f59e0b"],
          ].map(([cx, cy, c], i) => (
            <g key={i}>
              <circle cx={cx as number} cy={cy as number} r="20" fill={c as string} />
              <circle cx={(cx as number) - 6} cy={(cy as number) - 6} r="6" fill="#fff" opacity="0.35" />
            </g>
          ))}
          <path d="M40 180 H190 L172 252 H58 Z" fill={fill} />
          <path d="M48 200 H182 M52 222 H178" stroke={p.bg1} strokeWidth="2" opacity="0.45" />
          <path d="M60 180 C70 110 160 110 170 180" fill="none" stroke={p.accent} strokeWidth="5" />
        </g>
      );
    case "rangoli":
      return (
        <g transform="translate(115 170)">
          {Array.from({ length: 12 }).map((_, i) => (
            <ellipse
              key={i}
              rx="12"
              ry="42"
              cy="-42"
              fill={["#fb7185", "#fbbf24", "#34d399", "#60a5fa"][i % 4]}
              transform={`rotate(${i * 30})`}
              opacity="0.95"
            />
          ))}
          <circle r="26" fill={p.bg1} />
          <circle r="16" fill={p.accent} />
          <circle r="6" fill={p.bg1} />
          {[-1, 1].map((s) => (
            <g key={s} transform={`translate(${s * 92} 72)`}>
              <path d="M-14 -10 H14 L10 12 H-10 Z" fill={fill} />
              <ellipse cy="-10" rx="14" ry="4" fill={s === 1 ? "#fb7185" : "#fbbf24"} />
            </g>
          ))}
        </g>
      );
    case "banner":
      return (
        <g>
          <path d="M55 120 H175 L185 250 H45 Z" fill={fill} />
          <path d="M85 120 C85 76 145 76 145 120" fill="none" stroke={p.accent} strokeWidth="7" strokeLinecap="round" />
          <circle cx="115" cy="185" r="30" fill={p.bg1} opacity="0.85" />
          <path d="M115 166 L121 180 L136 182 L125 192 L128 207 L115 199 L102 207 L105 192 L94 182 L109 180 Z" fill={p.accent} />
          {[[30, 100], [200, 110], [205, 220], [28, 230]].map(([x, y], i) => (
            <path key={i} d={`M${x} ${y - 10} L${x + 3} ${y - 3} L${x + 10} ${y} L${x + 3} ${y + 3} L${x} ${y + 10} L${x - 3} ${y + 3} L${x - 10} ${y} L${x - 3} ${y - 3}Z`} fill={p.accent} />
          ))}
        </g>
      );
  }
}
