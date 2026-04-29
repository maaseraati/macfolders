import Link from "next/link";
import { Folder } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/site/theme-toggle";

const links: Array<{ href: string; label: string }> = [
  { href: "/editor", label: "Editor" },
  { href: "/templates", label: "Templates" },
  { href: "/bulk", label: "Bulk" },
  { href: "/how-to-apply", label: "How to apply" },
  { href: "/pro", label: "Pro" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-primary/15 text-primary">
            <Folder className="h-4 w-4" />
          </span>
          <span>MacFolders</span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Button key={link.href} asChild variant="ghost" size="sm">
              <Link href={link.href}>{link.label}</Link>
            </Button>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link href="/editor">Open editor</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
