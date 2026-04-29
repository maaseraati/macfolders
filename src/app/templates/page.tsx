import Link from "next/link";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { FolderSvg } from "@/components/folder/FolderSvg";
import templates from "@/data/templates.json";
import type { TemplateDefinition } from "@/lib/types";

const TEMPLATES = templates as TemplateDefinition[];

export const metadata = { title: "Templates" };

export default function TemplatesPage() {
  const grouped = TEMPLATES.reduce<Record<string, TemplateDefinition[]>>((acc, t) => {
    const key = t.category || "Other";
    (acc[key] ||= []).push(t);
    return acc;
  }, {});

  return (
    <>
      <SiteHeader />
      <div className="container py-12">
        <h1 className="text-3xl font-semibold">Templates</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          {TEMPLATES.length} ready-to-use folder icons. Click any preset to open it in the editor — every
          property is editable.
        </p>
        <div className="mt-8 space-y-12">
          {Object.entries(grouped).map(([category, list]) => (
            <section key={category}>
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {category}
              </h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {list.map((t) => {
                  const emojiLayer = t.layers.find((l) => l.type === "emoji") as { emoji?: string } | undefined;
                  return (
                    <Link
                      key={t.id}
                      href={`/editor?template=${t.id}`}
                      className="group flex flex-col items-center gap-2 rounded-xl border border-border/40 bg-card/40 p-4 transition-colors hover:bg-accent"
                    >
                      <FolderSvg baseColor={t.baseColor} emoji={emojiLayer?.emoji} size={140} />
                      <span className="text-xs text-muted-foreground group-hover:text-foreground">{t.name}</span>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
      <SiteFooter />
    </>
  );
}
