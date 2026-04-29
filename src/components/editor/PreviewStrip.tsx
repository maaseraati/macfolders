"use client";

import * as React from "react";
import type Konva from "konva";
import { STAGE_SIZE } from "@/lib/folder-paths";

const SIZES = [512, 128, 32, 16];

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
    <div className="flex flex-wrap items-end justify-center gap-4">
      {SIZES.map((size) => (
        <div key={size} className="flex flex-col items-center gap-1">
          <div
            className="checkerboard rounded-md border border-border/40"
            style={{ width: size, height: size, maxWidth: 256 }}
          >
            {previews[size] ? (
              <img
                src={previews[size]}
                width={Math.min(size, 256)}
                height={Math.min(size, 256)}
                alt={`Preview ${size}`}
                className="rounded-md"
                style={{ imageRendering: size <= 32 ? "pixelated" : "auto" }}
              />
            ) : null}
          </div>
          <span className="text-[10px] text-muted-foreground">{size}px</span>
        </div>
      ))}
    </div>
  );
}
