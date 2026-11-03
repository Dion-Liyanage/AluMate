export interface AluminiumComponent {
  id: string;
  name: string;
  icon: string;
  fabricDefaults: {
    width: number;
    height: number;
    fill: string;
    stroke: string;
    strokeWidth: number;
    rx?: number;
    ry?: number;
    opacity?: number;
  };
}

export interface ProductComponents {
  [productType: string]: AluminiumComponent[];
}

export const aluminiumComponents: ProductComponents = {
  window: [
    {
      id: "frame",
      name: "Frame",
      icon: "🔲",
      fabricDefaults: { width: 300, height: 400, fill: "transparent", stroke: "#525252", strokeWidth: 10 },
    },
    {
      id: "glass-panel",
      name: "Glass Panel",
      icon: "🪟",
      fabricDefaults: { width: 260, height: 360, fill: "#bfdbfe", stroke: "#93c5fd", strokeWidth: 1, opacity: 0.5 },
    },
    {
      id: "horizontal-bar",
      name: "Horizontal Bar",
      icon: "➖",
      fabricDefaults: { width: 260, height: 12, fill: "#a3a3a3", stroke: "#525252", strokeWidth: 2 },
    },
    {
      id: "vertical-bar",
      name: "Vertical Bar",
      icon: "|",
      fabricDefaults: { width: 12, height: 360, fill: "#a3a3a3", stroke: "#525252", strokeWidth: 2 },
    },
    {
      id: "handle",
      name: "Handle",
      icon: "🔘",
      fabricDefaults: { width: 14, height: 60, fill: "#71717a", stroke: "#3f3f46", strokeWidth: 1, rx: 7, ry: 7 },
    },
    {
      id: "hinge",
      name: "Hinge",
      icon: "🔩",
      fabricDefaults: { width: 20, height: 40, fill: "#71717a", stroke: "#3f3f46", strokeWidth: 1 },
    },
    {
      id: "latch",
      name: "Latch",
      icon: "🔒",
      fabricDefaults: { width: 24, height: 24, fill: "#71717a", stroke: "#3f3f46", strokeWidth: 1, rx: 4, ry: 4 },
    },
  ],
  door: [
    {
      id: "frame",
      name: "Frame",
      icon: "🔲",
      fabricDefaults: { width: 200, height: 360, fill: "transparent", stroke: "#525252", strokeWidth: 10 },
    },
    {
      id: "board-panel",
      name: "Board Panel",
      icon: "🧱",
      fabricDefaults: { width: 160, height: 320, fill: "#d4d4d8", stroke: "#a1a1aa", strokeWidth: 2 },
    },
    {
      id: "glass-panel",
      name: "Glass Panel",
      icon: "🪟",
      fabricDefaults: { width: 120, height: 200, fill: "#bfdbfe", stroke: "#93c5fd", strokeWidth: 1, opacity: 0.5 },
    },
    {
      id: "aluminium-bar",
      name: "Aluminium Bar",
      icon: "➖",
      fabricDefaults: { width: 200, height: 10, fill: "#a3a3a3", stroke: "#525252", strokeWidth: 2 },
    },

    {
      id: "handle",
      name: "Handle",
      icon: "🔘",
      fabricDefaults: { width: 20, height: 80, fill: "#71717a", stroke: "#3f3f46", strokeWidth: 1, rx: 7, ry: 7 },
    },
    {
      id: "hinge",
      name: "Hinge",
      icon: "🔩",
      fabricDefaults: { width: 20, height: 40, fill: "#71717a", stroke: "#3f3f46", strokeWidth: 1 },
    },
    {
      id: "label-text",
      name: "Label Text",
      icon: "🔤",
      fabricDefaults: { width: 100, height: 40, fill: "#1f2937", stroke: "transparent", strokeWidth: 0 },
    },
  ],
  cupboard: [
    {
      id: "frame",
      name: "Frame",
      icon: "🔲",
      fabricDefaults: { width: 400, height: 500, fill: "transparent", stroke: "#525252", strokeWidth: 10 },
    },
    {
      id: "shelf",
      name: "Shelf",
      icon: "📦",
      fabricDefaults: { width: 360, height: 14, fill: "#d4d4d8", stroke: "#a1a1aa", strokeWidth: 2 },
    },
    {
      id: "sliding-door",
      name: "Sliding Door",
      icon: "🚪",
      fabricDefaults: { width: 180, height: 460, fill: "#e4e4e7", stroke: "#a1a1aa", strokeWidth: 2 },
    },
    {
      id: "glass-panel",
      name: "Glass Panel",
      icon: "🪟",
      fabricDefaults: { width: 180, height: 300, fill: "#bfdbfe", stroke: "#93c5fd", strokeWidth: 1, opacity: 0.5 },
    },
    {
      id: "divider",
      name: "Divider",
      icon: "📏",
      fabricDefaults: { width: 14, height: 460, fill: "#d4d4d8", stroke: "#a1a1aa", strokeWidth: 1 },
    },
    {
      id: "handle",
      name: "Handle",
      icon: "🔘",
      fabricDefaults: { width: 14, height: 60, fill: "#71717a", stroke: "#3f3f46", strokeWidth: 1, rx: 7, ry: 7 },
    },
  ],
  pantry: [
    {
      id: "frame",
      name: "Frame",
      icon: "🔲",
      fabricDefaults: { width: 400, height: 500, fill: "transparent", stroke: "#525252", strokeWidth: 10 },
    },
    {
      id: "cube",
      name: "Cube",
      icon: "🧊",
      fabricDefaults: { width: 160, height: 160, fill: "#d4d4d8", stroke: "#a1a1aa", strokeWidth: 2 },
    },
    {
      id: "shelf",
      name: "Shelf",
      icon: "📦",
      fabricDefaults: { width: 360, height: 14, fill: "#d4d4d8", stroke: "#a1a1aa", strokeWidth: 2 },
    },
    {
      id: "sliding-door",
      name: "Sliding Door",
      icon: "🚪",
      fabricDefaults: { width: 180, height: 460, fill: "#e4e4e7", stroke: "#a1a1aa", strokeWidth: 2 },
    },
    {
      id: "glass-panel",
      name: "Glass Panel",
      icon: "🪟",
      fabricDefaults: { width: 180, height: 300, fill: "#bfdbfe", stroke: "#93c5fd", strokeWidth: 1, opacity: 0.5 },
    },
    {
      id: "divider",
      name: "Divider",
      icon: "📏",
      fabricDefaults: { width: 14, height: 460, fill: "#d4d4d8", stroke: "#a1a1aa", strokeWidth: 1 },
    },
    {
      id: "handle",
      name: "Handle",
      icon: "🔘",
      fabricDefaults: { width: 14, height: 60, fill: "#71717a", stroke: "#3f3f46", strokeWidth: 1, rx: 7, ry: 7 },
    },
  ],
  partition: [
    {
      id: "frame",
      name: "Frame",
      icon: "🔲",
      fabricDefaults: { width: 500, height: 400, fill: "transparent", stroke: "#525252", strokeWidth: 10 },
    },
    {
      id: "glass-panel",
      name: "Glass Panel",
      icon: "🪟",
      fabricDefaults: { width: 220, height: 360, fill: "#bfdbfe", stroke: "#93c5fd", strokeWidth: 1, opacity: 0.5 },
    },
    {
      id: "aluminium-panel",
      name: "Aluminium Panel",
      icon: "🧱",
      fabricDefaults: { width: 220, height: 360, fill: "#d4d4d8", stroke: "#a1a1aa", strokeWidth: 2 },
    },
    {
      id: "vertical-bar",
      name: "Vertical Bar",
      icon: "|",
      fabricDefaults: { width: 14, height: 360, fill: "#a3a3a3", stroke: "#525252", strokeWidth: 2 },
    },
    {
      id: "horizontal-bar",
      name: "Horizontal Bar",
      icon: "➖",
      fabricDefaults: { width: 460, height: 14, fill: "#a3a3a3", stroke: "#525252", strokeWidth: 2 },
    },
    {
      id: "door-section",
      name: "Door Section",
      icon: "🚪",
      fabricDefaults: { width: 160, height: 360, fill: "#e4e4e7", stroke: "#a1a1aa", strokeWidth: 2 },
    },
  ],
  railing: [
    {
      id: "top-rail",
      name: "Top Rail",
      icon: "➖",
      fabricDefaults: { width: 500, height: 16, fill: "#a3a3a3", stroke: "#525252", strokeWidth: 2 },
    },
    {
      id: "bottom-rail",
      name: "Bottom Rail",
      icon: "➖",
      fabricDefaults: { width: 500, height: 16, fill: "#a3a3a3", stroke: "#525252", strokeWidth: 2 },
    },
    {
      id: "baluster",
      name: "Baluster",
      icon: "|",
      fabricDefaults: { width: 10, height: 200, fill: "#a3a3a3", stroke: "#525252", strokeWidth: 1 },
    },
    {
      id: "post",
      name: "Post",
      icon: "🔩",
      fabricDefaults: { width: 24, height: 240, fill: "#71717a", stroke: "#3f3f46", strokeWidth: 2 },
    },
    {
      id: "glass-panel",
      name: "Glass Panel",
      icon: "🪟",
      fabricDefaults: { width: 200, height: 180, fill: "#bfdbfe", stroke: "#93c5fd", strokeWidth: 1, opacity: 0.5 },
    },
    {
      id: "horizontal-bar",
      name: "Horizontal Bar",
      icon: "➖",
      fabricDefaults: { width: 200, height: 10, fill: "#a3a3a3", stroke: "#525252", strokeWidth: 1 },
    },
  ],
  other: [
    {
      id: "frame",
      name: "Frame",
      icon: "🔲",
      fabricDefaults: { width: 300, height: 400, fill: "transparent", stroke: "#525252", strokeWidth: 10 },
    },
    {
      id: "panel",
      name: "Panel",
      icon: "🧱",
      fabricDefaults: { width: 200, height: 300, fill: "#d4d4d8", stroke: "#a1a1aa", strokeWidth: 2 },
    },
    {
      id: "glass-panel",
      name: "Glass Panel",
      icon: "🪟",
      fabricDefaults: { width: 200, height: 300, fill: "#bfdbfe", stroke: "#93c5fd", strokeWidth: 1, opacity: 0.5 },
    },
    {
      id: "bar",
      name: "Bar",
      icon: "➖",
      fabricDefaults: { width: 300, height: 12, fill: "#a3a3a3", stroke: "#525252", strokeWidth: 2 },
    },
    {
      id: "handle",
      name: "Handle",
      icon: "🔘",
      fabricDefaults: { width: 14, height: 60, fill: "#71717a", stroke: "#3f3f46", strokeWidth: 1, rx: 7, ry: 7 },
    },
    {
      id: "connector",
      name: "Connector",
      icon: "🔩",
      fabricDefaults: { width: 24, height: 24, fill: "#71717a", stroke: "#3f3f46", strokeWidth: 1, rx: 4, ry: 4 },
    },
  ],
};
