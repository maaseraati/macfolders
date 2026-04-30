export type LayerType = "emoji" | "symbol" | "image" | "text";
export type LayerZone = "inside" | "badge";
export type FolderStyle = "finder" | "soft" | "glass" | "flat";
export type BlendMode =
  | "source-over"
  | "multiply"
  | "screen"
  | "overlay"
  | "darken"
  | "lighten"
  | "color-dodge"
  | "color-burn"
  | "hard-light"
  | "soft-light"
  | "difference"
  | "exclusion"
  | "hue"
  | "saturation"
  | "color"
  | "luminosity";

export interface ShadowProps {
  enabled: boolean;
  color: string;
  blur: number;
  offsetX: number;
  offsetY: number;
  opacity: number;
}

export interface BaseLayer {
  id: string;
  type: LayerType;
  name: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  opacity: number;
  blendMode: BlendMode;
  shadow: ShadowProps;
  tint: string | null;
  zone: LayerZone;
  hidden: boolean;
  locked: boolean;
}

export interface EmojiLayer extends BaseLayer {
  type: "emoji";
  emoji: string;
}

export interface SymbolLayer extends BaseLayer {
  type: "symbol";
  symbolName: string;
  strokeWidth: number;
  filled: boolean;
}

export interface ImageLayer extends BaseLayer {
  type: "image";
  src: string;
  naturalWidth: number;
  naturalHeight: number;
}

export interface TextLayer extends BaseLayer {
  type: "text";
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  color: string;
  align: "left" | "center" | "right";
}

export type Layer = EmojiLayer | SymbolLayer | ImageLayer | TextLayer;

export interface FolderSettings {
  style: FolderStyle;
  gradientStrength: number;
  brightness: number;
  opacity: number;
  shadowEnabled: boolean;
  shadowBlur: number;
  shadowOpacity: number;
  shadowOffsetY: number;
  outlineEnabled: boolean;
  outlineColor: string;
  outlineWidth: number;
  tags: string[];
}

export interface FolderProject {
  id: string;
  name: string;
  baseColor: string;
  settings: FolderSettings;
  layers: Layer[];
  createdAt: number;
  updatedAt: number;
}

export interface TemplateDefinition {
  id: string;
  name: string;
  category: string;
  baseColor: string;
  layers: Omit<Layer, "id">[];
}

export const DEFAULT_SHADOW: ShadowProps = {
  enabled: true,
  color: "#000000",
  blur: 24,
  offsetX: 0,
  offsetY: 12,
  opacity: 0.35,
};

export const DEFAULT_LAYER_PROPS: Pick<
  BaseLayer,
  "x" | "y" | "scale" | "rotation" | "opacity" | "blendMode" | "shadow" | "tint" | "zone" | "hidden" | "locked"
> = {
  x: 512,
  y: 560,
  scale: 1,
  rotation: 0,
  opacity: 1,
  blendMode: "source-over",
  shadow: { ...DEFAULT_SHADOW },
  tint: null,
  zone: "inside",
  hidden: false,
  locked: false,
};

export const DEFAULT_BASE_COLOR = "#5BB0FF";

export const DEFAULT_FOLDER_SETTINGS: FolderSettings = {
  style: "finder",
  gradientStrength: 1,
  brightness: 0,
  opacity: 1,
  shadowEnabled: true,
  shadowBlur: 32,
  shadowOpacity: 0.35,
  shadowOffsetY: 18,
  outlineEnabled: false,
  outlineColor: "#FFFFFF",
  outlineWidth: 3,
  tags: [],
};
