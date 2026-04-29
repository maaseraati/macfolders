"use client";

import { Path, Group } from "react-konva";
import { shadeHex } from "@/lib/utils";
import {
  FOLDER_BACK_PATH,
  FOLDER_FRONT_HIGHLIGHT,
  FOLDER_FRONT_PATH,
} from "@/lib/folder-paths";

interface FolderProps {
  baseColor: string;
}

export function backStops(baseColor: string): [number, string, number, string] {
  return [0, shadeHex(baseColor, -16), 1, shadeHex(baseColor, -28)];
}

export function frontStops(
  baseColor: string
): [number, string, number, string, number, string] {
  return [
    0,
    shadeHex(baseColor, 8),
    0.55,
    shadeHex(baseColor, -2),
    1,
    shadeHex(baseColor, -14),
  ];
}

export function FolderBack({ baseColor }: FolderProps) {
  return (
    <Group listening={false}>
      <Path
        name="folder-back"
        data={FOLDER_BACK_PATH}
        fillLinearGradientStartPoint={{ x: 0, y: 196 }}
        fillLinearGradientEndPoint={{ x: 0, y: 408 }}
        fillLinearGradientColorStops={backStops(baseColor)}
        shadowColor="#000000"
        shadowBlur={32}
        shadowOpacity={0.35}
        shadowOffsetY={18}
      />
    </Group>
  );
}

export function FolderFront({ baseColor }: FolderProps) {
  const rim = shadeHex(baseColor, 22);
  return (
    <Group listening={false}>
      <Path
        name="folder-front"
        data={FOLDER_FRONT_PATH}
        fillLinearGradientStartPoint={{ x: 0, y: 372 }}
        fillLinearGradientEndPoint={{ x: 0, y: 868 }}
        fillLinearGradientColorStops={frontStops(baseColor)}
        shadowColor="#000000"
        shadowBlur={48}
        shadowOpacity={0.25}
        shadowOffsetY={26}
      />
      {/* Top rim highlight */}
      <Path
        name="folder-rim"
        data={FOLDER_FRONT_HIGHLIGHT}
        stroke={rim}
        strokeWidth={2}
        opacity={0.6}
        lineCap="round"
      />
    </Group>
  );
}
