import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { BulkClient } from "@/components/bulk/BulkClient";

export const metadata = { title: "Bulk export" };

export const dynamic = "force-dynamic";

export default function BulkPage() {
  return (
    <>
      <SiteHeader />
      <div className="container py-12">
        <h1 className="text-3xl font-semibold">Bulk export</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Paste a list of folder names (one per line), pick a base style, and download a ZIP with one
          PNG (512 + 1024) per name. Toggle Pro to include .icns files.
        </p>
        <div className="mt-8">
          <BulkClient />
        </div>
      </div>
      <SiteFooter />
    </>
  );
}
