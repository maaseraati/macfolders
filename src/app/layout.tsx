import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: {
    default: "MacFolders — Custom macOS folder icons",
    template: "%s — MacFolders",
  },
  description:
    "Design beautiful custom macOS folder icons in your browser. Color, emoji, symbols, text, and image layers. Export PNG or .icns. No login required.",
  keywords: [
    "macOS folder icons",
    "Big Sur folder icon",
    "Finder folder",
    "icns export",
    "MacFolders",
  ],
  metadataBase: new URL("https://macfolders.app"),
  openGraph: {
    title: "MacFolders — Custom macOS folder icons",
    description:
      "Design beautiful custom macOS folder icons in your browser. Free, fast, no signup.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
