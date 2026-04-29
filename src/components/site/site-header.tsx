import Link from "next/link";
import { Folder } from "lucide-react";
import { Button } from "@/components/ui/button";

const links: Array<{ href: string; label: string }> = [
  { href: "/editor", label: "Editor" },
  { href: "/gallery", label: "Gallery" },
  { href: "/templates", label: "Templates" },
  { href: "/bulk", label: "Bulk" },
  { href: "/how-to-apply", label: "How to apply" },
  { href: "/pro", label: "Pro" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-3 z-30 mx-auto mt-3 w-[min(1100px,calc(100%-1.5rem))] rounded-2xl glass-strong">
      <div className="flex h-12 items-center justify-between gap-4 px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary/15 text-primary">
            <Folder className="h-4 w-4" />
          </span>
          <span className="tracking-tight">MacFolders</span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Button key={link.href} asChild variant="ghost" size="sm" className="rounded-full">
              <Link href={link.href}>{link.label}</Link>
            </Button>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="hidden rounded-full sm:inline-flex">
            <Link href="/editor">Open editor</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
