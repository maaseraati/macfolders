"use client";

import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";

const cache = new Map<string, string>();

const iconMap = LucideIcons as unknown as Record<string, LucideIcon>;

export const SYMBOL_LIBRARY: { name: string; component: LucideIcon }[] = [
  "Heart",
  "Star",
  "Bookmark",
  "Bell",
  "Calendar",
  "Clock",
  "Camera",
  "Image",
  "Music2",
  "Video",
  "Mic",
  "Headphones",
  "Code2",
  "Terminal",
  "Cpu",
  "Database",
  "Cloud",
  "Globe",
  "Briefcase",
  "FileText",
  "Folder",
  "FolderOpen",
  "Archive",
  "Box",
  "Package",
  "Truck",
  "ShoppingBag",
  "ShoppingCart",
  "DollarSign",
  "CreditCard",
  "Wallet",
  "ChartLine",
  "TrendingUp",
  "PieChart",
  "Award",
  "Trophy",
  "Target",
  "Flag",
  "Gift",
  "Lightbulb",
  "Sparkles",
  "Wand2",
  "Palette",
  "Brush",
  "Pen",
  "Pencil",
  "Sticker",
  "StickyNote",
  "Paperclip",
  "Pin",
  "Lock",
  "Unlock",
  "Key",
  "Shield",
  "Eye",
  "EyeOff",
  "Search",
  "Filter",
  "Hash",
  "AtSign",
  "Mail",
  "MessageCircle",
  "MessageSquare",
  "Phone",
  "Send",
  "Share2",
  "Link",
  "Map",
  "MapPin",
  "Compass",
  "Plane",
  "Car",
  "Bike",
  "Coffee",
  "Pizza",
  "IceCream",
  "Apple",
  "Cherry",
  "Leaf",
  "Flower2",
  "Trees",
  "Mountain",
  "Sun",
  "Moon",
  "CloudRain",
  "Snowflake",
  "Flame",
  "Droplet",
  "Wind",
  "Rocket",
  "Atom",
  "FlaskConical",
  "Microscope",
  "Dna",
  "Brain",
  "Smile",
  "Cat",
  "Dog",
  "Bird",
  "Fish",
  "Bug",
  "GraduationCap",
  "BookOpen",
  "Library",
  "Layers",
  "Activity",
  "Gamepad2",
  "Dumbbell",
  "Music",
  "Radio",
  "Tv",
  "Monitor",
  "Smartphone",
  "Laptop",
  "Server",
  "HardDrive",
  "Wifi",
  "Bluetooth",
  "Battery",
  "Plug",
  "Settings",
  "Sliders",
  "Zap",
  "Bolt",
  "Anchor",
  "Feather",
  "Crown",
  "Tag",
  "Tags",
  "ScrollText",
  "Newspaper",
  "Notebook",
  "Pencil",
  "Edit3",
  "Crosshair",
  "Telescope",
  "Tent",
  "Castle",
  "Construction",
  "Hammer",
  "Wrench",
  "Cog",
  "Magnet",
  "Recycle",
  "Smile",
  "Download",
]
  .filter((name, i, arr) => arr.indexOf(name) === i && iconMap[name])
  .map((name) => ({ name, component: iconMap[name] }));

export function renderSymbolToDataUrl({
  name,
  color,
  strokeWidth = 2,
  filled = false,
  size = 1024,
}: {
  name: string;
  color: string;
  strokeWidth?: number;
  filled?: boolean;
  size?: number;
}): string | null {
  const cacheKey = `${name}:${color}:${strokeWidth}:${filled}:${size}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const Icon = iconMap[name];
  if (!Icon) return null;

  const svg = renderToStaticMarkup(
    createElement(Icon as unknown as React.ComponentType<Record<string, unknown>>, {
      size,
      strokeWidth,
      color,
      fill: filled ? color : "none",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": true,
    })
  );

  if (typeof window === "undefined") return null;
  const blob = new Blob([svg], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  cache.set(cacheKey, url);
  return url;
}
