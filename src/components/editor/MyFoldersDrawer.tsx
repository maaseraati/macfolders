"use client";

import * as React from "react";
import { Copy, FolderOpen, GalleryHorizontalEnd, Pencil, Save, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const [name, setName] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [color, setColor] = React.useState("all");
  const getGallery = useEditorStore((s) => s.getGallery);
  const removeFromGallery = useEditorStore((s) => s.removeFromGallery);
  const duplicateInGallery = useEditorStore((s) => s.duplicateInGallery);
  const saveToGallery = useEditorStore((s) => s.saveToGallery);
  const loadProject = useEditorStore((s) => s.loadProject);
  const project = useEditorStore((s) => s.project);

  React.useEffect(() => {
    if (open) setItems(getGallery());
  }, [open, getGallery]);

  React.useEffect(() => {
    if (open) setName(project.name);
  }, [open, project.name]);

  const colorOptions = React.useMemo(() => {
    const unique = new Map<string, string>();
    items.forEach((item) => unique.set(item.baseColor.toLowerCase(), item.baseColor));
    return [...unique.values()];
  }, [items]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      const haystack = [item.name, item.baseColor, ...(item.settings?.tags ?? [])]
        .join(" ")
        .toLowerCase();
      const matchesQuery = !q || haystack.includes(q);
      const matchesColor = color === "all" || item.baseColor.toLowerCase() === color;
      return matchesQuery && matchesColor;
    });
  }, [color, items, query]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <FolderOpen className="mr-2 h-4 w-4" /> My folders
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GalleryHorizontalEnd className="h-5 w-5 text-blue-500" /> My folders
          </DialogTitle>
          <DialogDescription>
            Saved locally in your browser with search, color filters, editing, duplication, and delete.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Folder name"
          />
          <Button
            onClick={() => {
              saveToGallery(name);
              setItems(getGallery());
            }}
          >
            <Save className="mr-2 h-4 w-4" /> Save current
          </Button>
        </div>
        <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, tag, or color…"
              className="pl-9"
            />
          </div>
          <select
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            aria-label="Filter by color"
          >
            <option value="all">All colors</option>
            {colorOptions.map((option) => (
              <option key={option} value={option.toLowerCase()}>
                {option.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
        <div className="grid max-h-[460px] grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-3 md:grid-cols-4">
          {filtered.length === 0 ? (
            <p className="col-span-full rounded-md border border-dashed border-border/50 p-6 text-center text-sm text-muted-foreground">
              No saved folders match this view. Save the current design or clear filters.
            </p>
          ) : (
            filtered.map((p) => {
              const emojiLayer = p.layers.find((l) => l.type === "emoji") as
                | { emoji?: string }
                | undefined;
              return (
                <div key={p.id} className="group relative flex flex-col items-center rounded-xl border border-border/40 bg-card/70 p-2">
                  <button
                    type="button"
                    onClick={() => {
                      loadProject(p);
                      setOpen(false);
                    }}
                    className="flex w-full flex-col items-center gap-1"
                  >
                    <FolderSvg
                      baseColor={p.baseColor}
                      settings={p.settings}
                      emoji={emojiLayer?.emoji}
                      size={120}
                    />
                    <span className="line-clamp-1 max-w-full text-xs font-medium">{p.name}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(p.updatedAt).toLocaleDateString()}
                    </span>
                  </button>
                  {p.settings?.tags?.length ? (
                    <div className="mt-1 flex max-w-full flex-wrap justify-center gap-1">
                      {p.settings.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="rounded-full bg-secondary px-1.5 py-0.5 text-[9px] text-muted-foreground">
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  <div className="absolute right-1 top-1 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <IconButton
                      label="Edit"
                      onClick={() => {
                        loadProject(p);
                        setOpen(false);
                      }}
                    >
                      <Pencil className="h-3 w-3" />
                    </IconButton>
                    <IconButton
                      label="Duplicate"
                      onClick={() => {
                        duplicateInGallery(p.id);
                        setItems(getGallery());
                      }}
                    >
                      <Copy className="h-3 w-3" />
                    </IconButton>
                    <IconButton
                      label="Delete"
                      danger
                      onClick={() => {
                        removeFromGallery(p.id);
                        setItems(getGallery());
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </IconButton>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function IconButton({
  label,
  children,
  danger,
  onClick,
}: {
  label: string;
  children: React.ReactNode;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`grid h-6 w-6 place-items-center rounded-md bg-white/95 shadow-sm transition-colors hover:bg-secondary ${
        danger ? "text-destructive hover:bg-destructive/10" : "text-neutral-700"
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
