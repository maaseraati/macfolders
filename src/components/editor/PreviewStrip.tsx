"use client";

import * as React from "react";
import type Konva from "konva";
import { STAGE_SIZE } from "@/lib/folder-paths";

const SIZES = [512, 128, 32, 16] as const;

/** Visual on-screen sizes for each preview tile (kept compact, single row). */
const DISPLAY: Record<(typeof SIZES)[number], number> = {
  512: 96,
  128: 64,
  32: 40,
  16: 24,
};

interface PreviewStripProps {
  stage: Konva.Stage | null;
  stageVersion: number;
}

export function PreviewStrip({ stage, stageVersion }: PreviewStripProps) {
  const [previews, setPreviews] = React.useState<Record<number, string>>({});

  React.useEffect(() => {
    if (!stage) return;
    let cancelled = false;
    const id = window.requestAnimationFrame(() => {
      const map: Record<number, string> = {};
      for (const size of SIZES) {
        try {
          const url = stage.toDataURL({
            pixelRatio: size / STAGE_SIZE,
            mimeType: "image/png",
          });
          map[size] = url;
        } catch {
          // ignore
        }
      }
      if (!cancelled) setPreviews(map);
    });
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(id);
    };
  }, [stage, stageVersion]);

  return (
    <div className="flex items-end justify-center gap-3">
      {SIZES.map((size) => {
        const display = DISPLAY[size];
        return (
          <div key={size} className="flex flex-col items-center gap-1">
            <div
              className="checkerboard grid place-items-center overflow-hidden rounded-md ring-1 ring-black/5"
              style={{ width: display, height: display }}
            >
              {previews[size] ? (
                <img
                  src={previews[size]}
                  width={display}
                  height={display}
                  alt={`Preview ${size}`}
                  style={{ imageRendering: size <= 32 ? "pixelated" : "auto" }}
                />
              ) : null}
            </div>
            <span className="text-[10px] tabular-nums text-muted-foreground">{size}</span>
          </div>
        );
      })}
    </div>
  );
}
