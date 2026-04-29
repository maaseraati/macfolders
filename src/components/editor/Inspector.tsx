"use client";

import * as React from "react";
import { useEditorStore } from "@/lib/store";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
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
import { Separator } from "@/components/ui/separator";
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
      <div className="p-4 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">Inspector</p>
        <p className="mt-2">Select a layer on the canvas or in the Layers tab to edit its properties.</p>
      </div>
    );
  }

  const update = (patch: Partial<Layer>) => updateLayer(layer.id, patch);

  return (
    <div className="space-y-4 p-4">
      <div>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{layer.type}</p>
        <Input
          value={layer.name}
          onChange={(e) => update({ name: e.target.value })}
          className="mt-1"
        />
      </div>

      <Separator />

      <div className="grid grid-cols-2 gap-2">
        <NumberField label="X" value={layer.x} onChange={(v) => update({ x: v })} />
        <NumberField label="Y" value={layer.y} onChange={(v) => update({ y: v })} />
      </div>

      <SliderField
        label={`Scale: ${layer.scale.toFixed(2)}`}
        value={layer.scale}
        min={0.1}
        max={10}
        step={0.05}
        onChange={(v) => update({ scale: v })}
      />
      <SliderField
        label={`Rotation: ${Math.round(layer.rotation)}°`}
        value={layer.rotation}
        min={-180}
        max={180}
        step={1}
        onChange={(v) => update({ rotation: v })}
      />
      <SliderField
        label={`Opacity: ${Math.round(layer.opacity * 100)}%`}
        value={layer.opacity}
        min={0}
        max={1}
        step={0.01}
        onChange={(v) => update({ opacity: v })}
      />

      <div className="space-y-1">
        <Label>Blend mode</Label>
        <Select value={layer.blendMode} onValueChange={(v) => update({ blendMode: v as BlendMode })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {BLEND_MODES.map((m) => (
              <SelectItem key={m} value={m}>{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label>Layer zone</Label>
        <Select value={layer.zone} onValueChange={(v) => update({ zone: v as LayerZone })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="inside">Inside folder</SelectItem>
            <SelectItem value="badge">Badge (on top)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {(layer.type === "symbol" || layer.type === "image") && (
        <ColorPicker
          label="Tint"
          value={layer.tint ?? "#FFFFFF"}
          onChange={(hex) => update({ tint: hex })}
        />
      )}

      {layer.type === "symbol" && (
        <>
          <SliderField
            label={`Stroke width: ${layer.strokeWidth}`}
            value={layer.strokeWidth}
            min={4}
            max={64}
            step={2}
            onChange={(v) => update({ strokeWidth: v })}
          />
          <ToggleField
            label="Filled"
            value={layer.filled}
            onChange={(v) => update({ filled: v })}
          />
        </>
      )}

      {layer.type === "text" && (
        <>
          <div className="space-y-1">
            <Label>Text</Label>
            <Input value={layer.text} onChange={(e) => update({ text: e.target.value })} />
          </div>
          <ColorPicker label="Color" value={layer.color} onChange={(hex) => update({ color: hex })} />
          <SliderField
            label={`Font size: ${layer.fontSize}px`}
            value={layer.fontSize}
            min={20}
            max={500}
            step={2}
            onChange={(v) => update({ fontSize: v })}
          />
          <SliderField
            label={`Weight: ${layer.fontWeight}`}
            value={layer.fontWeight}
            min={300}
            max={900}
            step={100}
            onChange={(v) => update({ fontWeight: v })}
          />
        </>
      )}

      <Separator />

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Drop shadow</Label>
          <Switch
            checked={layer.shadow.enabled}
            onCheckedChange={(v) => update({ shadow: { ...layer.shadow, enabled: v } })}
          />
        </div>
        {layer.shadow.enabled ? (
          <div className="space-y-3 rounded-md border border-border/40 p-2">
            <ColorPicker
              label="Color"
              value={layer.shadow.color}
              onChange={(hex) => update({ shadow: { ...layer.shadow, color: hex } })}
            />
            <SliderField
              label={`Blur: ${layer.shadow.blur}`}
              value={layer.shadow.blur}
              min={0}
              max={120}
              step={1}
              onChange={(v) => update({ shadow: { ...layer.shadow, blur: v } })}
            />
            <div className="grid grid-cols-2 gap-2">
              <NumberField
                label="Offset X"
                value={layer.shadow.offsetX}
                onChange={(v) => update({ shadow: { ...layer.shadow, offsetX: v } })}
              />
              <NumberField
                label="Offset Y"
                value={layer.shadow.offsetY}
                onChange={(v) => update({ shadow: { ...layer.shadow, offsetY: v } })}
              />
            </div>
            <SliderField
              label={`Opacity: ${Math.round(layer.shadow.opacity * 100)}%`}
              value={layer.shadow.opacity}
              min={0}
              max={1}
              step={0.01}
              onChange={(v) => update({ shadow: { ...layer.shadow, opacity: v } })}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function SliderField({ label, value, min, max, step, onChange }: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      <Slider value={[value]} min={min} max={max} step={step} onValueChange={(v) => onChange(v[0])} />
    </div>
  );
}

function NumberField({ label, value, onChange }: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      <Input
        type="number"
        value={Math.round(value)}
        onChange={(e) => {
          const num = Number(e.target.value);
          if (!Number.isNaN(num)) onChange(num);
        }}
      />
    </div>
  );
}

function ToggleField({ label, value, onChange }: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <Label>{label}</Label>
      <Switch checked={value} onCheckedChange={onChange} />
    </div>
  );
}
