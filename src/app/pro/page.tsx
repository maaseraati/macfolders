import Link from "next/link";
import { Check, Crown } from "lucide-react";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Pro" };

const FREE = [
  "Unlimited free PNG exports (512px + 1024px)",
  "30 templates and the entire emoji + symbol library",
  "Color, text, image, background removal",
  "Auto-save and 'My folders' history",
  "Bulk export — basic ZIP of PNGs",
];

const PRO = [
  "Native .icns export with every Apple standard size (16/32/64/128/256/512/1024 @1x and @2x)",
  "Bulk .icns ZIP exports",
  "Cloud sync across devices (coming soon)",
  "Priority support and early access to new features",
  "Lifetime license — pay once, own forever",
];

export default function ProPage() {
  return (
    <>
      <SiteHeader />
      <div className="container py-16">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border/40 bg-secondary/40 px-3 py-1 text-xs">
            <Crown className="h-3 w-3 text-primary" /> MacFolders Pro
          </span>
          <h1 className="mt-4 text-4xl font-semibold">Buy once. Own forever.</h1>
          <p className="mt-3 text-pretty text-muted-foreground">
            MacFolders core stays free for everyone. Pro unlocks the formats and workflows that turn it
            into a complete icon studio.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2">
          <Plan
            title="Free"
            price="$0"
            cta={<Button asChild variant="outline" className="w-full"><Link href="/editor">Open editor</Link></Button>}
            features={FREE}
          />
          <Plan
            title="Pro"
            price="$4 once"
            highlight
            cta={<Button className="w-full" disabled>Checkout coming soon</Button>}
            features={PRO}
          />
        </div>

        <p className="mx-auto mt-10 max-w-2xl text-center text-xs text-muted-foreground">
          Not affiliated with Apple Inc. Apple, macOS, and the Finder folder shape are trademarks of Apple Inc.
        </p>
      </div>
      <SiteFooter />
    </>
  );
}

function Plan({
  title,
  price,
  features,
  cta,
  highlight,
}: {
  title: string;
  price: string;
  features: string[];
  cta: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-2xl border p-6 ${highlight ? "border-primary/60 bg-primary/5" : "border-border/40 bg-card/40"}`}>
      <p className="text-sm uppercase tracking-wider text-muted-foreground">{title}</p>
      <p className="mt-2 text-3xl font-semibold">{price}</p>
      <ul className="mt-6 space-y-2 text-sm">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <Check className={`mt-0.5 h-4 w-4 shrink-0 ${highlight ? "text-primary" : "text-muted-foreground"}`} />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <div className="mt-6">{cta}</div>
    </div>
  );
}
