"use client";

import * as React from "react";
import { Pipette } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { liveColor } from "@/lib/live-color";

const SWATCHES = [
  "#5BB0FF", "#7AB8FF", "#9CC6FF", "#7F8CFF", "#B97AFF",
  "#FF7AB6", "#FF6BC1", "#FF5B6E", "#FF6E6E", "#FF7A45",
  "#FFB347", "#FFD86B", "#E8C77A", "#69C28A", "#5DCB8A",
  "#5DD4C4", "#5DC1FF", "#9B9FB0", "#3A3F50", "#1B1D26",
];

interface ColorPickerProps {
  value: string;
  onChange: (hex: string) => void;
  label?: string;
}

interface EyeDropperResult {
  sRGBHex: string;
}
interface EyeDropperConstructor {
  new (): { open: () => Promise<EyeDropperResult> };
}

export function ColorPicker({ value, onChange, label }: ColorPickerProps) {
  const [text, setText] = React.useState(value.toUpperCase());
  const [mounted, setMounted] = React.useState(false);
  const lastHexRef = React.useRef(value);

  React.useEffect(() => {
    setText(value.toUpperCase());
    lastHexRef.current = value;
  }, [value]);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // While the native picker is open we publish to the liveColor channel —
  // this updates the Konva folder paths imperatively, bypassing React.
  const live = (hex: string) => {
    lastHexRef.current = hex;
    liveColor.emit(hex);
  };

  const commit = (hex: string) => {
    onChange(hex);
  };

  const eyedropperAvailable =
    mounted && typeof window !== "undefined" && "EyeDropper" in window;

  const pickWithEyedropper = async () => {
    if (!eyedropperAvailable) return;
    try {
      const Ctor = (window as unknown as { EyeDropper: EyeDropperConstructor })
        .EyeDropper;
      const ed = new Ctor();
      const result = await ed.open();
      commit(result.sRGBHex);
    } catch {
      // user cancelled — no-op
    }
  };

  return (
    <div className="space-y-3">
      {label ? <Label className="text-xs font-medium text-neutral-700">{label}</Label> : null}

      <div className="flex items-center gap-2 rounded-xl border border-black/5 bg-neutral-50 p-1.5">
        <label className="relative grid h-9 w-9 cursor-pointer place-items-center overflow-hidden rounded-xl ring-1 ring-black/5">
          <span
            aria-hidden
            className="absolute inset-0"
            style={{ background: value }}
          />
          <input
            type="color"
            value={value}
            onChange={(e) => live(e.target.value)}
            onBlur={() => commit(lastHexRef.current)}
            className="absolute inset-0 cursor-pointer opacity-0"
            aria-label={label ?? "Pick color"}
          />
        </label>

        <Input
          value={text}
          onChange={(e) => {
            const v = e.target.value;
            setText(v);
            if (/^#?[0-9a-f]{6}$/i.test(v)) {
              commit(v.startsWith("#") ? v : `#${v}`);
            }
          }}
          onBlur={() => setText(value.toUpperCase())}
          className="h-9 border-0 bg-transparent font-mono uppercase shadow-none focus-visible:ring-0"
          maxLength={7}
        />

        {eyedropperAvailable ? (
          <button
            type="button"
            aria-label="Pick a color from screen"
            title="Eyedropper"
            onClick={pickWithEyedropper}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-neutral-700 ring-1 ring-black/5 transition hover:bg-neutral-100"
          >
            <Pipette className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <div className="grid grid-cols-10 gap-1.5">
        {SWATCHES.map((c) => {
          const selected = c.toLowerCase() === value.toLowerCase();
          return (
            <button
              key={c}
              type="button"
              aria-label={c}
              className={cn(
                "h-7 w-7 rounded-full ring-1 ring-black/10 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                selected && "outline outline-2 outline-offset-2 outline-blue-500"
              )}
              style={{ background: c }}
              onClick={() => commit(c)}
            />
          );
        })}
      </div>
    </div>
  );
}
