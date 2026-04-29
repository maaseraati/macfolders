"use client";

import * as React from "react";
import { useEditorStore } from "@/lib/store";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ColorPicker } from "./ColorPicker";
import type { BlendMode, Layer, LayerZone } from "@/lib/types";

const BLEND_MODES: BlendMode[] = [
  "source-over",
  "multiply",
  "screen",
  "overlay",
  "darken",
  "lighten",
  "color-dodge",
  "color-burn",
  "hard-light",
  "soft-light",
  "difference",
  "exclusion",
  "hue",
  "saturation",
  "color",
  "luminosity",
];

export function Inspector() {
  const layers = useEditorStore((s) => s.project.layers);
  const selectedId = useEditorStore((s) => s.selectedLayerId);
  const updateLayer = useEditorStore((s) => s.updateLayer);
  const layer = layers.find((l) => l.id === selectedId);

  if (!layer) {
    return (
      <div className="flex h-full flex-col">
        <header className="border-b border-black/5 px-4 py-2.5">
          <h2 className="text-[13px] font-semibold tracking-tight">Inspector</h2>
        </header>
        <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
          <p className="text-[12px] text-neutral-500">No selection</p>
          <p className="text-[11px] leading-relaxed text-neutral-400">
            Pick a layer on the canvas or in the Layers tab to edit its
            properties.
          </p>
        </div>
      </div>
    );
  }

  const update = (patch: Partial<Layer>) => updateLayer(layer.id, patch);

  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-black/5 px-4 py-2.5">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
          {layer.type}
        </p>
        <Input
          value={layer.name}
          onChange={(e) => update({ name: e.target.value })}
          className="mt-1 h-7 border-0 bg-transparent px-0 text-[13px] font-semibold tracking-tight shadow-none focus-visible:ring-0"
        />
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-3 text-[12px]">
        <Section title="Position">
          <Row label="X">
            <NumberField
              value={layer.x}
              onChange={(v) => update({ x: v })}
            />
          </Row>
          <Row label="Y">
            <NumberField
              value={layer.y}
              onChange={(v) => update({ y: v })}
            />
          </Row>
        </Section>

        <Section title="Appearance">
          <Row label="Opacity">
            <SliderRow
              value={layer.opacity}
              min={0}
              max={1}
              step={0.01}
              format={(v) => `${Math.round(v * 100)}%`}
              onChange={(v) => update({ opacity: v })}
            />
          </Row>
          <Row label="Blend">
            <Select
              value={layer.blendMode}
              onValueChange={(v) => update({ blendMode: v as BlendMode })}
            >
              <SelectTrigger className="h-7 rounded-md text-[12px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BLEND_MODES.map((m) => (
                  <SelectItem key={m} value={m} className="text-[12px]">
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Row>
          <Row label="Zone">
            <Select
              value={layer.zone}
              onValueChange={(v) => update({ zone: v as LayerZone })}
            >
              <SelectTrigger className="h-7 rounded-md text-[12px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inside" className="text-[12px]">
                  Inside folder
                </SelectItem>
                <SelectItem value="badge" className="text-[12px]">
                  Badge (on top)
                </SelectItem>
              </SelectContent>
            </Select>
          </Row>
        </Section>

        {(layer.type === "symbol" || layer.type === "image") && (
          <Section title="Tint">
            <ColorPicker
              value={layer.tint ?? "#FFFFFF"}
              onChange={(hex) => update({ tint: hex })}
            />
          </Section>
        )}

        {layer.type === "symbol" && (
          <Section title="Symbol">
            <Row label="Stroke">
              <SliderRow
                value={layer.strokeWidth}
                min={1}
                max={4}
                step={0.25}
                format={(v) => v.toFixed(2)}
                onChange={(v) => update({ strokeWidth: v })}
              />
            </Row>
            <Row label="Filled">
              <div className="flex justify-end">
                <Switch
                  checked={layer.filled}
                  onCheckedChange={(v) => update({ filled: v })}
                />
              </div>
            </Row>
          </Section>
        )}

        {layer.type === "text" && (
          <>
            <Section title="Text">
              <div className="space-y-1.5">
                <Input
                  value={layer.text}
                  onChange={(e) => update({ text: e.target.value })}
                  className="h-7 rounded-md text-[12px]"
                />
              </div>
            </Section>
            <Section title="Color">
              <ColorPicker
                value={layer.color}
                onChange={(hex) => update({ color: hex })}
              />
            </Section>
            <Section title="Typography">
              <Row label="Size">
                <SliderRow
                  value={layer.fontSize}
                  min={20}
                  max={500}
                  step={2}
                  format={(v) => `${v}px`}
                  onChange={(v) => update({ fontSize: v })}
                />
              </Row>
              <Row label="Weight">
                <SliderRow
                  value={layer.fontWeight}
                  min={300}
                  max={900}
                  step={100}
                  format={(v) => String(v)}
                  onChange={(v) => update({ fontWeight: v })}
                />
              </Row>
            </Section>
          </>
        )}

        <Section title="Drop shadow">
          <Row label="Enabled">
            <div className="flex justify-end">
              <Switch
                checked={layer.shadow.enabled}
                onCheckedChange={(v) =>
                  update({ shadow: { ...layer.shadow, enabled: v } })
                }
              />
            </div>
          </Row>
          {layer.shadow.enabled ? (
            <>
              <Row label="Color">
                <ColorPicker
                  value={layer.shadow.color}
                  onChange={(hex) =>
                    update({ shadow: { ...layer.shadow, color: hex } })
                  }
                />
              </Row>
              <Row label="Blur">
                <SliderRow
                  value={layer.shadow.blur}
                  min={0}
                  max={120}
                  step={1}
                  format={(v) => String(v)}
                  onChange={(v) =>
                    update({ shadow: { ...layer.shadow, blur: v } })
                  }
                />
              </Row>
              <Row label="Offset X">
                <NumberField
                  value={layer.shadow.offsetX}
                  onChange={(v) =>
                    update({ shadow: { ...layer.shadow, offsetX: v } })
                  }
                />
              </Row>
              <Row label="Offset Y">
                <NumberField
                  value={layer.shadow.offsetY}
                  onChange={(v) =>
                    update({ shadow: { ...layer.shadow, offsetY: v } })
                  }
                />
              </Row>
              <Row label="Opacity">
                <SliderRow
                  value={layer.shadow.opacity}
                  min={0}
                  max={1}
                  step={0.01}
                  format={(v) => `${Math.round(v * 100)}%`}
                  onChange={(v) =>
                    update({ shadow: { ...layer.shadow, opacity: v } })
                  }
                />
              </Row>
            </>
          ) : null}
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: React.PropsWithChildren<{ title: string }>) {
  return (
    <section className="mac-section pb-1">
      <p className="mac-section-title">{title}</p>
      <div className="space-y-1.5">{children}</div>
    </section>
  );
}

function Row({ label, children }: React.PropsWithChildren<{ label: string }>) {
  return (
    <div className="mac-row">
      <label>{label}</label>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function NumberField({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <Input
      type="number"
      value={Math.round(value)}
      onChange={(e) => {
        const num = Number(e.target.value);
        if (!Number.isNaN(num)) onChange(num);
      }}
      className="h-7 w-full rounded-md text-right font-mono text-[12px] tabular-nums"
    />
  );
}

function SliderRow({
  value,
  min,
  max,
  step,
  format,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(v) => onChange(v[0])}
        className="flex-1"
      />
      <span className="w-12 shrink-0 text-right font-mono text-[11px] tabular-nums text-neutral-500">
        {format(value)}
      </span>
    </div>
  );
}
