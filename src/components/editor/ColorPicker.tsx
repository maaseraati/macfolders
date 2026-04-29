"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const SWATCHES = [
  "#5BB0FF", "#7AB8FF", "#9CC6FF", "#7F8CFF", "#B97AFF",
  "#FF7AB6", "#FF6BC1", "#FF5B6E", "#FF6E6E", "#FF7A45",
  "#FFB347", "#FFD86B", "#E8C77A", "#69C28A", "#5DCB8A",
  "#5DD4C4", "#5DC1FF", "#9B9FB0", "#3A3F50", "#2A2D3A",
];

interface ColorPickerProps {
  value: string;
  onChange: (hex: string) => void;
  label?: string;
}

export function ColorPicker({ value, onChange, label }: ColorPickerProps) {
  return (
    <div className="space-y-2">
      {label ? <Label>{label}</Label> : null}
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-9 cursor-pointer rounded border border-input bg-transparent p-0"
          aria-label={label ?? "Pick color"}
        />
        <Input
          value={value.toUpperCase()}
          onChange={(e) => {
            const v = e.target.value;
            if (/^#?[0-9a-f]{0,6}$/i.test(v)) {
              onChange(v.startsWith("#") ? v : `#${v}`);
            }
          }}
          className="font-mono uppercase"
        />
      </div>
      <div className="grid grid-cols-10 gap-1.5">
        {SWATCHES.map((c) => (
          <button
            key={c}
            type="button"
            aria-label={c}
            className="h-6 w-6 rounded-full border border-border/40 ring-offset-background transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            style={{ background: c }}
            onClick={() => onChange(c)}
          />
        ))}
      </div>
    </div>
  );
}
