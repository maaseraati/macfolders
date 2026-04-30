"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import type Konva from "konva";
import { Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import templates from "@/data/templates.json";
import { useEditorStore } from "@/lib/store";
import { downloadBulkZip, stageToPngBuffer } from "@/lib/export";
import { ColorPicker } from "@/components/editor/ColorPicker";
import type { TemplateDefinition } from "@/lib/types";

const TEMPLATES = templates as TemplateDefinition[];

const FolderCanvas = dynamic(
  () => import("@/components/editor/FolderCanvas").then((m) => m.FolderCanvas),
  { ssr: false }
);

export function BulkClient() {
  const [names, setNames] = React.useState("Documents\nProjects\nDesign\nMedia\nResearch");
  const [templateId, setTemplateId] = React.useState<string>(TEMPLATES[0].id);
  const [overrideColor, setOverrideColor] = React.useState(true);
  const [color, setColor] = React.useState("#5BB0FF");
  const [includeIcns, setIncludeIcns] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [progress, setProgress] = React.useState<{ done: number; total: number } | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const loadTemplate = useEditorStore((s) => s.loadTemplate);
  const setBaseColor = useEditorStore((s) => s.setBaseColor);
  const project = useEditorStore((s) => s.project);

  const stageRef = React.useRef<Konva.Stage | null>(null);

  const baseTemplate = TEMPLATES.find((t) => t.id === templateId) ?? TEMPLATES[0];

  const apply = React.useCallback(() => {
    loadTemplate(baseTemplate);
    if (overrideColor) {
      setBaseColor(color);
    }
  }, [baseTemplate, loadTemplate, overrideColor, color, setBaseColor]);

  React.useEffect(() => {
    apply();
  }, [apply]);

  const onExport = async () => {
    setError(null);
    const list = names
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (list.length === 0) {
      setError("Add at least one folder name");
      return;
    }
    if (!stageRef.current) {
      setError("Canvas not ready, please wait a moment.");
      return;
    }
    setBusy(true);
    setProgress({ done: 0, total: list.length });
    try {
      const items = [];
      for (let i = 0; i < list.length; i++) {
        const stage = stageRef.current;
        if (!stage) throw new Error("Canvas not ready");
        const png512 = await stageToPngBuffer(stage, 512);
        const png1024 = await stageToPngBuffer(stage, 1024);
        let icns: Uint8Array | null = null;
        if (includeIcns) {
          const png2icons = await import("png2icons");
          const { Buffer } = await import("buffer");
          const created = png2icons.createICNS(
            Buffer.from(png1024),
            png2icons.BICUBIC,
            0
          );
          icns = created ?? null;
        }
        items.push({ name: list[i], png512, png1024, icns });
        setProgress({ done: i + 1, total: list.length });
      }
      await downloadBulkZip(items, "macfolders-bulk.zip");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Export failed");
    } finally {
      setBusy(false);
      setProgress(null);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-4">
        <Label htmlFor="bulk-names">Folder names — one per line</Label>
        <Textarea
          id="bulk-names"
          rows={12}
          value={names}
          onChange={(e) => setNames(e.target.value)}
          className="font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground">
          {names.split(/\r?\n/).filter((s) => s.trim()).length} folder name(s)
        </p>
      </div>

      <div className="space-y-5 rounded-xl border border-border/40 bg-card/40 p-5">
        <div className="space-y-2">
          <Label>Base style</Label>
          <Select value={templateId} onValueChange={setTemplateId}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {TEMPLATES.map((t) => (
                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <Label>Override color</Label>
          <Switch checked={overrideColor} onCheckedChange={setOverrideColor} />
        </div>
        {overrideColor ? (
          <ColorPicker label="Color" value={color} onChange={setColor} />
        ) : null}

        <div className="flex items-center justify-between">
          <div>
            <Label>Include .icns (Pro)</Label>
            <p className="text-xs text-muted-foreground">Adds an .icns to each folder. Slower export.</p>
          </div>
          <Switch checked={includeIcns} onCheckedChange={setIncludeIcns} />
        </div>

        <Button className="w-full" onClick={onExport} disabled={busy}>
          {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
          {busy && progress
            ? `Exporting ${progress.done}/${progress.total}…`
            : "Download ZIP"}
        </Button>
        {error ? <p className="text-xs text-destructive">{error}</p> : null}

        <div className="mt-2 flex flex-col items-center gap-2 rounded-md border border-border/30 bg-background p-3">
          <p className="text-xs text-muted-foreground">Base style preview ({project.layers.length} layers)</p>
          <div className="checkerboard rounded-md p-1">
            <FolderCanvas size={220} onStageReady={(s) => (stageRef.current = s)} />
          </div>
        </div>
      </div>
    </div>
  );
}
