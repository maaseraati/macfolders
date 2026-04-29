"use client";

import * as React from "react";
import type Konva from "konva";
import { ChevronDown, Download, Copy, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { copyPngToClipboard, exportIcns, exportPng, exportSvg } from "@/lib/export";
import { renderFolderSvgMarkup } from "@/components/folder/FolderSvg";
import type { FolderProject } from "@/lib/types";

interface ExportMenuProps {
  stage: Konva.Stage | null;
  filename: string;
  project: FolderProject;
}

export function ExportMenu({ stage, filename, project }: ExportMenuProps) {
  const [proOpen, setProOpen] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  const run = async (fn: () => Promise<void>) => {
    if (!stage) return;
    setError(null);
    setBusy(true);
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Export failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" disabled={!stage || busy}>
            <Download className="mr-2 h-4 w-4" /> Export
            <ChevronDown className="ml-2 h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Free</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => stage && run(() => exportPng(stage, 512, filename).then(() => undefined))}>
            <Download className="h-4 w-4" /> PNG 512×512
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => stage && run(() => exportPng(stage, 1024, filename).then(() => undefined))}>
            <Download className="h-4 w-4" /> PNG 1024×1024
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              const emojiLayer = project.layers.find((layer) => layer.type === "emoji");
              const svg = renderFolderSvgMarkup({
                baseColor: project.baseColor,
                settings: project.settings,
                emoji: emojiLayer?.type === "emoji" ? emojiLayer.emoji : undefined,
                label: project.name,
              });
              exportSvg(svg, filename);
            }}
          >
            <Download className="h-4 w-4" /> SVG preview
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              stage &&
              run(async () => {
                await copyPngToClipboard(stage);
              })
            }
          >
            <Copy className="h-4 w-4" /> Copy PNG to clipboard
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Pro</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setProOpen(true)}>
            <Crown className="h-4 w-4" /> Export .icns (all sizes)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {error ? <p className="ml-3 text-xs text-destructive">{error}</p> : null}
      <Dialog open={proOpen} onOpenChange={setProOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>.icns export</DialogTitle>
            <DialogDescription>
              MacFolders Pro lets you export a full Apple icon set (.icns) with every standard
              size from 16px through 1024px @1x and @2x. Coming soon — for now we'll generate
              one for you anyway.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setProOpen(false)}>Close</Button>
            <Button
              onClick={() => {
                if (!stage) return;
                setProOpen(false);
                run(() => exportIcns(stage, filename));
              }}
              disabled={!stage || busy}
            >
              Generate .icns now
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
