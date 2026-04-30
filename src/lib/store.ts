"use client";

import { create } from "zustand";
import { nanoid } from "nanoid";
import {
  DEFAULT_BASE_COLOR,
  DEFAULT_FOLDER_SETTINGS,
  DEFAULT_LAYER_PROPS,
  type FolderSettings,
  type FolderProject,
  type Layer,
  type LayerZone,
  type TemplateDefinition,
} from "./types";

const STORAGE_CURRENT = "macfolders:current";
const STORAGE_GALLERY = "macfolders:gallery";
const HISTORY_LIMIT = 60;
const GALLERY_LIMIT = 100;

const newProject = (): FolderProject => ({
  id: nanoid(8),
  name: "Untitled folder",
  baseColor: DEFAULT_BASE_COLOR,
  settings: { ...DEFAULT_FOLDER_SETTINGS },
  layers: [],
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

interface HistoryEntry {
  baseColor: string;
  settings: FolderSettings;
  layers: Layer[];
  name: string;
}

interface EditorState {
  project: FolderProject;
  selectedLayerId: string | null;
  past: HistoryEntry[];
  future: HistoryEntry[];
  hydrated: boolean;
  setName: (name: string) => void;
  setBaseColor: (hex: string) => void;
  setBaseColorLive: (hex: string) => void;
  updateSettings: (patch: Partial<FolderSettings>) => void;
  setTags: (tags: string[]) => void;
  selectLayer: (id: string | null) => void;
  addLayer: (layer: Omit<Layer, "id">) => string;
  updateLayer: (id: string, patch: Partial<Layer>) => void;
  removeLayer: (id: string) => void;
  duplicateLayer: (id: string) => void;
  reorderLayer: (id: string, dir: "up" | "down" | "top" | "bottom") => void;
  toggleLayerProp: (id: string, key: "hidden" | "locked") => void;
  setZone: (id: string, zone: LayerZone) => void;
  loadProject: (project: FolderProject) => void;
  loadTemplate: (template: TemplateDefinition) => void;
  resetProject: () => void;
  undo: () => void;
  redo: () => void;
  saveSnapshot: (label?: string) => void;
  hydrate: () => void;
  saveToGallery: (name?: string) => void;
  removeFromGallery: (id: string) => void;
  duplicateInGallery: (id: string) => void;
  getGallery: () => FolderProject[];
}

const snapshotOf = (project: FolderProject): HistoryEntry => ({
  baseColor: project.baseColor,
  settings: { ...(project.settings ?? DEFAULT_FOLDER_SETTINGS), tags: [...(project.settings?.tags ?? [])] },
  layers: project.layers.map((l) => ({ ...l, shadow: { ...l.shadow } })),
  name: project.name,
});

const normalizeProject = (project: FolderProject): FolderProject => ({
  ...project,
  settings: {
    ...DEFAULT_FOLDER_SETTINGS,
    ...(project.settings ?? {}),
    tags: project.settings?.tags ?? [],
  },
});

const persistCurrent = (project: FolderProject) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_CURRENT, JSON.stringify(project));
  } catch {
    // ignore storage errors
  }
};

const readGallery = (): FolderProject[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_GALLERY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as FolderProject[];
    return Array.isArray(parsed) ? parsed.map(normalizeProject) : [];
  } catch {
    return [];
  }
};

const writeGallery = (gallery: FolderProject[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_GALLERY, JSON.stringify(gallery.slice(0, GALLERY_LIMIT)));
  } catch {
    // ignore storage errors
  }
};

export const useEditorStore = create<EditorState>((set, get) => ({
  project: newProject(),
  selectedLayerId: null,
  past: [],
  future: [],
  hydrated: false,

  setName: (name) =>
    set((state) => {
      const project = { ...state.project, name, updatedAt: Date.now() };
      persistCurrent(project);
      return { project };
    }),

  setBaseColor: (hex) => {
    const state = get();
    const past = [...state.past, snapshotOf(state.project)].slice(-HISTORY_LIMIT);
    const project = { ...state.project, baseColor: hex, updatedAt: Date.now() };
    persistCurrent(project);
    set({ project, past, future: [] });
  },

  /**
   * Same as setBaseColor but without committing to the history stack.
   * Used for live previews while the user drags inside the native color
   * picker so we don't allocate a history entry per pixel of hue change.
   */
  setBaseColorLive: (hex: string) => {
    const state = get();
    const project = { ...state.project, baseColor: hex, updatedAt: Date.now() };
    set({ project });
  },

  updateSettings: (patch) => {
    const state = get();
    const past = [...state.past, snapshotOf(state.project)].slice(-HISTORY_LIMIT);
    const project = {
      ...state.project,
      settings: {
        ...DEFAULT_FOLDER_SETTINGS,
        ...state.project.settings,
        ...patch,
        tags: patch.tags ?? state.project.settings.tags,
      },
      updatedAt: Date.now(),
    };
    persistCurrent(project);
    set({ project, past, future: [] });
  },

  setTags: (tags) => {
    const state = get();
    const project = {
      ...state.project,
      settings: { ...state.project.settings, tags },
      updatedAt: Date.now(),
    };
    persistCurrent(project);
    set({ project });
  },

  selectLayer: (id) => set({ selectedLayerId: id }),

  addLayer: (layer) => {
    const id = nanoid(8);
    const state = get();
    const past = [...state.past, snapshotOf(state.project)].slice(-HISTORY_LIMIT);
    const newLayer: Layer = { ...(layer as Layer), id };
    const project = {
      ...state.project,
      layers: [...state.project.layers, newLayer],
      updatedAt: Date.now(),
    };
    persistCurrent(project);
    set({ project, selectedLayerId: id, past, future: [] });
    return id;
  },

  updateLayer: (id, patch) => {
    const state = get();
    const layer = state.project.layers.find((l) => l.id === id);
    if (!layer) return;
    const layers = state.project.layers.map((l) =>
      l.id === id ? ({ ...l, ...patch } as Layer) : l
    );
    const project = { ...state.project, layers, updatedAt: Date.now() };
    persistCurrent(project);
    set({ project });
  },

  removeLayer: (id) => {
    const state = get();
    const past = [...state.past, snapshotOf(state.project)].slice(-HISTORY_LIMIT);
    const layers = state.project.layers.filter((l) => l.id !== id);
    const project = { ...state.project, layers, updatedAt: Date.now() };
    persistCurrent(project);
    set({
      project,
      selectedLayerId: state.selectedLayerId === id ? null : state.selectedLayerId,
      past,
      future: [],
    });
  },

  duplicateLayer: (id) => {
    const state = get();
    const layer = state.project.layers.find((l) => l.id === id);
    if (!layer) return;
    const past = [...state.past, snapshotOf(state.project)].slice(-HISTORY_LIMIT);
    const copy: Layer = {
      ...layer,
      id: nanoid(8),
      name: `${layer.name} copy`,
      x: layer.x + 30,
      y: layer.y + 30,
    };
    const project = {
      ...state.project,
      layers: [...state.project.layers, copy],
      updatedAt: Date.now(),
    };
    persistCurrent(project);
    set({ project, selectedLayerId: copy.id, past, future: [] });
  },

  reorderLayer: (id, dir) => {
    const state = get();
    const layers = [...state.project.layers];
    const index = layers.findIndex((l) => l.id === id);
    if (index < 0) return;
    let target = index;
    if (dir === "up") target = Math.min(layers.length - 1, index + 1);
    else if (dir === "down") target = Math.max(0, index - 1);
    else if (dir === "top") target = layers.length - 1;
    else if (dir === "bottom") target = 0;
    if (target === index) return;
    const [item] = layers.splice(index, 1);
    layers.splice(target, 0, item);
    const project = { ...state.project, layers, updatedAt: Date.now() };
    persistCurrent(project);
    set({ project });
  },

  toggleLayerProp: (id, key) => {
    const state = get();
    const layers = state.project.layers.map((l) =>
      l.id === id ? ({ ...l, [key]: !l[key] } as Layer) : l
    );
    const project = { ...state.project, layers, updatedAt: Date.now() };
    persistCurrent(project);
    set({ project });
  },

  setZone: (id, zone) => {
    const state = get();
    const layers = state.project.layers.map((l) =>
      l.id === id ? ({ ...l, zone } as Layer) : l
    );
    const project = { ...state.project, layers, updatedAt: Date.now() };
    persistCurrent(project);
    set({ project });
  },

  loadProject: (project) => {
    const normalized = normalizeProject(project);
    persistCurrent(normalized);
    set({ project: normalized, selectedLayerId: null, past: [], future: [] });
  },

  loadTemplate: (template) => {
    const project: FolderProject = {
      id: nanoid(8),
      name: template.name,
      baseColor: template.baseColor,
      settings: { ...DEFAULT_FOLDER_SETTINGS },
      layers: template.layers.map((l) => ({ ...(l as Layer), id: nanoid(8) })),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    persistCurrent(project);
    set({ project, selectedLayerId: null, past: [], future: [] });
  },

  resetProject: () => {
    const project = newProject();
    persistCurrent(project);
    set({ project, selectedLayerId: null, past: [], future: [] });
  },

  saveSnapshot: () => {
    const state = get();
    const past = [...state.past, snapshotOf(state.project)].slice(-HISTORY_LIMIT);
    set({ past, future: [] });
  },

  undo: () => {
    const state = get();
    if (state.past.length === 0) return;
    const previous = state.past[state.past.length - 1];
    const past = state.past.slice(0, -1);
    const future = [...state.future, snapshotOf(state.project)].slice(-HISTORY_LIMIT);
    const project = {
      ...state.project,
      ...previous,
      updatedAt: Date.now(),
    };
    persistCurrent(project);
    set({ project, past, future });
  },

  redo: () => {
    const state = get();
    if (state.future.length === 0) return;
    const next = state.future[state.future.length - 1];
    const future = state.future.slice(0, -1);
    const past = [...state.past, snapshotOf(state.project)].slice(-HISTORY_LIMIT);
    const project = {
      ...state.project,
      ...next,
      updatedAt: Date.now(),
    };
    persistCurrent(project);
    set({ project, past, future });
  },

  hydrate: () => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STORAGE_CURRENT);
      if (raw) {
        const parsed = JSON.parse(raw) as FolderProject;
        if (parsed && parsed.id && Array.isArray(parsed.layers)) {
          set({ project: normalizeProject(parsed), hydrated: true });
          return;
        }
      }
    } catch {
      // ignore storage errors
    }
    set({ hydrated: true });
  },

  saveToGallery: (name) => {
    const state = get();
    const gallery = readGallery();
    const filtered = gallery.filter((p) => p.id !== state.project.id);
    const project = {
      ...state.project,
      name: name?.trim() || state.project.name,
      updatedAt: Date.now(),
    };
    persistCurrent(project);
    writeGallery([project, ...filtered]);
    set({ project });
  },

  removeFromGallery: (id) => {
    const gallery = readGallery();
    writeGallery(gallery.filter((p) => p.id !== id));
  },

  duplicateInGallery: (id) => {
    const gallery = readGallery();
    const project = gallery.find((p) => p.id === id);
    if (!project) return;
    const now = Date.now();
    const copy = normalizeProject({
      ...project,
      id: nanoid(8),
      name: `${project.name} copy`,
      createdAt: now,
      updatedAt: now,
      layers: project.layers.map((layer) => ({ ...layer, id: nanoid(8) })),
    });
    writeGallery([copy, ...gallery]);
  },

  getGallery: () => readGallery(),
}));

export { DEFAULT_LAYER_PROPS };
