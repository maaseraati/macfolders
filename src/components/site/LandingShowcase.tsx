"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FolderSvg } from "@/components/folder/FolderSvg";

interface ShowcaseItem {
  name: string;
  baseColor: string;
  emoji: string;
  /** A CSS background string used for the desktop wallpaper. */
  wallpaper: string;
}

const SHOWCASE: ShowcaseItem[] = [
  {
    name: "Work",
    baseColor: "#5BB0FF",
    emoji: "💼",
    wallpaper:
      "radial-gradient(120% 90% at 30% 0%, #6ec3ff 0%, #2f7bd3 45%, #0a3a78 100%)",
  },
  {
    name: "Code",
    baseColor: "#7F8CFF",
    emoji: "💻",
    wallpaper:
      "radial-gradient(120% 90% at 70% 0%, #8a9bff 0%, #3a3fa6 45%, #11154a 100%)",
  },
  {
    name: "Design",
    baseColor: "#FF6BC1",
    emoji: "🎨",
    wallpaper:
      "radial-gradient(120% 90% at 50% 0%, #ffb3d6 0%, #c64aa3 45%, #45154e 100%)",
  },
  {
    name: "Music",
    baseColor: "#FFB347",
    emoji: "🎧",
    wallpaper:
      "radial-gradient(120% 90% at 30% 100%, #ffcc8a 0%, #d8732a 45%, #3a1d05 100%)",
  },
  {
    name: "School",
    baseColor: "#7AB8FF",
    emoji: "📚",
    wallpaper:
      "radial-gradient(120% 90% at 70% 100%, #b3e0ff 0%, #4f9ad6 45%, #0e2a4a 100%)",
  },
  {
    name: "Personal",
    baseColor: "#5DCB8A",
    emoji: "✨",
    wallpaper:
      "radial-gradient(120% 90% at 50% 100%, #b6e8c6 0%, #2f9d6c 45%, #0a3a26 100%)",
  },
];

export function LandingShowcase() {
  const [index, setIndex] = React.useState(0);
  const [animKey, setAnimKey] = React.useState(0);
  const item = SHOWCASE[index];
  const total = SHOWCASE.length;

  const go = (delta: number) => {
    setIndex((i) => (i + delta + total) % total);
    setAnimKey((k) => k + 1);
  };

  // Auto-advance every 5s.
  React.useEffect(() => {
    const id = window.setInterval(() => go(1), 5000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto w-full max-w-[640px]">
      <div className="ring-mac relative overflow-hidden rounded-[18px]">
        {/* Title bar */}
        <div className="flex items-center gap-2 bg-[#e9e9ec] px-3 py-2.5">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          <span className="ml-3 text-[12px] font-medium text-neutral-700">Desktop</span>
        </div>

        {/* Wallpaper + folder */}
        <div
          key={animKey}
          className="relative h-[340px] w-full animate-fade-bg transition-[background] duration-700 ease-out"
          style={{ background: item.wallpaper }}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_120%,rgba(0,0,0,0.35),transparent)]" />

          <div className="absolute inset-0 grid place-items-center">
            <div
              key={`folder-${animKey}`}
              className="flex animate-folder-pop flex-col items-center gap-2"
            >
              <FolderSvg
                baseColor={item.baseColor}
                emoji={item.emoji}
                size={200}
                label={`${item.name} folder preview`}
              />
              <span className="rounded-md bg-black/30 px-2 py-0.5 text-[13px] font-medium text-white shadow-sm backdrop-blur-sm">
                {item.name}
              </span>
            </div>
          </div>

          {/* Arrows */}
          <button
            type="button"
            aria-label="Previous"
            onClick={() => go(-1)}
            className="group absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/70 text-neutral-800 shadow-sm backdrop-blur transition hover:bg-white"
          >
            <ChevronLeft className="h-5 w-5 transition group-active:-translate-x-0.5" />
          </button>
          <button
            type="button"
            aria-label="Next"
            onClick={() => go(1)}
            className="group absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/70 text-neutral-800 shadow-sm backdrop-blur transition hover:bg-white"
          >
            <ChevronRight className="h-5 w-5 transition group-active:translate-x-0.5" />
          </button>
        </div>

        {/* Dots */}
        <div className="flex items-center justify-center gap-1.5 bg-[#f3f3f6] py-3">
          {SHOWCASE.map((s, i) => (
            <button
              key={s.name}
              type="button"
              aria-label={`Show ${s.name}`}
              onClick={() => {
                setIndex(i);
                setAnimKey((k) => k + 1);
              }}
              className={
                i === index
                  ? "h-1.5 w-6 rounded-full bg-neutral-700 transition-all"
                  : "h-1.5 w-1.5 rounded-full bg-neutral-400/70 transition-all hover:bg-neutral-500"
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}
