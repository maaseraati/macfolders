import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-background/40">
      <div className="container flex flex-col gap-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold">MacFolders</p>
          <p className="mt-1 max-w-md text-xs text-muted-foreground">
            Browser-based editor for designing custom macOS folder icons. Not affiliated with Apple Inc. Apple,
            macOS, and the Finder folder shape are trademarks of Apple Inc.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-x-10 gap-y-2 text-sm text-muted-foreground sm:flex sm:items-center sm:gap-6">
          <Link href="/editor" className="hover:text-foreground">Editor</Link>
          <Link href="/templates" className="hover:text-foreground">Templates</Link>
          <Link href="/bulk" className="hover:text-foreground">Bulk</Link>
          <Link href="/how-to-apply" className="hover:text-foreground">How to apply</Link>
          <Link href="/pro" className="hover:text-foreground">Pro</Link>
        </div>
      </div>
      <div className="border-t border-border/60 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} MacFolders. Designed for the macOS community.
      </div>
    </footer>
  );
}
