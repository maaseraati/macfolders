import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export const metadata = { title: "How to apply" };

const STEPS = [
  {
    title: "Open the folder's Get Info window",
    body: "Right-click the folder in Finder → Get Info, or select it and press Cmd+I.",
  },
  {
    title: "Reveal the icon target",
    body: "In the top-left of the Get Info window you'll see a small folder icon. Click it once so it has a blue selection ring.",
  },
  {
    title: "Drag your PNG onto the icon",
    body: "Drag the PNG you exported from MacFolders onto that small icon. macOS will replace the folder's icon instantly.",
  },
  {
    title: "Optional: use .icns for crisp scaling",
    body: "If you exported an .icns file, use a tool like Image2Icon or `sips` to set the icon — .icns embeds every required size for sharp rendering at any zoom level.",
  },
  {
    title: "Reset to default",
    body: "Open Get Info on the folder, click the small icon to select it, and press Delete.",
  },
];

const VERSION_NOTES: Record<string, string> = {
  "macOS 13 (Ventura)":
    "Get Info → click the small icon → paste your image with Cmd+V or drag the PNG. If macOS asks for permission, allow it for Finder.",
  "macOS 14 (Sonoma)":
    "Same flow as Ventura. If you don't see a small icon at the top-left of Get Info, scroll up — Sonoma sometimes hides it under the folder preview.",
  "macOS 15 (Sequoia)":
    "Identical workflow. Sequoia respects custom icons everywhere Finder shows folders, including the new Desktop Stages.",
};

export default function HowToApplyPage() {
  return (
    <>
      <SiteHeader />
      <div className="container py-12">
        <h1 className="text-3xl font-semibold">How to apply your icon</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          The same steps work on macOS Big Sur, Monterey, Ventura, Sonoma, and Sequoia. Pick your
          version below for any minor differences.
        </p>

        <ol className="mt-8 grid gap-4 md:grid-cols-2">
          {STEPS.map((step, i) => (
            <li key={step.title} className="rounded-xl border border-border/40 bg-card/40 p-5">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-primary/15 text-xs text-primary">{i + 1}</span>
              <p className="mt-3 text-sm font-medium">{step.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{step.body}</p>
            </li>
          ))}
        </ol>

        <h2 className="mt-12 text-xl font-semibold">Version notes</h2>
        <Tabs defaultValue="macOS 14 (Sonoma)" className="mt-4">
          <TabsList>
            {Object.keys(VERSION_NOTES).map((k) => (
              <TabsTrigger key={k} value={k}>{k}</TabsTrigger>
            ))}
          </TabsList>
          {Object.entries(VERSION_NOTES).map(([k, v]) => (
            <TabsContent key={k} value={k} className="rounded-md border border-border/40 bg-card/40 p-4 text-sm text-muted-foreground">
              {v}
            </TabsContent>
          ))}
        </Tabs>

        <h2 className="mt-12 text-xl font-semibold">Power user: from the command line</h2>
        <pre className="mt-3 overflow-x-auto rounded-lg border border-border/40 bg-secondary/30 p-4 text-xs">
{`# Apply a PNG to a folder using the system 'Rez' / 'sips' workflow.
sips -i my-folder.png            # generate icns resources from the PNG
DeRez -only icns my-folder.png > tmp.rsrc
Rez -append tmp.rsrc -o ~/Documents/MyFolder
SetFile -a C ~/Documents/MyFolder
rm tmp.rsrc`}
        </pre>
      </div>
      <SiteFooter />
    </>
  );
}
