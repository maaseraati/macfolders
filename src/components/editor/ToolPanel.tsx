"use client";

import * as React from "react";
import {
  Palette,
  Smile,
  Shapes,
  Type as TypeIcon,
  ImagePlus,
  LayoutTemplate,
  Layers as LayersIcon,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Copy,
  Trash2,
  ChevronUp,
  ChevronDown,
  Loader2,
} from "lucide-react";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ColorPicker } from "./ColorPicker";
import { emojiToAppleUrl } from "@/lib/emoji";
import { EMOJI_GROUPS } from "@/lib/emoji-data";
import { SYMBOL_LIBRARY } from "@/lib/symbols";
import { useEditorStore } from "@/lib/store";
import { DEFAULT_LAYER_PROPS } from "@/lib/types";
import templates from "@/data/templates.json";
import type { TemplateDefinition } from "@/lib/types";
import { FolderSvg } from "@/components/folder/FolderSvg";
import { cn } from "@/lib/utils";

const TEMPLATES = templates as TemplateDefinition[];

const TAB_TRIGGERS: { value: string; label: string; Icon: typeof Palette }[] = [
  { value: "color", label: "Color", Icon: Palette },
  { value: "emoji", label: "Emoji", Icon: Smile },
  { value: "symbol", label: "Icons", Icon: Shapes },
  { value: "text", label: "Text", Icon: TypeIcon },
  { value: "image", label: "Image", Icon: ImagePlus },
  { value: "templates", label: "Saved", Icon: LayoutTemplate },
  { value: "layers", label: "Layers", Icon: LayersIcon },
];

export function ToolPanel() {
  return (
    <Tabs defaultValue="color" className="flex h-full flex-col">
      <div className="border-b border-black/5 bg-white px-2 pb-2 pt-2">
        <TabsList className="h-auto w-full justify-between gap-0.5 bg-transparent p-0">
          {TAB_TRIGGERS.map(({ value, label, Icon }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="flex h-12 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-lg !px-0 text-neutral-600 transition-colors data-[state=active]:bg-blue-500/10 data-[state=active]:text-blue-600 data-[state=active]:shadow-none"
              aria-label={label}
              title={label}
            >
              <Icon className="h-[18px] w-[18px]" />
              <span className="text-[10px] font-medium leading-none">{label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-3">
          <TabsContent value="color" className="m-0"><ColorTab /></TabsContent>
          <TabsContent value="emoji" className="m-0"><EmojiTab /></TabsContent>
          <TabsContent value="symbol" className="m-0"><SymbolTab /></TabsContent>
          <TabsContent value="text" className="m-0"><TextTab /></TabsContent>
          <TabsContent value="image" className="m-0"><ImageTab /></TabsContent>
          <TabsContent value="templates" className="m-0"><TemplatesTab /></TabsContent>
          <TabsContent value="layers" className="m-0"><LayersTab /></TabsContent>
        </div>
      </ScrollArea>
    </Tabs>
  );
}

function ColorTab() {
  const baseColor = useEditorStore((s) => s.project.baseColor);
  const setBaseColor = useEditorStore((s) => s.setBaseColor);
  return (
    <div className="space-y-4">
      <ColorPicker label="Base color" value={baseColor} onChange={setBaseColor} />
      <p className="text-xs leading-relaxed text-muted-foreground">
        The folder back is ~16% darker than the base; the front gets a soft
        top-to-bottom gradient. Use the eyedropper to sample any pixel on
        screen.
      </p>
    </div>
  );
}

function EmojiTab() {
  const addLayer = useEditorStore((s) => s.addLayer);
  const [query, setQuery] = React.useState("");

  const groups = React.useMemo(() => {
    if (!query) return EMOJI_GROUPS;
    const q = query.toLowerCase();
    return EMOJI_GROUPS.map((g) => ({
      name: g.name,
      emoji: g.emoji.filter(
        (e) => e.includes(q) || g.name.toLowerCase().includes(q)
      ),
    })).filter((g) => g.emoji.length > 0);
  }, [query]);

  const onPick = (emoji: string) =>
    addLayer({
      ...DEFAULT_LAYER_PROPS,
      type: "emoji",
      name: emoji,
      emoji,
      scale: 1.6,
      y: 600,
    } as never);

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="space-y-1">
        <Label>Pick an emoji</Label>
        <Input
          placeholder="Filter…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <ScrollArea className="-mx-1 max-h-[calc(100vh-260px)] flex-1 px-1">
        <div className="space-y-3 pb-3">
          {groups.map((group) => (
            <div key={group.name} className="space-y-1.5">
              <p className="px-1 text-[11px] font-medium uppercase tracking-wide text-neutral-500">
                {group.name}
              </p>
              <div className="grid grid-cols-8 gap-0.5">
                {group.emoji.map((emoji) => (
                  <button
                    key={`${group.name}-${emoji}`}
                    type="button"
                    aria-label={emoji}
                    title={emoji}
                    className="grid h-8 w-8 place-items-center rounded-lg transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    onClick={() => onPick(emoji)}
                  >
                    <img
                      src={emojiToAppleUrl(emoji)}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      draggable={false}
                      className="h-5 w-5 select-none"
                    />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

function SymbolTab() {
  const addLayer = useEditorStore((s) => s.addLayer);
  const [query, setQuery] = React.useState("");
  const filtered = React.useMemo(() => {
    if (!query) return SYMBOL_LIBRARY;
    const q = query.toLowerCase();
    return SYMBOL_LIBRARY.filter((s) => s.name.toLowerCase().includes(q));
  }, [query]);
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label>Lucide symbols</Label>
        <Input
          placeholder="Search…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-6 gap-1.5">
        {filtered.slice(0, 90).map(({ name, component: Icon }) => (
          <button
            key={name}
            type="button"
            className="grid aspect-square place-items-center rounded-md border border-black/5 bg-white text-neutral-700 transition-colors hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            title={name}
            aria-label={name}
            onClick={() =>
              addLayer({
                ...DEFAULT_LAYER_PROPS,
                type: "symbol",
                name,
                symbolName: name,
                strokeWidth: 2,
                filled: false,
                scale: 7,
                tint: "#FFFFFF",
                y: 600,
              } as never)
            }
          >
            <Icon className="h-5 w-5" strokeWidth={1.75} />
          </button>
        ))}
      </div>
      <p className="text-[11px] leading-snug text-neutral-500">
        Stand-in for SF Symbols. Real SF Symbols requires Apple licensing.
      </p>
    </div>
  );
}

function TextTab() {
  const addLayer = useEditorStore((s) => s.addLayer);
  const [text, setText] = React.useState("Folder");
  const [color, setColor] = React.useState("#FFFFFF");
  const [size, setSize] = React.useState(220);
  const [weight, setWeight] = React.useState(700);
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label>Text</Label>
        <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={2} />
      </div>
      <ColorPicker label="Text color" value={color} onChange={setColor} />
      <div className="space-y-1">
        <Label>Font size: {size}px</Label>
        <Slider value={[size]} min={40} max={400} step={4} onValueChange={(v) => setSize(v[0])} />
      </div>
      <div className="space-y-1">
        <Label>Weight: {weight}</Label>
        <Slider value={[weight]} min={300} max={900} step={100} onValueChange={(v) => setWeight(v[0])} />
      </div>
      <Button
        className="w-full"
        onClick={() =>
          addLayer({
            ...DEFAULT_LAYER_PROPS,
            type: "text",
            name: text || "Text",
            text,
            color,
            fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
            fontSize: size,
            fontWeight: weight,
            align: "center",
            scale: 1,
            x: 360,
            y: 540,
          } as never)
        }
      >
        Add text layer
      </Button>
    </div>
  );
}

function ImageTab() {
  const addLayer = useEditorStore((s) => s.addLayer);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const onUpload = async (file: File, removeBg: boolean) => {
    setError(null);
    try {
      setBusy(true);
      let blob: Blob = file;
      if (removeBg) {
        const url = "https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.4.5/+esm";
        const mod = (await import(/* webpackIgnore: true */ url)) as {
          removeBackground: (input: File | Blob) => Promise<Blob>;
        };
        blob = await mod.removeBackground(file);
      }
      const dataUrl: string = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      const dimensions = await new Promise<{ w: number; h: number }>((resolve, reject) => {
        const img = new window.Image();
        img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
        img.onerror = reject;
        img.src = dataUrl;
      });
      const maxDim = 600;
      const scale = Math.min(1, maxDim / Math.max(dimensions.w, dimensions.h));
      addLayer({
        ...DEFAULT_LAYER_PROPS,
        type: "image",
        name: file.name,
        src: dataUrl,
        naturalWidth: dimensions.w,
        naturalHeight: dimensions.h,
        scale,
        y: 600,
      } as never);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="space-y-3">
      <UploadCard
        title="Upload image"
        subtitle="PNG, JPG, WEBP — keeps original background"
        accept="image/*"
        disabled={busy}
        onFile={(file) => onUpload(file, false)}
      />
      <UploadCard
        title="Upload + remove background"
        subtitle="Runs in your browser — first run downloads the model"
        accent
        accept="image/*"
        disabled={busy}
        onFile={(file) => onUpload(file, true)}
      />
      {busy ? (
        <p className="flex items-center gap-2 text-[12px] text-neutral-600">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Working… first run loads ML model.
        </p>
      ) : null}
      {error ? <p className="text-[12px] text-red-600">{error}</p> : null}
      <p className="text-[11px] leading-snug text-neutral-500">
        Background removal runs entirely in your browser via @imgly/background-removal.
      </p>
    </div>
  );
}

function TemplatesTab() {
  const loadTemplate = useEditorStore((s) => s.loadTemplate);
  return (
    <div className="grid grid-cols-3 gap-2">
      {TEMPLATES.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => loadTemplate(t)}
          className="group flex flex-col items-center rounded-lg border border-black/5 bg-white p-2 transition-colors hover:bg-neutral-50"
        >
          <FolderSvg
            baseColor={t.baseColor}
            emoji={(t.layers.find((l) => l.type === "emoji") as { emoji?: string } | undefined)?.emoji}
            size={64}
          />
          <span className="mt-1 truncate text-[11px] font-medium text-neutral-700 group-hover:text-neutral-900">
            {t.name}
          </span>
        </button>
      ))}
    </div>
  );
}

function UploadCard({
  title,
  subtitle,
  accent,
  accept,
  disabled,
  onFile,
}: {
  title: string;
  subtitle: string;
  accent?: boolean;
  accept: string;
  disabled?: boolean;
  onFile: (file: File) => void;
}) {
  const id = React.useId();
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex cursor-pointer flex-col rounded-xl border border-dashed px-3 py-2.5 transition-colors",
        accent
          ? "border-blue-300 bg-blue-50/60 hover:bg-blue-50"
          : "border-black/15 bg-neutral-50 hover:bg-neutral-100",
        disabled && "pointer-events-none opacity-60"
      )}
    >
      <span className={cn("text-[12.5px] font-semibold", accent ? "text-blue-700" : "text-neutral-800")}>
        {title}
      </span>
      <span className="text-[11px] leading-snug text-neutral-500">{subtitle}</span>
      <input
        id={id}
        type="file"
        accept={accept}
        disabled={disabled}
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
        }}
      />
    </label>
  );
}

function LayersTab() {
  const layers = useEditorStore((s) => s.project.layers);
  const selectedId = useEditorStore((s) => s.selectedLayerId);
  const select = useEditorStore((s) => s.selectLayer);
  const remove = useEditorStore((s) => s.removeLayer);
  const duplicate = useEditorStore((s) => s.duplicateLayer);
  const reorder = useEditorStore((s) => s.reorderLayer);
  const toggle = useEditorStore((s) => s.toggleLayerProp);
  const setZone = useEditorStore((s) => s.setZone);
  if (layers.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-black/15 bg-neutral-50 p-4 text-center text-[12px] text-neutral-500">
        No layers yet. Add an emoji, symbol, image, or text from the other tabs.
      </p>
    );
  }
  return (
    <div className="divide-y divide-black/5 overflow-hidden rounded-lg border border-black/5 bg-white">
      {[...layers].reverse().map((layer) => {
        const selected = selectedId === layer.id;
        return (
          <div
            key={layer.id}
            className={cn(
              "flex flex-col gap-1.5 px-2.5 py-2 transition-colors",
              selected ? "bg-blue-500/10" : "hover:bg-neutral-50"
            )}
          >
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => select(layer.id)}
                className="flex flex-1 items-center gap-2 truncate text-left"
              >
                <span
                  className={cn(
                    "rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider",
                    selected
                      ? "bg-blue-600/15 text-blue-700"
                      : "bg-neutral-100 text-neutral-500"
                  )}
                >
                  {layer.type}
                </span>
                <span
                  className={cn(
                    "truncate text-[12px] font-medium",
                    selected ? "text-blue-900" : "text-neutral-800"
                  )}
                >
                  {layer.name}
                </span>
              </button>
              <button
                type="button"
                title="Toggle visibility"
                className="grid h-6 w-6 place-items-center rounded text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800"
                onClick={() => toggle(layer.id, "hidden")}
              >
                {layer.hidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
              <button
                type="button"
                title="Toggle lock"
                className="grid h-6 w-6 place-items-center rounded text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800"
                onClick={() => toggle(layer.id, "locked")}
              >
                {layer.locked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
              </button>
            </div>
            {selected ? (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  title={layer.zone === "inside" ? "Move to badge slot" : "Move inside folder"}
                  className="flex h-6 items-center rounded-md border border-black/5 bg-white px-2 text-[10px] font-medium uppercase tracking-wider text-neutral-600 hover:bg-neutral-50"
                  onClick={() => setZone(layer.id, layer.zone === "inside" ? "badge" : "inside")}
                >
                  {layer.zone}
                </button>
                <div className="ml-auto flex items-center gap-0.5">
                  <button
                    type="button"
                    title="Move up"
                    className="grid h-6 w-6 place-items-center rounded text-neutral-600 hover:bg-neutral-100"
                    onClick={() => reorder(layer.id, "up")}
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    title="Move down"
                    className="grid h-6 w-6 place-items-center rounded text-neutral-600 hover:bg-neutral-100"
                    onClick={() => reorder(layer.id, "down")}
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    title="Duplicate"
                    className="grid h-6 w-6 place-items-center rounded text-neutral-600 hover:bg-neutral-100"
                    onClick={() => duplicate(layer.id)}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    title="Delete"
                    className="grid h-6 w-6 place-items-center rounded text-red-500 hover:bg-red-500/10"
                    onClick={() => remove(layer.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}


