"use client";

import * as React from "react";
import { Image as KonvaImage, Text as KonvaText } from "react-konva";
import useImage from "use-image";
import type Konva from "konva";
import type { Layer } from "@/lib/types";
import { emojiToAppleUrl } from "@/lib/emoji";
import { renderSymbolToDataUrl } from "@/lib/symbols";

interface LayerNodeProps {
  layer: Layer;
  onSelect: () => void;
  onChange: (patch: Partial<Layer>) => void;
  onSaveSnapshot: () => void;
  registerNode: (id: string, node: Konva.Node | null) => void;
}

const SHADOW_PROPS = (layer: Layer) =>
  layer.shadow.enabled
    ? {
        shadowColor: layer.shadow.color,
        shadowBlur: layer.shadow.blur,
        shadowOpacity: layer.shadow.opacity,
        shadowOffsetX: layer.shadow.offsetX,
        shadowOffsetY: layer.shadow.offsetY,
      }
    : {
        shadowOpacity: 0,
      };

export function LayerNode({
  layer,
  onSelect,
  onChange,
  onSaveSnapshot,
  registerNode,
}: LayerNodeProps) {
  if (layer.hidden) return null;

  if (layer.type === "emoji") {
    return (
      <EmojiLayer
        layer={layer}
        onSelect={onSelect}
        onChange={onChange}
        onSaveSnapshot={onSaveSnapshot}
        registerNode={registerNode}
      />
    );
  }
  if (layer.type === "symbol") {
    return (
      <SymbolLayer
        layer={layer}
        onSelect={onSelect}
        onChange={onChange}
        onSaveSnapshot={onSaveSnapshot}
        registerNode={registerNode}
      />
    );
  }
  if (layer.type === "image") {
    return (
      <ImageLayer
        layer={layer}
        onSelect={onSelect}
        onChange={onChange}
        onSaveSnapshot={onSaveSnapshot}
        registerNode={registerNode}
      />
    );
  }
  if (layer.type === "text") {
    return (
      <TextLayerNode
        layer={layer}
        onSelect={onSelect}
        onChange={onChange}
        onSaveSnapshot={onSaveSnapshot}
        registerNode={registerNode}
      />
    );
  }
  return null;
}

const COMMON_HANDLERS = (
  layer: Layer,
  onSelect: () => void,
  onChange: (patch: Partial<Layer>) => void,
  onSaveSnapshot: () => void
) => ({
  draggable: !layer.locked,
  onMouseDown: onSelect,
  onTap: onSelect,
  onDragStart: () => onSaveSnapshot(),
  onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => {
    // Drag should never modify scale; reset to be safe.
    e.target.scaleX(layer.scale);
    e.target.scaleY(layer.scale);
    onChange({ x: e.target.x(), y: e.target.y() });
  },
  onTransformStart: () => onSaveSnapshot(),
  onTransformEnd: (e: Konva.KonvaEventObject<Event>) => {
    const node = e.target;
    const newScale = node.scaleX();
    const merged = Math.max(0.1, Math.min(20, layer.scale * newScale));
    node.scaleX(layer.scale);
    node.scaleY(layer.scale);
    onChange({
      x: node.x(),
      y: node.y(),
      scale: merged,
      rotation: node.rotation(),
    });
  },
});

function EmojiLayer({ layer, onSelect, onChange, onSaveSnapshot, registerNode }:
  LayerNodeProps & { layer: Extract<Layer, { type: "emoji" }> }) {
  const url = emojiToAppleUrl(layer.emoji);
  const [image] = useImage(url, "anonymous");
  const ref = React.useRef<Konva.Image>(null);
  React.useEffect(() => {
    registerNode(layer.id, ref.current);
    return () => registerNode(layer.id, null);
  }, [layer.id, registerNode]);
  const baseSize = 240;
  return (
    <KonvaImage
      ref={ref}
      image={image ?? undefined}
      width={baseSize}
      height={baseSize}
      offsetX={baseSize / 2}
      offsetY={baseSize / 2}
      x={layer.x}
      y={layer.y}
      scaleX={layer.scale}
      scaleY={layer.scale}
      rotation={layer.rotation}
      opacity={layer.opacity}
      globalCompositeOperation={layer.blendMode}
      {...SHADOW_PROPS(layer)}
      {...COMMON_HANDLERS(layer, onSelect, onChange, onSaveSnapshot)}
    />
  );
}

function SymbolLayer({ layer, onSelect, onChange, onSaveSnapshot, registerNode }:
  LayerNodeProps & { layer: Extract<Layer, { type: "symbol" }> }) {
  const url = React.useMemo(
    () =>
      renderSymbolToDataUrl({
        name: layer.symbolName,
        color: layer.tint ?? "#ffffff",
        strokeWidth: layer.strokeWidth,
        filled: layer.filled,
      }),
    [layer.symbolName, layer.tint, layer.strokeWidth, layer.filled]
  );
  const [image] = useImage(url ?? "", "anonymous");
  const ref = React.useRef<Konva.Image>(null);
  React.useEffect(() => {
    registerNode(layer.id, ref.current);
    return () => registerNode(layer.id, null);
  }, [layer.id, registerNode]);
  const baseSize = 64;
  return (
    <KonvaImage
      ref={ref}
      image={image ?? undefined}
      width={baseSize}
      height={baseSize}
      offsetX={baseSize / 2}
      offsetY={baseSize / 2}
      x={layer.x}
      y={layer.y}
      scaleX={layer.scale}
      scaleY={layer.scale}
      rotation={layer.rotation}
      opacity={layer.opacity}
      globalCompositeOperation={layer.blendMode}
      {...SHADOW_PROPS(layer)}
      {...COMMON_HANDLERS(layer, onSelect, onChange, onSaveSnapshot)}
    />
  );
}

function ImageLayer({ layer, onSelect, onChange, onSaveSnapshot, registerNode }:
  LayerNodeProps & { layer: Extract<Layer, { type: "image" }> }) {
  const [image] = useImage(layer.src, "anonymous");
  const ref = React.useRef<Konva.Image>(null);
  React.useEffect(() => {
    registerNode(layer.id, ref.current);
    return () => registerNode(layer.id, null);
  }, [layer.id, registerNode]);
  const w = layer.naturalWidth || 400;
  const h = layer.naturalHeight || 400;
  return (
    <KonvaImage
      ref={ref}
      image={image ?? undefined}
      width={w}
      height={h}
      offsetX={w / 2}
      offsetY={h / 2}
      x={layer.x}
      y={layer.y}
      scaleX={layer.scale}
      scaleY={layer.scale}
      rotation={layer.rotation}
      opacity={layer.opacity}
      globalCompositeOperation={layer.blendMode}
      {...SHADOW_PROPS(layer)}
      {...COMMON_HANDLERS(layer, onSelect, onChange, onSaveSnapshot)}
    />
  );
}

function TextLayerNode({ layer, onSelect, onChange, onSaveSnapshot, registerNode }:
  LayerNodeProps & { layer: Extract<Layer, { type: "text" }> }) {
  const ref = React.useRef<Konva.Text>(null);
  React.useEffect(() => {
    registerNode(layer.id, ref.current);
    return () => registerNode(layer.id, null);
  }, [layer.id, registerNode]);
  const fontStyle = layer.fontWeight >= 600 ? "bold" : "normal";
  return (
    <KonvaText
      ref={ref}
      text={layer.text}
      fontSize={layer.fontSize}
      fontFamily={layer.fontFamily}
      fontStyle={fontStyle}
      fill={layer.color}
      align={layer.align}
      x={layer.x}
      y={layer.y}
      offsetX={0}
      offsetY={0}
      scaleX={layer.scale}
      scaleY={layer.scale}
      rotation={layer.rotation}
      opacity={layer.opacity}
      globalCompositeOperation={layer.blendMode}
      {...SHADOW_PROPS(layer)}
      {...COMMON_HANDLERS(layer, onSelect, onChange, onSaveSnapshot)}
    />
  );
}
