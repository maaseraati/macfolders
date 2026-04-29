"use client";

import * as React from "react";
import { Stage, Layer as KonvaLayer, Transformer } from "react-konva";
import type Konva from "konva";
import { useEditorStore } from "@/lib/store";
import { FolderBack, FolderFront } from "@/components/folder/FolderShape";
import { STAGE_SIZE } from "@/lib/folder-paths";
import { LayerNode } from "./LayerNode";

export { STAGE_SIZE };

interface FolderCanvasProps {
  size?: number;
  onStageReady?: (stage: Konva.Stage | null) => void;
}

export function FolderCanvas({ size = 540, onStageReady }: FolderCanvasProps) {
  const project = useEditorStore((s) => s.project);
  const selectedLayerId = useEditorStore((s) => s.selectedLayerId);
  const selectLayer = useEditorStore((s) => s.selectLayer);
  const updateLayer = useEditorStore((s) => s.updateLayer);
  const saveSnapshot = useEditorStore((s) => s.saveSnapshot);

  const stageRef = React.useRef<Konva.Stage>(null);
  const transformerRef = React.useRef<Konva.Transformer>(null);
  const nodeMap = React.useRef<Map<string, Konva.Node>>(new Map());

  React.useEffect(() => {
    onStageReady?.(stageRef.current);
    return () => onStageReady?.(null);
  }, [onStageReady]);

  const registerNode = React.useCallback(
    (id: string, node: Konva.Node | null) => {
      if (node) nodeMap.current.set(id, node);
      else nodeMap.current.delete(id);
    },
    []
  );

  React.useEffect(() => {
    const transformer = transformerRef.current;
    if (!transformer) return;
    if (!selectedLayerId) {
      transformer.nodes([]);
      transformer.getLayer()?.batchDraw();
      return;
    }
    const node = nodeMap.current.get(selectedLayerId);
    if (node) {
      transformer.nodes([node]);
      transformer.getLayer()?.batchDraw();
    } else {
      // wait one frame for the node to mount
      const id = window.requestAnimationFrame(() => {
        const n = nodeMap.current.get(selectedLayerId);
        if (n) {
          transformer.nodes([n]);
          transformer.getLayer()?.batchDraw();
        }
      });
      return () => window.cancelAnimationFrame(id);
    }
  }, [selectedLayerId, project.layers]);

  const scale = size / STAGE_SIZE;

  const insideLayers = project.layers.filter((l) => l.zone === "inside");
  const badgeLayers = project.layers.filter((l) => l.zone === "badge");

  return (
    <Stage
      ref={stageRef}
      width={size}
      height={size}
      scaleX={scale}
      scaleY={scale}
      onMouseDown={(e) => {
        if (e.target === e.target.getStage()) selectLayer(null);
      }}
      onTouchStart={(e) => {
        if (e.target === e.target.getStage()) selectLayer(null);
      }}
    >
      <KonvaLayer listening={false}>
        <FolderBack baseColor={project.baseColor} />
      </KonvaLayer>
      <KonvaLayer>
        {insideLayers.map((layer) => (
          <LayerNode
            key={layer.id}
            layer={layer}
            onSelect={() => selectLayer(layer.id)}
            onChange={(patch) => updateLayer(layer.id, patch)}
            onSaveSnapshot={saveSnapshot}
            registerNode={registerNode}
          />
        ))}
      </KonvaLayer>
      <KonvaLayer listening={false}>
        <FolderFront baseColor={project.baseColor} />
      </KonvaLayer>
      <KonvaLayer>
        {badgeLayers.map((layer) => (
          <LayerNode
            key={layer.id}
            layer={layer}
            onSelect={() => selectLayer(layer.id)}
            onChange={(patch) => updateLayer(layer.id, patch)}
            onSaveSnapshot={saveSnapshot}
            registerNode={registerNode}
          />
        ))}
        <Transformer
          ref={transformerRef}
          rotateEnabled
          ignoreStroke
          anchorSize={12}
          borderStroke="#3b82f6"
          anchorStroke="#3b82f6"
          anchorFill="#ffffff"
          boundBoxFunc={(oldBox, newBox) => {
            if (Math.abs(newBox.width) < 16 || Math.abs(newBox.height) < 16) {
              return oldBox;
            }
            return newBox;
          }}
        />
      </KonvaLayer>
    </Stage>
  );
}
