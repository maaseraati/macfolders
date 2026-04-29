import {
  FOLDER_BACK_PATH,
  FOLDER_FRONT_HIGHLIGHT,
  FOLDER_FRONT_PATH,
  FOLDER_VIEWBOX,
} from "@/lib/folder-paths";
import { shadeHex } from "@/lib/utils";

interface FolderSvgProps {
  baseColor: string;
  className?: string;
  emoji?: string;
  size?: number | string;
  label?: string;
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
}: FolderSvgProps) {
  const dark = shadeHex(baseColor, -16);
  const darker = shadeHex(baseColor, -28);
  const light = shadeHex(baseColor, 8);
  const mid = shadeHex(baseColor, -2);
  const front = shadeHex(baseColor, -14);
  const rim = shadeHex(baseColor, 22);
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
      <g filter={`url(#shadow-${id})`}>
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
          strokeWidth={2}
          fill="none"
          opacity={0.6}
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}
