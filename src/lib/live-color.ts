"use client";

/**
 * Live-color channel.
 *
 * The native `<input type="color">` fires onChange continuously while the
 * user drags inside the OS picker. Pushing every value through the React
 * store would mean re-rendering every Konva layer on every pixel of hue
 * change, which feels laggy. Instead, we publish the in-flight color to a
 * tiny pub-sub channel and let `<FolderCanvas>` mutate the folder Path
 * nodes imperatively. The store is only updated on commit (when the
 * picker closes or the user picks a swatch).
 */
type Listener = (hex: string) => void;

const listeners = new Set<Listener>();

export const liveColor = {
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  emit(hex: string): void {
    listeners.forEach((l) => l(hex));
  },
};
