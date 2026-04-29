"use client";

const cache = new Map<string, string>();

/**
 * Returns a URL to the Apple-style PNG of a given emoji via emojicdn.elk.sh.
 * The CDN serves the official Apple emoji glyphs at high resolution, which
 * is what we want for macOS-style folder icons.
 */
export function emojiToAppleUrl(emoji: string): string {
  const cached = cache.get(emoji);
  if (cached) return cached;
  const url = `https://emojicdn.elk.sh/${encodeURIComponent(emoji)}?style=apple`;
  cache.set(emoji, url);
  return url;
}

// Backwards-compat alias kept for any old imports.
export const emojiToTwemojiUrl = emojiToAppleUrl;

export const POPULAR_EMOJI: string[] = [
  "😀", "😂", "🥰", "😎", "🤩", "🥳", "🤔", "🙃", "🤖", "👽", "👻", "🎃",
  "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "💖", "💔", "💯", "🔥",
  "✨", "⭐", "🌟", "⚡", "💫", "🌈", "☀️", "🌙", "🌸", "🌹", "🌻", "🌷",
  "🍀", "🌴", "🌵", "🍎", "🍊", "🍋", "🍌", "🍉", "🍓", "🍒", "🍑", "🍍",
  "🍕", "🍔", "🌮", "🍣", "🍩", "🍪", "🎂", "🍰", "🍷", "🍺", "☕", "🧋",
  "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮",
  "🚀", "🛸", "✈️", "🚗", "🚲", "🛹", "⛵", "🏝️", "🗻", "🏰", "🏠", "🛏️",
  "💼", "💻", "📱", "🎧", "🎮", "🎬", "🎨", "🎵", "🎤", "📚", "📒", "📷",
  "💡", "💎", "💰", "🏆", "🎯", "🛠️", "🔧", "🧰", "🧪", "🧬", "🔭", "🔬",
  "✏️", "✒️", "📝", "📌", "📎", "🔒", "🔑", "🛡️", "⚙️", "🧭", "🗂️", "📁",
];
