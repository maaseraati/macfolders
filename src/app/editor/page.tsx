import { Suspense } from "react";
import { EditorClient } from "@/components/editor/EditorClient";

export const metadata = {
  title: "Editor",
};

export const dynamic = "force-dynamic";

export default function EditorPage() {
  return (
    <>
      <div className="hidden lg:block">
        <Suspense fallback={null}>
          <EditorClient />
        </Suspense>
      </div>
      <div className="container flex min-h-screen flex-col items-center justify-center gap-6 text-center lg:hidden">
        <div className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">Best on desktop</div>
        <h1 className="text-2xl font-semibold">The MacFolders editor needs a wider screen</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          The 1024×1024 canvas, three-column layout and precision controls work best on a 1024px+
          display. Open this page on your Mac to design.
        </p>
        <a href="/templates" className="text-sm font-medium text-primary underline">Browse templates instead →</a>
      </div>
    </>
  );
}
