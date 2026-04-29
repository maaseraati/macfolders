import {
  FOLDER_BACK_PATH,
  FOLDER_FRONT_HIGHLIGHT,
  FOLDER_FRONT_PATH,
  FOLDER_VIEWBOX,
} from "@/lib/folder-paths";
import { shadeHex } from "@/lib/utils";
import {
  DEFAULT_FOLDER_SETTINGS,
  type FolderSettings,
} from "@/lib/types";

interface FolderSvgProps {
  baseColor: string;
  className?: string;
  emoji?: string;
  size?: number | string;
  label?: string;
  settings?: Partial<FolderSettings>;
}

export function renderFolderSvgMarkup({
  baseColor,
  emoji,
  label,
  settings,
}: Omit<FolderSvgProps, "className" | "size">): string {
  const s = { ...DEFAULT_FOLDER_SETTINGS, ...settings };
  const shadeWith = (percent: number) =>
    shadeHex(baseColor, percent * s.gradientStrength + s.brightness);
  const dark = s.style === "glass" ? shadeWith(28) : s.style === "soft" ? shadeWith(4) : shadeWith(-16);
  const darker = s.style === "flat" ? shadeWith(-10) : s.style === "glass" ? shadeWith(-12) : s.style === "soft" ? shadeWith(-18) : shadeWith(-28);
  const light = s.style === "glass" ? shadeWith(42) : s.style === "soft" ? shadeWith(18) : s.style === "flat" ? shadeWith(-2) : shadeWith(8);
  const mid = s.style === "glass" ? shadeWith(8) : s.style === "soft" ? shadeWith(4) : s.style === "flat" ? shadeWith(-2) : shadeWith(-2);
  const front = s.style === "flat" ? shadeWith(-2) : s.style === "soft" ? shadeWith(-8) : shadeWith(-14);
  const rim = s.outlineEnabled ? s.outlineColor : shadeHex(baseColor, 22 + s.brightness);
  const safeLabel = escapeXml(label ?? "Folder preview");
  const safeEmoji = emoji ? escapeXml(emoji) : "";
  const outline = s.outlineEnabled
    ? `<path d="${FOLDER_BACK_PATH}" fill="none" stroke="${s.outlineColor}" stroke-width="${s.outlineWidth}"/><path d="${FOLDER_FRONT_PATH}" fill="none" stroke="${s.outlineColor}" stroke-width="${s.outlineWidth}"/>`
    : "";
  const emojiMarkup = safeEmoji
    ? `<text x="${FOLDER_VIEWBOX / 2}" y="620" text-anchor="middle" dominant-baseline="middle" font-size="360">${safeEmoji}</text>`
    : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 ${FOLDER_VIEWBOX} ${FOLDER_VIEWBOX}" role="img" aria-label="${safeLabel}"><defs><linearGradient id="back" x1="0" y1="196" x2="0" y2="408" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="${dark}"/><stop offset="100%" stop-color="${darker}"/></linearGradient><linearGradient id="front" x1="0" y1="372" x2="0" y2="868" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="${light}"/><stop offset="55%" stop-color="${mid}"/><stop offset="100%" stop-color="${front}"/></linearGradient><filter id="shadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="${s.shadowOffsetY}" stdDeviation="${s.shadowBlur}" flood-opacity="${s.shadowOpacity}"/></filter></defs><g ${s.shadowEnabled ? 'filter="url(#shadow)"' : ""} opacity="${s.opacity}">${outline}<path d="${FOLDER_BACK_PATH}" fill="url(#back)"/>${emojiMarkup}<path d="${FOLDER_FRONT_PATH}" fill="url(#front)"/><path d="${FOLDER_FRONT_HIGHLIGHT}" stroke="${rim}" stroke-width="${s.outlineEnabled ? Math.max(2, s.outlineWidth * 0.7) : 2}" fill="none" opacity="${s.style === "flat" ? 0.35 : 0.6}" stroke-linecap="round"/></g></svg>`;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Lightweight static SVG folder used on the landing page, templates grid,
 * and project thumbnails. Mirrors the rendering used by the Konva editor.
 */
export function FolderSvg({
  baseColor,
  className,
  emoji,
  size = 320,
  label,
  settings,
}: FolderSvgProps) {
  const s = { ...DEFAULT_FOLDER_SETTINGS, ...settings };
  const shadeWith = (percent: number) =>
    shadeHex(baseColor, percent * s.gradientStrength + s.brightness);
  const dark = s.style === "glass" ? shadeWith(28) : s.style === "soft" ? shadeWith(4) : shadeWith(-16);
  const darker = s.style === "flat" ? shadeWith(-10) : s.style === "glass" ? shadeWith(-12) : s.style === "soft" ? shadeWith(-18) : shadeWith(-28);
  const light = s.style === "glass" ? shadeWith(42) : s.style === "soft" ? shadeWith(18) : s.style === "flat" ? shadeWith(-2) : shadeWith(8);
  const mid = s.style === "glass" ? shadeWith(8) : s.style === "soft" ? shadeWith(4) : s.style === "flat" ? shadeWith(-2) : shadeWith(-2);
  const front = s.style === "flat" ? shadeWith(-2) : s.style === "soft" ? shadeWith(-8) : shadeWith(-14);
  const rim = s.outlineEnabled ? s.outlineColor : shadeHex(baseColor, 22 + s.brightness);
  const id = baseColor.replace("#", "");

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox={`0 0 ${FOLDER_VIEWBOX} ${FOLDER_VIEWBOX}`}
      role="img"
      aria-label={label ?? "Folder preview"}
    >
      <defs>
        <linearGradient id={`back-${id}`} x1="0" y1="196" x2="0" y2="408" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={dark} />
          <stop offset="100%" stopColor={darker} />
        </linearGradient>
        <linearGradient id={`front-${id}`} x1="0" y1="372" x2="0" y2="868" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={light} />
          <stop offset="55%" stopColor={mid} />
          <stop offset="100%" stopColor={front} />
        </linearGradient>
        <filter id={`shadow-${id}`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="20" stdDeviation="22" floodOpacity="0.35" />
        </filter>
      </defs>
      <g filter={s.shadowEnabled ? `url(#shadow-${id})` : undefined} opacity={s.opacity}>
        {s.outlineEnabled ? (
          <>
            <path
              d={FOLDER_BACK_PATH}
              fill="none"
              stroke={s.outlineColor}
              strokeWidth={s.outlineWidth}
            />
            <path
              d={FOLDER_FRONT_PATH}
              fill="none"
              stroke={s.outlineColor}
              strokeWidth={s.outlineWidth}
            />
          </>
        ) : null}
        <path d={FOLDER_BACK_PATH} fill={`url(#back-${id})`} />
        {emoji ? (
          <text
            x={FOLDER_VIEWBOX / 2}
            y={620}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={360}
          >
            {emoji}
          </text>
        ) : null}
        <path d={FOLDER_FRONT_PATH} fill={`url(#front-${id})`} />
        <path
          d={FOLDER_FRONT_HIGHLIGHT}
          stroke={rim}
          strokeWidth={s.outlineEnabled ? Math.max(2, s.outlineWidth * 0.7) : 2}
          fill="none"
          opacity={s.style === "flat" ? 0.35 : 0.6}
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}
