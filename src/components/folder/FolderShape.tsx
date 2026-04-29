"use client";

import { Path, Group } from "react-konva";
import { shadeHex } from "@/lib/utils";
import {
  FOLDER_BACK_PATH,
  FOLDER_FRONT_HIGHLIGHT,
  FOLDER_FRONT_PATH,
} from "@/lib/folder-paths";
import type { FolderSettings } from "@/lib/types";

interface FolderProps {
  baseColor: string;
  settings?: FolderSettings;
}

const shadeWith = (hex: string, percent: number, settings?: FolderSettings) => {
  const gradient = settings?.gradientStrength ?? 1;
  const brightness = settings?.brightness ?? 0;
  return shadeHex(hex, percent * gradient + brightness);
};

export function backStops(
  baseColor: string,
  settings?: FolderSettings
): [number, string, number, string] {
  if (settings?.style === "flat") {
    const color = shadeWith(baseColor, -10, settings);
    return [0, color, 1, color];
  }
  if (settings?.style === "glass") {
    return [0, shadeWith(baseColor, 28, settings), 1, shadeWith(baseColor, -12, settings)];
  }
  if (settings?.style === "soft") {
    return [0, shadeWith(baseColor, 4, settings), 1, shadeWith(baseColor, -18, settings)];
  }
  return [0, shadeWith(baseColor, -16, settings), 1, shadeWith(baseColor, -28, settings)];
}

export function frontStops(
  baseColor: string,
  settings?: FolderSettings
): [number, string, number, string, number, string] {
  if (settings?.style === "flat") {
    const color = shadeWith(baseColor, -2, settings);
    return [0, color, 0.55, color, 1, color];
  }
  if (settings?.style === "glass") {
    return [
      0,
      shadeWith(baseColor, 42, settings),
      0.5,
      shadeWith(baseColor, 8, settings),
      1,
      shadeWith(baseColor, -10, settings),
    ];
  }
  if (settings?.style === "soft") {
    return [
      0,
      shadeWith(baseColor, 18, settings),
      0.55,
      shadeWith(baseColor, 4, settings),
      1,
      shadeWith(baseColor, -8, settings),
    ];
  }
  return [
    0,
    shadeWith(baseColor, 8, settings),
    0.55,
    shadeWith(baseColor, -2, settings),
    1,
    shadeWith(baseColor, -14, settings),
  ];
}

export function FolderBack({ baseColor, settings }: FolderProps) {
  const shadowEnabled = settings?.shadowEnabled ?? true;
  return (
    <Group listening={false}>
      {settings?.outlineEnabled ? (
        <Path
          data={FOLDER_BACK_PATH}
          stroke={settings.outlineColor}
          strokeWidth={settings.outlineWidth}
          opacity={Math.min(0.8, settings.opacity)}
        />
      ) : null}
      <Path
        name="folder-back"
        data={FOLDER_BACK_PATH}
        fillLinearGradientStartPoint={{ x: 0, y: 196 }}
        fillLinearGradientEndPoint={{ x: 0, y: 408 }}
        fillLinearGradientColorStops={backStops(baseColor, settings)}
        opacity={settings?.opacity ?? 1}
        shadowColor="#000000"
        shadowBlur={shadowEnabled ? settings?.shadowBlur ?? 32 : 0}
        shadowOpacity={shadowEnabled ? settings?.shadowOpacity ?? 0.35 : 0}
        shadowOffsetY={shadowEnabled ? settings?.shadowOffsetY ?? 18 : 0}
      />
    </Group>
  );
}

export function FolderFront({ baseColor, settings }: FolderProps) {
  const rim = settings?.outlineEnabled
    ? settings.outlineColor
    : shadeHex(baseColor, 22 + (settings?.brightness ?? 0));
  const shadowEnabled = settings?.shadowEnabled ?? true;
  return (
    <Group listening={false}>
      {settings?.outlineEnabled ? (
        <Path
          data={FOLDER_FRONT_PATH}
          stroke={settings.outlineColor}
          strokeWidth={settings.outlineWidth}
          opacity={Math.min(0.85, settings.opacity)}
        />
      ) : null}
      <Path
        name="folder-front"
        data={FOLDER_FRONT_PATH}
        fillLinearGradientStartPoint={{ x: 0, y: 372 }}
        fillLinearGradientEndPoint={{ x: 0, y: 868 }}
        fillLinearGradientColorStops={frontStops(baseColor, settings)}
        opacity={settings?.opacity ?? 1}
        shadowColor="#000000"
        shadowBlur={shadowEnabled ? Math.round((settings?.shadowBlur ?? 32) * 1.5) : 0}
        shadowOpacity={shadowEnabled ? Math.min((settings?.shadowOpacity ?? 0.35) * 0.72, 0.45) : 0}
        shadowOffsetY={shadowEnabled ? Math.round((settings?.shadowOffsetY ?? 18) * 1.45) : 0}
      />
      <Path
        name="folder-rim"
        data={FOLDER_FRONT_HIGHLIGHT}
        stroke={rim}
        strokeWidth={settings?.outlineEnabled ? Math.max(2, settings.outlineWidth * 0.7) : 2}
        opacity={settings?.style === "flat" ? 0.35 : 0.6}
        lineCap="round"
      />
    </Group>
  );
}
