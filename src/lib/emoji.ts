"use client";

const cache = new Map<string, string>();

const TWEMOJI_BASE = "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/";

function emojiToCodePoints(emoji: string): string {
  const codePoints: string[] = [];
  for (const ch of Array.from(emoji)) {
    const cp = ch.codePointAt(0);
    if (cp == null) continue;
    if (cp === 0xfe0f) continue;
    codePoints.push(cp.toString(16));
  }
  if (codePoints.length === 0) {
    codePoints.push((emoji.codePointAt(0) ?? 0).toString(16));
  }
  return codePoints.join("-");
}

export function emojiToTwemojiUrl(emoji: string): string {
  const cached = cache.get(emoji);
  if (cached) return cached;
  const code = emojiToCodePoints(emoji);
  const url = `${TWEMOJI_BASE}${code}.svg`;
  cache.set(emoji, url);
  return url;
}

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
