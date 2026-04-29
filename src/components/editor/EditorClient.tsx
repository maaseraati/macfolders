"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import type Konva from "konva";
import { useSearchParams } from "next/navigation";
import {
  Redo,
  Undo,
  Plus,
  Folder,
  Sparkles,
} from "lucide-react";
import { useEditorStore } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ToolPanel } from "./ToolPanel";
import { Inspector } from "./Inspector";
import { PreviewStrip } from "./PreviewStrip";
import { ExportMenu } from "./ExportMenu";
import { MyFoldersDrawer } from "./MyFoldersDrawer";
import templates from "@/data/templates.json";
import type { TemplateDefinition } from "@/lib/types";
import Link from "next/link";

const FolderCanvas = dynamic(
  () => import("./FolderCanvas").then((m) => m.FolderCanvas),
  { ssr: false, loading: () => <div className="h-[540px] w-[540px] rounded-lg bg-secondary/30" /> }
);

const TEMPLATES = templates as TemplateDefinition[];

export function EditorClient() {
  const project = useEditorStore((s) => s.project);
  const setName = useEditorStore((s) => s.setName);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const past = useEditorStore((s) => s.past);
  const future = useEditorStore((s) => s.future);
  const removeLayer = useEditorStore((s) => s.removeLayer);
  const duplicateLayer = useEditorStore((s) => s.duplicateLayer);
  const selectedLayerId = useEditorStore((s) => s.selectedLayerId);
  const hydrate = useEditorStore((s) => s.hydrate);
  const hydrated = useEditorStore((s) => s.hydrated);
  const resetProject = useEditorStore((s) => s.resetProject);
  const loadTemplate = useEditorStore((s) => s.loadTemplate);

  const [stage, setStage] = React.useState<Konva.Stage | null>(null);
  const [stageVersion, setStageVersion] = React.useState(0);
  const search = useSearchParams();

  React.useEffect(() => {
    hydrate();
  }, [hydrate]);

  React.useEffect(() => {
    if (!hydrated) return;
    const templateId = search?.get("template");
    if (templateId) {
      const tpl = TEMPLATES.find((t) => t.id === templateId);
      if (tpl) loadTemplate(tpl);
    }
  }, [hydrated, search, loadTemplate]);

  React.useEffect(() => {
    setStageVersion((v) => v + 1);
  }, [project]);

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && /(input|textarea|select)/i.test(target.tagName)) return;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "d") {
        e.preventDefault();
        if (selectedLayerId) duplicateLayer(selectedLayerId);
      } else if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedLayerId) {
          e.preventDefault();
          removeLayer(selectedLayerId);
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [undo, redo, selectedLayerId, removeLayer, duplicateLayer]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#f5f5f7] text-foreground">
      <header className="flex h-11 items-center gap-2 border-b border-black/5 bg-white/95 px-3">
        <div className="flex items-center gap-1.5">
          <span className="block h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="block h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="block h-3 w-3 rounded-full bg-[#28c840]" />
        </div>
        <Separator orientation="vertical" className="mx-1.5 h-5" />
        <Link
          href="/"
          className="flex items-center gap-1.5 text-[13px] font-semibold tracking-tight text-neutral-800"
        >
          <span className="grid h-5 w-5 place-items-center rounded-md bg-primary/15 text-primary">
            <Folder className="h-3 w-3" />
          </span>
          MacFolders
        </Link>
        <Separator orientation="vertical" className="mx-1.5 h-5" />
        <Input
          value={project.name}
          onChange={(e) => setName(e.target.value)}
          className="h-7 max-w-[240px] rounded-md border-black/10 text-[12.5px]"
          aria-label="Folder name"
        />
        <Button
          variant="ghost"
          size="sm"
          className="h-7 rounded-md px-2 text-[12px]"
          onClick={() => resetProject()}
        >
          <Plus className="mr-1 h-3.5 w-3.5" /> New
        </Button>
        <div className="ml-1 flex items-center rounded-md bg-black/[0.04] p-0.5">
          <Button
            variant="ghost"
            size="sm"
            aria-label="Undo"
            disabled={past.length === 0}
            onClick={undo}
            className="h-6 w-6 rounded-[5px] p-0"
          >
            <Undo className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            aria-label="Redo"
            disabled={future.length === 0}
            onClick={redo}
            className="h-6 w-6 rounded-[5px] p-0"
          >
            <Redo className="h-3.5 w-3.5" />
          </Button>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="h-7 rounded-md px-2 text-[12px]"
          >
            <Link href="/templates">
              <Sparkles className="mr-1 h-3.5 w-3.5" /> Templates
            </Link>
          </Button>
          <MyFoldersDrawer />
          <ExportMenu stage={stage} filename={project.name} />
        </div>
      </header>

      <div className="grid flex-1 grid-cols-[332px_minmax(0,1fr)_320px] gap-2 overflow-hidden p-2">
        <aside className="overflow-hidden rounded-xl border border-black/5 bg-white shadow-sm">
          <ToolPanel />
        </aside>

        <main className="flex min-h-0 flex-col items-center gap-2 overflow-hidden">
          <div className="relative flex flex-1 w-full min-h-0 items-center justify-center overflow-hidden rounded-xl border border-black/5 bg-white shadow-sm">
            <div className="checkerboard rounded-lg ring-1 ring-black/5">
              <FolderCanvas size={560} onStageReady={setStage} />
            </div>
            <p className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-neutral-500">
              Drag, resize and rotate directly · ⌘D duplicate · ⌘Z undo · Delete remove
            </p>
          </div>
          <div className="w-full rounded-xl border border-black/5 bg-white px-3 py-2 shadow-sm">
            <PreviewStrip stage={stage} stageVersion={stageVersion} />
          </div>
        </main>

        <aside className="overflow-y-auto rounded-xl border border-black/5 bg-white shadow-sm">
          <Inspector />
        </aside>
      </div>

      <div className="flex h-7 items-center justify-between border-t border-black/5 bg-white px-3 text-[11px] tabular-nums text-neutral-500">
        <span className="flex items-center gap-1.5">
          <span className="block h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Auto-saved to this device
        </span>
        <span>
          {project.layers.length} layer{project.layers.length === 1 ? "" : "s"}
        </span>
      </div>
    </div>
  );
}
