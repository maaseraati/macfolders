import Link from "next/link";
import { ArrowRight, MousePointerClick, Wand2, Download, FolderTree, Sparkles, FileJson } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { LandingShowcase } from "@/components/site/LandingShowcase";

const HOW_TO = [
  {
    title: "Design it",
    body: "Pick a base color, drop an emoji or symbol, tweak the shadow, and you're done.",
    Icon: Wand2,
  },
  {
    title: "Export it",
    body: "Download as PNG (1024×1024) or generate an .icns for the full Apple icon set.",
    Icon: Download,
  },
  {
    title: "Apply it",
    body: "In Finder: Get Info on a folder, drag your image onto the icon in the top-left.",
    Icon: MousePointerClick,
  },
];

const FAQ = [
  {
    q: "Is MacFolders free?",
    a: "Yes — color, emoji, symbol, text, image and PNG export are all free. .icns export is part of MacFolders Pro (one-time $4 once it ships; for now it's available in beta).",
  },
  {
    q: "Do I need to sign up?",
    a: "No. Everything runs in your browser. Your projects are saved to localStorage on your machine.",
  },
  {
    q: "Will this work on macOS Sonoma / Sequoia?",
    a: "Yes. The folder shape mirrors the Big Sur+ style used in macOS 11 through 15. See the How to apply page for step-by-step instructions for macOS 13, 14, and 15.",
  },
  {
    q: "Are these official Apple folders?",
    a: "No. MacFolders is not affiliated with Apple Inc. The folder shape is a faithful reproduction designed to look right on your Desktop and in Finder.",
  },
  {
    q: "Can I import my own images?",
    a: "Yes — upload any PNG/JPG and optionally remove the background entirely client-side.",
  },
];

export default function HomePage() {
  return (
    <div className="relative overflow-x-hidden">
      {/* Soft gradient background à la macOS Sonoma */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[680px]"
        style={{
          background:
            "radial-gradient(60% 80% at 50% 0%, rgba(120,170,255,0.45), rgba(255,255,255,0) 70%), radial-gradient(40% 60% at 80% 10%, rgba(255,160,220,0.35), rgba(255,255,255,0) 70%), linear-gradient(180deg, #f5f7fb 0%, #ffffff 60%)",
        }}
      />

      <SiteHeader />

      <section className="container relative grid items-center gap-10 py-14 md:grid-cols-[1.05fr_1fr] md:py-20">
        <div className="flex flex-col justify-center gap-6">
          <span className="inline-flex w-fit items-center gap-2 rounded-full glass px-3 py-1 text-xs text-neutral-700">
            <Sparkles className="h-3 w-3 text-primary" /> 100% in-browser. No login. Free PNG export.
          </span>
          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
            Folder icons your Finder<br className="hidden md:inline" /> actually deserves.
          </h1>
          <p className="max-w-md text-pretty text-base text-muted-foreground">
            A browser-based editor for designing custom macOS folder icons. Pick a color, drop in
            an emoji or symbol, export PNG or .icns, and apply it in Finder.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-full">
              <Link href="/editor">Open editor <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild variant="secondary" size="lg" className="rounded-full">
              <Link href="/templates">Browse 30 templates</Link>
            </Button>
          </div>
        </div>
        <div className="relative">
          <LandingShowcase />
        </div>
      </section>

      <section id="how-to-apply" className="container py-16">
        <div className="grid gap-10 md:grid-cols-2">
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">How to apply your custom icon</h2>
            <ol className="space-y-4">
              {HOW_TO.map((step, i) => (
                <li key={step.title} className="flex gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-primary/15 text-primary">
                    <step.Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-medium">{i + 1}. {step.title}</p>
                    <p className="text-sm text-muted-foreground">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
            <Button asChild variant="outline">
              <Link href="/how-to-apply">Detailed guide for macOS 13 / 14 / 15</Link>
            </Button>
          </div>
          <div className="grid place-items-center rounded-xl border border-border/40 bg-card/40 p-6">
            <div className="aspect-video w-full max-w-md rounded-lg border border-border/40 bg-secondary/40 grid place-items-center text-sm text-muted-foreground">
              <span>📺 Video walkthrough — coming soon</span>
            </div>
          </div>
        </div>
      </section>

      <section className="container py-16">
        <h2 className="mb-6 text-2xl font-semibold">FAQ</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {FAQ.map((item) => (
            <details
              key={item.q}
              className="rounded-lg border border-border/40 bg-card/40 p-4 open:bg-card/70"
            >
              <summary className="cursor-pointer select-none text-sm font-medium">{item.q}</summary>
              <p className="mt-2 text-sm text-muted-foreground">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="container grid gap-3 py-16 md:grid-cols-3">
        <Feature Icon={FolderTree} title="Big Sur fidelity" body="Two-path folder with rim highlight, inner shadow, and color-aware gradients." />
        <Feature Icon={FileJson} title="Open project format" body="Templates ship as JSON. Bring your own — version control your icon library." />
        <Feature Icon={Download} title="Export everywhere" body="PNG 512/1024 plus full .icns with all standard sizes — generated in your browser." />
      </section>

      <SiteFooter />
    </div>
  );
}

function Feature({ Icon, title, body }: { Icon: typeof FolderTree; title: string; body: string }) {
  return (
    <div className="rounded-xl border border-border/40 bg-card/40 p-6">
      <span className="grid h-10 w-10 place-items-center rounded-md bg-primary/15 text-primary">
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-4 text-sm font-medium">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}
