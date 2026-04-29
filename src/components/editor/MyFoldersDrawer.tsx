"use client";

import * as React from "react";
import { FolderOpen, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useEditorStore } from "@/lib/store";
import { FolderSvg } from "@/components/folder/FolderSvg";
import type { FolderProject } from "@/lib/types";

export function MyFoldersDrawer() {
  const [open, setOpen] = React.useState(false);
  const [items, setItems] = React.useState<FolderProject[]>([]);
  const getGallery = useEditorStore((s) => s.getGallery);
  const removeFromGallery = useEditorStore((s) => s.removeFromGallery);
  const saveToGallery = useEditorStore((s) => s.saveToGallery);
  const loadProject = useEditorStore((s) => s.loadProject);

  React.useEffect(() => {
    if (open) setItems(getGallery());
  }, [open, getGallery]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <FolderOpen className="mr-2 h-4 w-4" /> My folders
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>My folders</DialogTitle>
          <DialogDescription>
            Up to 20 most recent projects, stored locally in your browser.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end">
          <Button
            size="sm"
            onClick={() => {
              saveToGallery();
              setItems(getGallery());
            }}
          >
            <Save className="mr-2 h-4 w-4" /> Save current
          </Button>
        </div>
        <div className="grid max-h-[420px] grid-cols-3 gap-3 overflow-y-auto md:grid-cols-4">
          {items.length === 0 ? (
            <p className="col-span-full rounded-md border border-dashed border-border/50 p-6 text-center text-sm text-muted-foreground">
              No saved folders yet. Click "Save current" to add the active project here.
            </p>
          ) : (
            items.map((p) => {
              const emojiLayer = p.layers.find((l) => l.type === "emoji") as
                | { emoji?: string }
                | undefined;
              return (
                <div key={p.id} className="group relative flex flex-col items-center rounded-md border border-border/40 p-2">
                  <button
                    type="button"
                    onClick={() => {
                      loadProject(p);
                      setOpen(false);
                    }}
                    className="flex flex-col items-center gap-1"
                  >
                    <FolderSvg baseColor={p.baseColor} emoji={emojiLayer?.emoji} size={120} />
                    <span className="line-clamp-1 text-xs">{p.name}</span>
                  </button>
                  <button
                    type="button"
                    className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-md text-destructive opacity-0 transition-opacity hover:bg-destructive/10 group-hover:opacity-100"
                    onClick={() => {
                      removeFromGallery(p.id);
                      setItems(getGallery());
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
