"use client";

import type Konva from "konva";
import { saveAs } from "file-saver";
import JSZip from "jszip";
import * as png2icons from "png2icons";
import { Buffer } from "buffer";
import { STAGE_SIZE } from "@/lib/folder-paths";
import { slugify } from "./utils";

export async function exportPng(
  stage: Konva.Stage,
  size: number,
  filename: string
): Promise<Blob> {
  // Hide transformer borders during export.
  const dataUrl = stage.toDataURL({
    pixelRatio: size / STAGE_SIZE,
    mimeType: "image/png",
  });
  const blob = await fetch(dataUrl).then((r) => r.blob());
  saveAs(blob, `${slugify(filename) || "macfolder"}-${size}.png`);
  return blob;
}

export async function copyPngToClipboard(stage: Konva.Stage): Promise<void> {
  const dataUrl = stage.toDataURL({ pixelRatio: 1, mimeType: "image/png" });
  const blob = await fetch(dataUrl).then((r) => r.blob());
  if (typeof ClipboardItem === "undefined" || !navigator.clipboard?.write) {
    throw new Error("Clipboard API not available");
  }
  await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
}

export async function stageToPngBuffer(
  stage: Konva.Stage,
  size: number
): Promise<Uint8Array> {
  const dataUrl = stage.toDataURL({
    pixelRatio: size / STAGE_SIZE,
    mimeType: "image/png",
  });
  const arrayBuf = await fetch(dataUrl).then((r) => r.arrayBuffer());
  return new Uint8Array(arrayBuf);
}

export async function exportIcns(
  stage: Konva.Stage,
  filename: string
): Promise<void> {
  const buffer = await stageToPngBuffer(stage, 1024);
  const icns = png2icons.createICNS(
    Buffer.from(buffer),
    png2icons.BICUBIC,
    0
  );
  if (!icns) throw new Error("Failed to create .icns");
  saveAs(new Blob([new Uint8Array(icns)]), `${slugify(filename) || "macfolder"}.icns`);
}

export function exportSvg(svgMarkup: string, filename: string): void {
  const blob = new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" });
  saveAs(blob, `${slugify(filename) || "macfolder"}.svg`);
}

export interface BulkExportItem {
  name: string;
  png512: Uint8Array;
  png1024: Uint8Array;
  icns?: Uint8Array | null;
}

export async function downloadBulkZip(
  items: BulkExportItem[],
  zipName = "macfolders.zip"
): Promise<void> {
  const zip = new JSZip();
  for (const item of items) {
    const slug = slugify(item.name) || "macfolder";
    zip.file(`${slug}/${slug}-512.png`, item.png512);
    zip.file(`${slug}/${slug}-1024.png`, item.png1024);
    if (item.icns) {
      zip.file(`${slug}/${slug}.icns`, item.icns);
    }
  }
  const blob = await zip.generateAsync({ type: "blob" });
  saveAs(blob, zipName);
}
