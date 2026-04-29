import { GalleryClient } from "@/components/gallery/GalleryClient";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";

export const metadata = { title: "Gallery" };

export default function GalleryPage() {
  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[520px] bg-[radial-gradient(circle_at_top_left,rgba(90,170,255,0.25),transparent_38%),radial-gradient(circle_at_top_right,rgba(255,120,190,0.2),transparent_34%),linear-gradient(180deg,#f7f8fb,transparent)]" />
      <SiteHeader />
      <main className="container py-12">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-medium text-blue-600">Local gallery</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Saved folder designs
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Browse every folder saved on this device. Search by name, filter
              by color or tags, then edit, duplicate, or delete any template.
            </p>
          </div>
        </div>
        <GalleryClient />
      </main>
      <SiteFooter />
    </>
  );
}
