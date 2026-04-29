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

export function FolderBack({ baseColor }: FolderProps) {
  const dark = shadeHex(baseColor, -16);
  const darker = shadeHex(baseColor, -28);
  return (
    <Group listening={false}>
      <Path
        data={FOLDER_BACK_PATH}
        fillLinearGradientStartPoint={{ x: 0, y: 196 }}
        fillLinearGradientEndPoint={{ x: 0, y: 408 }}
        fillLinearGradientColorStops={[0, dark, 1, darker]}
        shadowColor="#000000"
        shadowBlur={32}
        shadowOpacity={0.35}
        shadowOffsetY={18}
      />
    </Group>
  );
}

export function FolderFront({ baseColor }: FolderProps) {
  const light = shadeHex(baseColor, 8);
  const mid = shadeHex(baseColor, -2);
  const dark = shadeHex(baseColor, -14);
  const rim = shadeHex(baseColor, 22);
  return (
    <Group listening={false}>
      <Path
        data={FOLDER_FRONT_PATH}
        fillLinearGradientStartPoint={{ x: 0, y: 372 }}
        fillLinearGradientEndPoint={{ x: 0, y: 868 }}
        fillLinearGradientColorStops={[0, light, 0.55, mid, 1, dark]}
        shadowColor="#000000"
        shadowBlur={48}
        shadowOpacity={0.25}
        shadowOffsetY={26}
      />
      {/* Top rim highlight */}
      <Path
        data={FOLDER_FRONT_HIGHLIGHT}
        stroke={rim}
        strokeWidth={2}
        opacity={0.6}
        lineCap="round"
      />
    </Group>
  );
}
