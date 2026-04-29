# MacFolders

> Browser-based editor for designing custom **macOS folder icons**. Pick a color,
> drop in an emoji or icon, export PNG or `.icns`, apply in Finder.
>
> Not affiliated with Apple Inc.

## Stack

- **Next.js 14** (App Router, TypeScript strict)
- **Tailwind CSS** + **shadcn/ui** (dark mode default with light toggle)
- **Konva.js** (`react-konva`) for the editor canvas
- **lucide-react** for the symbol library (a stand-in for SF Symbols)
- **twemoji** SVGs (loaded from jsDelivr) for cross-platform emoji rendering
- **@imgly/background-removal** loaded from CDN at runtime — client-side BG removal
- **png2icons** for `.icns` export
- **jszip** + **file-saver** for bulk ZIP export
- **zustand** for editor state (with a small undo/redo history stack)
- **nanoid** for layer IDs

The whole app runs **client-side**. There is no backend.

## Quick start

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm build && pnpm start
pnpm lint
pnpm typecheck
```

Tested on Node 20 / pnpm 9.

## Architecture

```
src/
├── app/                       # Next.js App Router
│   ├── page.tsx               # Landing
│   ├── editor/page.tsx        # /editor (force-dynamic — Konva is client-only)
│   ├── templates/page.tsx     # /templates (30 presets)
│   ├── bulk/page.tsx          # /bulk (ZIP exporter)
│   ├── how-to-apply/page.tsx  # /how-to-apply (macOS 13/14/15 guide)
│   ├── pro/page.tsx           # /pro (pricing)
│   └── layout.tsx
├── components/
│   ├── editor/                # FolderCanvas, ToolPanel, Inspector, ExportMenu …
│   ├── folder/                # FolderShape (Konva), FolderSvg (static)
│   ├── site/                  # Header, footer, theme toggle
│   └── ui/                    # shadcn/ui primitives
├── lib/
│   ├── store.ts               # zustand store: project, layers, history
│   ├── types.ts               # Layer, FolderProject, TemplateDefinition
│   ├── folder-paths.ts        # Two-path SVG/Konva folder geometry
│   ├── symbols.ts             # lucide-react → data URL helper + icon catalog
│   ├── emoji.ts               # Twemoji URL helpers + popular emoji
│   ├── export.ts              # PNG / ICNS / clipboard / ZIP export
│   └── utils.ts               # cn(), slug, color shading, hex<->rgb<->hsl
└── data/templates.json        # 30 preset folders
```

### Folder rendering

The folder is built from two SVG paths defined in `src/lib/folder-paths.ts`:

- `<FolderBack>` — the upper silhouette with the tab; rendered with a slightly
  darker variant of the base color and a soft drop shadow.
- `<FolderFront>` — the body; rendered with a subtle top-to-bottom gradient and a
  rim highlight that picks up a brighter shade of the base color.

Inside the editor (Konva) we sandwich content layers between these two paths so
emoji, symbols, images and text appear to sit *inside* the folder. A separate
"badge" zone renders **on top** of `<FolderFront>` for sticker-style accents.

For the landing page, templates grid, and saved-project thumbnails we use the
matching `FolderSvg` component which renders the same geometry as a static SVG
with no Konva dependency — keeping `/` lightweight for Lighthouse.

### State management

`src/lib/store.ts` is a single zustand store with a flat history stack:

- `past`, `future`: snapshot stacks (capped to 60 entries each).
- `saveSnapshot()` is called on `dragstart` / `transformstart` and any structural
  edit (add/remove/duplicate/reorder/color change).
- `undo()` / `redo()` swap snapshots and persist to `localStorage` under the
  `macfolders:current` key on every change.
- `saveToGallery()` writes the current project to `macfolders:gallery` (max 20
  entries) — surfaced in the **My folders** drawer in the editor toolbar.

### Export

- **PNG 512 / 1024**: `stage.toDataURL({ pixelRatio })` → blob → `file-saver`.
- **Copy PNG**: same source, written to the clipboard via `ClipboardItem`.
- **`.icns` (Pro)**: PNG 1024 → `png2icons.createICNS` (BICUBIC scaling) →
  blob → `file-saver`. The Pro modal currently lets you generate it for free.
- **Bulk ZIP**: paste names in `/bulk`, the offscreen Konva stage renders the
  base style, each name is exported to PNG (and optionally `.icns`), packed
  into a `JSZip` and downloaded as `macfolders-bulk.zip`.

## Keyboard shortcuts

| Shortcut | Action |
| --- | --- |
| `Cmd/Ctrl + Z` | Undo |
| `Shift + Cmd/Ctrl + Z` | Redo |
| `Cmd/Ctrl + D` | Duplicate selected layer |
| `Delete` / `Backspace` | Remove selected layer |
| `V` | Move tool (default) |
| `T` | Switch to text tab |

## Deploying to Vercel

This project is a vanilla Next.js 14 App Router app — `vercel deploy` works
out of the box. No environment variables are required for the MVP.

## Roadmap

The MVP runs entirely in the browser. Planned follow-ups:

- **AI generation (Replicate)** — generate a layered folder design from a text
  prompt. Requires a small `/api/generate` route that calls Replicate and a
  `REPLICATE_API_TOKEN` server secret.
- **Supabase auth + cloud sync** — opt-in account that mirrors the
  `macfolders:gallery` localStorage to a `projects` table; same shape, different
  persistence layer.
- **Lemon Squeezy checkout** — wire the `/pro` page's "Buy" button to a
  hosted checkout. The `.icns` Pro modal becomes gated by a license key
  stored in Supabase.
- **Real SF Symbols** — Apple's SF Symbols set is licensed under their
  agreement and cannot be redistributed; we'll add a one-click "Use system
  font glyphs" option for users running locally on macOS, plus an opt-in
  uploader for licensed `.symbol` packs.
- **More base styles** — Stack-of-folders, "translucent glass" Big Sur variant,
  Aqua throwback, classic OS 9.

## Acknowledgements

- Folder geometry inspired by Apple's macOS Big Sur+ Finder folder.
- Twemoji is © Twitter, Inc and other contributors, licensed CC-BY 4.0.
- Lucide icons are licensed under ISC.
- Not affiliated with Apple Inc. Apple, macOS, and the Finder folder shape are
  trademarks of Apple Inc.

## License

MIT for the MacFolders source code in this repository. Asset/runtime
dependencies retain their own licenses as listed above.
