"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Copy, Palette, Pencil, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FolderSvg } from "@/components/folder/FolderSvg";
import { useEditorStore } from "@/lib/store";
import type { FolderProject } from "@/lib/types";

export function GalleryClient() {
  const router = useRouter();
  const hydrate = useEditorStore((s) => s.hydrate);
  const hydrated = useEditorStore((s) => s.hydrated);
  const getGallery = useEditorStore((s) => s.getGallery);
  const removeFromGallery = useEditorStore((s) => s.removeFromGallery);
  const duplicateInGallery = useEditorStore((s) => s.duplicateInGallery);
  const loadProject = useEditorStore((s) => s.loadProject);
  const [items, setItems] = React.useState<FolderProject[]>([]);
  const [query, setQuery] = React.useState("");
  const [color, setColor] = React.useState("all");
  const [tag, setTag] = React.useState("all");

  React.useEffect(() => {
    hydrate();
  }, [hydrate]);

  React.useEffect(() => {
    if (hydrated) setItems(getGallery());
  }, [getGallery, hydrated]);

  const colors = React.useMemo(() => {
    const values = new Map<string, string>();
    items.forEach((item) => values.set(item.baseColor.toLowerCase(), item.baseColor));
    return [...values.values()];
  }, [items]);

  const tags = React.useMemo(() => {
    const values = new Set<string>();
    items.forEach((item) => item.settings.tags.forEach((value) => values.add(value)));
    return [...values].sort((a, b) => a.localeCompare(b));
  }, [items]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      const haystack = [item.name, item.baseColor, item.settings.style, ...item.settings.tags]
        .join(" ")
        .toLowerCase();
      return (
        (!q || haystack.includes(q)) &&
        (color === "all" || item.baseColor.toLowerCase() === color) &&
        (tag === "all" || item.settings.tags.includes(tag))
      );
    });
  }, [color, items, query, tag]);

  const refresh = () => setItems(getGallery());
  const openInEditor = (item: FolderProject) => {
    loadProject(item);
    router.push("/editor");
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-3 rounded-3xl border border-black/5 bg-white/75 p-4 shadow-sm backdrop-blur md:grid-cols-[1fr_auto_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search saved folders by name, tag, style, or color…"
            className="h-11 rounded-2xl pl-9"
          />
        </div>
        <select
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="h-11 rounded-2xl border border-input bg-background px-3 text-sm"
        >
          <option value="all">All colors</option>
          {colors.map((value) => (
            <option key={value} value={value.toLowerCase()}>
              {value.toUpperCase()}
            </option>
          ))}
        </select>
        <select
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          className="h-11 rounded-2xl border border-input bg-background px-3 text-sm"
        >
          <option value="all">All tags</option>
          {tags.map((value) => (
            <option key={value} value={value}>
              #{value}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-black/10 bg-white/70 p-10 text-center">
          <Palette className="mx-auto h-10 w-10 text-blue-500" />
          <h2 className="mt-4 text-lg font-semibold">No saved folders yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Create a design in the editor, click “My folders”, then save it here.
            Everything stays in localStorage after page refreshes.
          </p>
          <Button asChild className="mt-5 rounded-full">
            <Link href="/editor">Open editor</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((item) => {
            const emojiLayer = item.layers.find((layer) => layer.type === "emoji");
            return (
              <article
                key={item.id}
                className="group rounded-3xl border border-black/5 bg-white/75 p-4 shadow-sm backdrop-blur transition duration-200 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="grid place-items-center rounded-2xl bg-gradient-to-b from-neutral-50 to-neutral-100 p-4">
                  <FolderSvg
                    baseColor={item.baseColor}
                    settings={item.settings}
                    emoji={emojiLayer?.type === "emoji" ? emojiLayer.emoji : undefined}
                    size={180}
                  />
                </div>
                <div className="mt-4">
                  <h2 className="line-clamp-1 font-semibold tracking-tight">{item.name}</h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(item.createdAt).toLocaleDateString()} · {item.settings.style} · {item.baseColor.toUpperCase()}
                  </p>
                  {item.settings.tags.length ? (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {item.settings.tags.map((value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setTag(value)}
                          className="rounded-full bg-secondary px-2 py-1 text-[11px] text-muted-foreground transition hover:text-foreground"
                        >
                          #{value}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="rounded-full"
                    onClick={() => openInEditor(item)}
                  >
                    <Pencil className="mr-1 h-3.5 w-3.5" /> Edit
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="rounded-full"
                    onClick={() => {
                      duplicateInGallery(item.id);
                      refresh();
                    }}
                  >
                    <Copy className="mr-1 h-3.5 w-3.5" /> Copy
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="rounded-full text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      removeFromGallery(item.id);
                      refresh();
                    }}
                  >
                    <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
